import { getDataBackend, isReadOnlyDeployment, missingSheetsEnv } from "./data-backend";
import * as fileStore from "./store-file";
import * as sheetsStore from "./store-sheets";
import type { MissionId, StudentRecord } from "./types";

/**
 * 학생 기록 저장소.
 *
 * 교실에서는 교사 노트북의 `data/store.json`(파일)으로, 배포본에서는 Google 시트로 붙는다.
 * 어디에 붙을지는 환경 변수만 보고 `data-backend.ts`가 정한다.
 */
type StudentStore = {
  listStudents(): Promise<StudentRecord[]>;
  getStudent(id: string): Promise<StudentRecord | null>;
  createStudent(name: string): Promise<StudentRecord>;
  recordMission(
    id: string,
    mission: MissionId,
    score: number,
    details?: Record<string, unknown>,
  ): Promise<StudentRecord | null>;
  resetStore(): Promise<void>;
};

/**
 * 저장할 곳 자체가 없는 상태.
 * `message`는 학생 화면에 그대로 나가고, `detail`은 서버 로그에만 남긴다.
 */
export class StoreUnavailableError extends Error {
  readonly detail: string;

  constructor(detail: string) {
    super("학생 기록을 저장할 데이터베이스가 아직 연결되지 않았어요. 선생님께 알려 주세요.");
    this.name = "StoreUnavailableError";
    this.detail = detail;
  }
}

function store(): StudentStore {
  if (getDataBackend() === "sheets") {
    const missing = missingSheetsEnv();
    if (missing.length > 0) {
      throw new StoreUnavailableError(`시트 저장소 환경 변수가 없습니다: ${missing.join(", ")}`);
    }
    return sheetsStore;
  }

  // 배포 환경에서 파일 저장소로 내려앉으면 첫 등록이 EROFS로 죽는다. 미리 막고 이유를 남긴다.
  if (isReadOnlyDeployment()) {
    throw new StoreUnavailableError(
      "배포 환경은 data/store.json에 쓸 수 없습니다. SHEETS_API_URL과 SHEETS_API_TOKEN을 설정하세요.",
    );
  }

  return fileStore;
}

export function listStudents(): Promise<StudentRecord[]> {
  return store().listStudents();
}

export function getStudent(id: string): Promise<StudentRecord | null> {
  return store().getStudent(id);
}

export function createStudent(name: string): Promise<StudentRecord> {
  return store().createStudent(name);
}

export function recordMission(
  id: string,
  mission: MissionId,
  score: number,
  details?: Record<string, unknown>,
): Promise<StudentRecord | null> {
  return store().recordMission(id, mission, score, details);
}

export function resetStore(): Promise<void> {
  return store().resetStore();
}
