import { NextResponse } from "next/server";
import { StoreUnavailableError } from "./store";

/**
 * 라우트 핸들러의 마지막 방어선.
 * 저장소가 없거나 DB가 거절한 경우를 학생 화면에 읽히는 문장으로 바꾼다.
 * (그냥 던지면 화면에는 "등록에 실패했어요"만 뜨고 원인은 아무 데도 남지 않는다.)
 */
export function storeFailure(error: unknown): NextResponse {
  if (error instanceof StoreUnavailableError) {
    console.error("[store] 저장소가 준비되지 않음:", error.detail);
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  console.error("[store] 저장소 작업 실패:", error);
  return NextResponse.json(
    { error: "기록을 저장하지 못했어요. 잠시 뒤에 다시 시도해 주세요." },
    { status: 500 },
  );
}
