export type DataBackend = "local" | "sheets";

/** Apps Script 웹 앱 주소(.../exec). 시트 하나가 곧 데이터베이스다. */
export function sheetsApiUrl(): string {
  return process.env.SHEETS_API_URL || "";
}

/** 그 웹 앱과 나눠 가진 비밀 문자열. 주소를 아는 사람이 함부로 쓰지 못하게 막는다. */
export function sheetsApiToken(): string {
  return process.env.SHEETS_API_TOKEN || "";
}

/**
 * 저장소 선택.
 * - `DATA_BACKEND`를 적어 두면 그 값을 그대로 따른다(로컬에서 파일 저장소로 못 박을 때).
 * - 비워 두면 시트 환경 변수가 갖춰졌는지로 정한다. 배포에는 값만 넣으면 바로 붙는다.
 */
export function getDataBackend(): DataBackend {
  const forced = process.env.DATA_BACKEND;
  if (forced === "local" || forced === "sheets") return forced;
  return sheetsApiUrl() && sheetsApiToken() ? "sheets" : "local";
}

/**
 * 시트로 붙으려는데 빠진 환경 변수.
 * 이 목록이 비어 있지 않으면 배포본은 학생 기록을 어디에도 쓸 수 없다.
 */
export function missingSheetsEnv(): string[] {
  const required: [string, string][] = [
    ["SHEETS_API_URL", sheetsApiUrl()],
    ["SHEETS_API_TOKEN", sheetsApiToken()],
  ];
  return required.filter(([, value]) => !value).map(([key]) => key);
}

/**
 * 서버리스 배포(Vercel 등)는 프로젝트 디렉터리가 읽기 전용이라 파일 저장소를 쓸 수 없다.
 * 여기서 걸러 두지 않으면 첫 등록에서 EROFS가 500으로만 보인다.
 */
export function isReadOnlyDeployment(): boolean {
  return Boolean(process.env.VERCEL);
}
