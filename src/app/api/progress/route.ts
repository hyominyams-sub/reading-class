import { NextResponse } from "next/server";
import { storeFailure } from "@/lib/api";
import { recordMission } from "@/lib/store";
import { isMissionId } from "@/lib/types";

export const dynamic = "force-dynamic";

type Body = {
  studentId?: unknown;
  mission?: unknown;
  score?: unknown;
  details?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const mission = body?.mission;
  const score = typeof body?.score === "number" && Number.isFinite(body.score) ? body.score : 0;
  const details =
    body?.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? (body.details as Record<string, unknown>)
      : undefined;

  if (!studentId || !isMissionId(mission)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const student = await recordMission(studentId, mission, score, details);
    if (!student) {
      return NextResponse.json({ error: "학생 정보를 찾을 수 없어요." }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (error) {
    return storeFailure(error);
  }
}
