import { NextResponse } from "next/server";
import { storeFailure } from "@/lib/api";
import { resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await resetStore();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return storeFailure(error);
  }
}
