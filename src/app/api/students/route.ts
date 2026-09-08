import { NextResponse } from "next/server";
import { storeFailure } from "@/lib/api";
import { createStudent, listStudents } from "@/lib/store";

export const dynamic = "force-dynamic";

// 30명이 한꺼번에 등록하면 시트 잠금 줄에서 30초 넘게 기다리는 요청이 생긴다.
// 배포 플랫폼의 기본 실행 시간 제한에 걸려 잘리면, 시트에는 저장됐는데 앱은
// 실패로 답해 아이가 이름을 다시 입력하고 행이 두 줄 생긴다.
export const maxDuration = 60;

export async function GET() {
  try {
    const students = await listStudents();
    return NextResponse.json({ students });
  } catch (error) {
    return storeFailure(error);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 1 || name.length > 12) {
    return NextResponse.json({ error: "이름은 1~12자로 입력해 주세요." }, { status: 400 });
  }
  try {
    const student = await createStudent(name);
    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    return storeFailure(error);
  }
}
