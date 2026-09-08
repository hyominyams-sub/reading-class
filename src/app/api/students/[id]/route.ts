import { NextResponse } from "next/server";
import { storeFailure } from "@/lib/api";
import { getStudent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const student = await getStudent(id);
    if (!student) {
      return NextResponse.json({ error: "학생 정보를 찾을 수 없어요." }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (error) {
    return storeFailure(error);
  }
}
