import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { MissionId, StoreData, StudentRecord } from "./types";

/**
 * 파일 기반 저장소 (data/store.json).
 * 교실에서 교사 노트북 한 대가 서버가 되는 상황을 가정한 단순 구조.
 * 쓰기 작업은 프로세스 안에서 직렬화해 동시 요청에도 파일이 깨지지 않도록 한다.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "store.json");

let chain: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.catch(() => undefined);
  return run;
}

async function load(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return { students: parsed.students ?? {} };
  } catch {
    return { students: {} };
  }
}

async function save(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

export function newId(): string {
  return randomBytes(6).toString("base64url");
}

export async function listStudents(): Promise<StudentRecord[]> {
  const data = await load();
  return Object.values(data.students).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getStudent(id: string): Promise<StudentRecord | null> {
  const data = await load();
  return data.students[id] ?? null;
}

export async function createStudent(name: string): Promise<StudentRecord> {
  return serialize(async () => {
    const data = await load();
    let id = newId();
    while (data.students[id]) id = newId();
    const student: StudentRecord = { id, name, createdAt: new Date().toISOString(), missions: {} };
    data.students[id] = student;
    await save(data);
    return student;
  });
}

export async function recordMission(
  id: string,
  mission: MissionId,
  score: number,
  details?: Record<string, unknown>,
): Promise<StudentRecord | null> {
  return serialize(async () => {
    const data = await load();
    const student = data.students[id];
    if (!student) return null;
    const prev = student.missions[mission];
    student.missions[mission] = {
      completedAt: new Date().toISOString(),
      score: Math.round(score),
      attempts: (prev?.attempts ?? 0) + 1,
      details,
    };
    await save(data);
    return student;
  });
}

export async function resetStore(): Promise<void> {
  return serialize(async () => {
    await save({ students: {} });
  });
}
