import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Mission2 } from "@/components/missions/mission-2";
import { MISSIONS } from "@/content/book";

export const metadata: Metadata = { title: `미션 2 · ${MISSIONS[2].title}` };

export default function Mission2Page() {
  return (
    <>
      <AppHeader />
      <Mission2 />
    </>
  );
}
