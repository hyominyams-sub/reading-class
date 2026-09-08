import { NextResponse } from "next/server";
import { storeFailure } from "@/lib/api";
import { createStudent, listStudents } from "@/lib/store";

export const dynamic = "force-dynamic";

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
