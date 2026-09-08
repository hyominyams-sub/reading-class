"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MissionId, StudentRecord } from "./types";

const STORAGE_KEY = "reading-class:student";

type Stored = { id: string; name: string };
type Status = "loading" | "anonymous" | "ready";

type StudentContextValue = {
  student: StudentRecord | null;
  status: Status;
  /** 등록이 뒤늦게 실패했을 때의 사유. 이름 화면으로 되돌아오며 이 문장을 보여 준다. */
  registerError: string | null;
  register: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
  complete: (mission: MissionId, score: number, details?: Record<string, unknown>) => Promise<StudentRecord>;
  signOut: () => void;
};

const StudentContext = createContext<StudentContextValue | null>(null);

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (typeof parsed.id === "string" && typeof parsed.name === "string") {
      return { id: parsed.id, name: parsed.name };
    }
  } catch {
    /* localStorage를 쓸 수 없는 환경 */
  }
  return null;
}

function writeStored(value: Stored | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [registerError, setRegisterError] = useState<string | null>(null);
  /** 아직 서버 응답을 기다리는 등록. 미션을 저장하려면 여기서 나온 아이디가 필요하다. */
  const pendingRegister = useRef<Promise<StudentRecord> | null>(null);

  const refresh = useCallback(async () => {
    const stored = readStored();
    if (!stored) {
      setStudent(null);
      setStatus("anonymous");
      return;
    }
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(stored.id)}`, { cache: "no-store" });
      if (res.status === 404) {
        // 서버가 초기화된 경우: 다시 이름을 입력하도록 한다.
        writeStored(null);
        setStudent(null);
        setStatus("anonymous");
        return;
      }
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as { student: StudentRecord };
      setStudent(data.student);
      setStatus("ready");
    } catch {
      // 네트워크가 잠시 끊겨도 앱은 계속 쓸 수 있게 로컬 정보로 버틴다.
      setStudent((prev) => prev ?? { id: stored.id, name: stored.name, createdAt: "", missions: {} });
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  /**
   * 등록.
   *
   * 구글 시트에 한 줄 쓰는 데 2초쯤 걸린다. 아이를 이름 화면에 세워 두지 않고
   * 먼저 넘긴 뒤, 서버가 준 진짜 기록으로 조용히 바꿔 끼운다. 아이디가 없는 동안은
   * 미션을 끝낼 수 없는데, 그 사이(2초)에 미션을 깨는 일은 없다. 혹시 있더라도
   * `complete`가 등록이 끝날 때까지 기다린다.
   */
  const register = useCallback(async (name: string) => {
    setRegisterError(null);
    setStudent({ id: "", name, createdAt: "", missions: {} });
    setStatus("ready");

    const task = (async () => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await readError(res, "등록에 실패했어요. 다시 시도해 주세요."));
      const data = (await res.json()) as { student: StudentRecord };
      writeStored({ id: data.student.id, name: data.student.name });
      setStudent(data.student);
      return data.student;
    })();

    pendingRegister.current = task;

    task.catch((error: unknown) => {
      // 조용히 넘어가면 아이가 미션을 다 풀고 나서야 기록이 없다는 걸 알게 된다.
      // 이름 화면으로 되돌리고 이유를 보여 준다.
      if (pendingRegister.current !== task) return;
      setRegisterError(error instanceof Error ? error.message : "등록에 실패했어요. 다시 시도해 주세요.");
      setStudent(null);
      setStatus("anonymous");
    });
  }, []);

  const complete = useCallback(
    async (mission: MissionId, score: number, details?: Record<string, unknown>) => {
      if (!student) throw new Error("학생 정보가 없어요.");

      // 등록이 아직 날아가는 중이면 아이디가 없다. 끝날 때까지 기다린다.
      let studentId = student.id;
      if (!studentId) {
        const registered = await pendingRegister.current;
        if (!registered) throw new Error("학생 정보가 없어요.");
        studentId = registered.id;
      }

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, mission, score, details }),
      });
      if (res.status === 404) {
        writeStored(null);
        setStudent(null);
        setStatus("anonymous");
        throw new Error("학생 정보가 초기화되었어요. 이름을 다시 입력해 주세요.");
      }
      if (!res.ok) throw new Error(await readError(res, "기록 저장에 실패했어요."));
      const data = (await res.json()) as { student: StudentRecord };
      setStudent(data.student);
      return data.student;
    },
    [student],
  );

  const signOut = useCallback(() => {
    writeStored(null);
    setStudent(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<StudentContextValue>(
    () => ({ student, status, registerError, register, refresh, complete, signOut }),
    [student, status, registerError, register, refresh, complete, signOut],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent는 StudentProvider 안에서만 사용할 수 있어요.");
  return ctx;
}
