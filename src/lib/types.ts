import { CURRENT_CONTENT_VERSION, CURRENT_SCHEMA_VERSION } from "@/content/lesson-version";

export type MissionId = 1 | 2 | 3;
export const MISSION_IDS: readonly MissionId[] = [1, 2, 3] as const;

export type MissionResult = {
  completedAt: string;
  score: number;
  attempts: number;
  details?: Record<string, unknown>;
  /** 콘텐츠가 바뀌어도 이전 기록을 보존할 수 있도록 선택적으로 저장합니다. */
  contentVersion?: string;
  schemaVersion?: number;
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
  return MISSION_IDS.filter((id) => Boolean(currentMissionResult(student, id))).length;
}

export function isCleared(student: StudentRecord): boolean {
  return completedCount(student) === MISSION_IDS.length;
}

export function nextMission(student: StudentRecord): MissionId | null {
  return MISSION_IDS.find((id) => !currentMissionResult(student, id)) ?? null;
}

export function isCurrentMissionResult(result?: MissionResult): boolean {
  const details = result?.details;
  const contentVersion = typeof details?.contentVersion === "string" ? details.contentVersion : result?.contentVersion;
  const schemaVersion = typeof details?.schemaVersion === "number" ? details.schemaVersion : result?.schemaVersion;
  return (
    contentVersion === CURRENT_CONTENT_VERSION &&
    schemaVersion === CURRENT_SCHEMA_VERSION
  );
}

export function currentMissionResult(student: StudentRecord, id: MissionId): MissionResult | undefined {
  const result = student.missions[id];
  return isCurrentMissionResult(result) ? result : undefined;
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
  | "ddungi-choice"
  | "runner"
  | "jangdae-conflict"
  | "jangdae-listening"
  | "jangdae-reconciliation"
  | "boksagol-question"
  | "ancient-document"
  | "beomam-story"
  | "today-typhoon"
  | "treasure-reflection";

export type RunnerQuestion = {
  id?: string;
  scene?: SceneKey;
  q: string;
  options: string[];
  answer: number;
  explain?: string;
};

export type AdventureChoice = {
  id?: string;
  text: string;
  correct: boolean;
  next?: string;
  feedback: string;
};

export type AdventureScene = {
  id: string;
  title: string;
  scene: SceneKey;
  prompt?: string;
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
  prompt?: string;
  placeholder?: string;
  experienceHint?: string;
};
