export type MissionId = 1 | 2 | 3;
export const MISSION_IDS: readonly MissionId[] = [1, 2, 3] as const;

export type MissionResult = {
  completedAt: string;
  score: number;
  attempts: number;
  details?: Record<string, unknown>;
};

export type StudentRecord = {
  id: string;
  name: string;
  createdAt: string;
  missions: Partial<Record<MissionId, MissionResult>>;
};

export type StoreData = {
  students: Record<string, StudentRecord>;
};

export function isMissionId(value: unknown): value is MissionId {
  return value === 1 || value === 2 || value === 3;
}

export function completedCount(student: StudentRecord): number {
  return MISSION_IDS.filter((id) => Boolean(student.missions[id])).length;
}

export function isCleared(student: StudentRecord): boolean {
  return completedCount(student) === MISSION_IDS.length;
}

export function nextMission(student: StudentRecord): MissionId | null {
  return MISSION_IDS.find((id) => !student.missions[id]) ?? null;
}

/* ---------- 콘텐츠 타입 ---------- */

export type SceneKey =
  | "classroom"
  | "lunch"
  | "umbrella"
  | "art"
  | "rumor"
  | "rain"
  | "ending"
  | "diary-night"
  | "book"
  | "runner";

export type RunnerQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
};

export type AdventureChoice = {
  text: string;
  correct: boolean;
  next?: string;
  feedback: string;
};

export type AdventureScene = {
  id: string;
  title: string;
  scene: SceneKey;
  text: string[];
  choices?: AdventureChoice[];
  ending?: boolean;
};

export type WritingScene = {
  id: string;
  label: string;
  who: string;
  scene: SceneKey;
  situation: string;
  hint: string;
};

export type WritingConfig = {
  title: string;
  intro: string;
  scenes: WritingScene[];
  feelings: string[];
  starters: string[];
  minChars: number;
};
