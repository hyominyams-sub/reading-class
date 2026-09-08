import { sheetsApiToken, sheetsApiUrl } from "./data-backend";
import { newId } from "./ids";
import { isMissionId, type MissionId, type MissionResult, type StudentRecord } from "./types";

/**
 * Google 시트 저장소.
 * 시트에 붙여 둔 Apps Script 웹 앱(`scripts/sheets-api.gs`)을 작은 JSON API로 부른다.
 * 기록이 그대로 시트에 쌓이므로 선생님이 스프레드시트만 열어도 결과를 볼 수 있다.
 */

/**
 * 읽기 캐시.
 * `/board`는 3초, `/teacher`는 5초마다 목록을 부른다. 태블릿 수만큼 곱해지면 Apps Script
 * 하루 실행 시간을 금방 태우므로, 위로 올려 보내는 요청만 잠깐 묶는다.
 */
const READ_TTL_MS = 5000;

type RawRecord = {
  id: string;
  name: string;
  createdAt: string;
  missions: Record<string, MissionResult> | null;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
  students?: RawRecord[];
  student?: RawRecord | null;
};

let cache: { at: number; students: StudentRecord[] } | null = null;

function cached(): StudentRecord[] | null {
  return cache && Date.now() - cache.at < READ_TTL_MS ? cache.students : null;
}

async function call(action: string, params: Record<string, unknown> = {}): Promise<ApiResponse> {
  let res: Response;
  try {
    res = await fetch(sheetsApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sheetsApiToken(), action, ...params }),
      cache: "no-store",
      // 시트 쓰기는 1~2초씩 걸린다. 그래도 안 오면 매달려 있지 말고 끊는다.
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(`시트 API에 연결하지 못했습니다: ${error instanceof Error ? error.message : String(error)}`);
  }

  const text = await res.text();
  let data: ApiResponse;
  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    // 배포 설정이 틀리면 구글이 JSON 대신 로그인 안내 HTML을 돌려준다.
    throw new Error(
      `시트 API가 JSON이 아닌 응답(HTTP ${res.status})을 돌려줬습니다. ` +
        "웹 앱 배포의 액세스 권한이 '모든 사용자'인지, SHEETS_API_URL이 /exec으로 끝나는지 확인하세요.",
    );
  }

  if (!data.ok) {
    if (data.error === "unauthorized") throw new Error("시트 API 토큰이 맞지 않습니다(SHEETS_API_TOKEN).");
    throw new Error(data.error ?? "시트 API가 요청을 거절했습니다.");
  }
  return data;
}

/** JSON의 미션 키는 문자열("1")이라 앱이 쓰는 번호로 되돌린다 */
function toRecord(raw: RawRecord): StudentRecord {
  const missions: StudentRecord["missions"] = {};
  for (const [key, value] of Object.entries(raw.missions ?? {})) {
    const mission = Number(key);
    if (isMissionId(mission) && value) missions[mission] = value;
  }
  return { id: raw.id, name: raw.name, createdAt: raw.createdAt, missions };
}

export async function listStudents(): Promise<StudentRecord[]> {
  const hit = cached();
  if (hit) return hit;

  const { students } = await call("list");
  const records = (students ?? []).map(toRecord);
  cache = { at: Date.now(), students: records };
  return records;
}

export async function getStudent(id: string): Promise<StudentRecord | null> {
  const hit = cached()?.find((student) => student.id === id);
  if (hit) return hit;

  // 캐시에 없다고 바로 "없는 학생"이라고 답하면, 다른 인스턴스에서 방금 등록한
  // 아이의 이름 입력이 초기화된다. 없을 때는 시트에 직접 물어본다.
  const { student } = await call("get", { id });
  return student ? toRecord(student) : null;
}

export async function createStudent(name: string): Promise<StudentRecord> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    let data: ApiResponse;
    try {
      data = await call("create", { id, name });
    } catch (error) {
      if (error instanceof Error && error.message === "duplicate") continue;
      throw error;
    }
    cache = null;
    if (data.student) return toRecord(data.student);
  }
  throw new Error("겹치지 않는 학생 아이디를 만들지 못했습니다.");
}

export async function recordMission(
  id: string,
  mission: MissionId,
  score: number,
  details?: Record<string, unknown>,
): Promise<StudentRecord | null> {
  const { student } = await call("record", { id, mission: String(mission), score, details });
  cache = null;
  return student ? toRecord(student) : null;
}

export async function resetStore(): Promise<void> {
  await call("reset");
  cache = null;
}
