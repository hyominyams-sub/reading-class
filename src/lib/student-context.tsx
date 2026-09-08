"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MissionId, StudentRecord } from "./types";

const STORAGE_KEY = "reading-class:student";

type Stored = { id: string; name: string };
type Status = "loading" | "anonymous" | "ready";

type StudentContextValue = {
  student: StudentRecord | null;
  status: Status;
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

  const register = useCallback(async (name: string) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(await readError(res, "등록에 실패했어요. 다시 시도해 주세요."));
    const data = (await res.json()) as { student: StudentRecord };
    writeStored({ id: data.student.id, name: data.student.name });
    setStudent(data.student);
    setStatus("ready");
  }, []);

  const complete = useCallback(
    async (mission: MissionId, score: number, details?: Record<string, unknown>) => {
      if (!student) throw new Error("학생 정보가 없어요.");
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, mission, score, details }),
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
    () => ({ student, status, register, refresh, complete, signOut }),
    [student, status, register, refresh, complete, signOut],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent는 StudentProvider 안에서만 사용할 수 있어요.");
  return ctx;
}
