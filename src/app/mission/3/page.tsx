import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Mission3 } from "@/components/missions/mission-3";
import { MISSIONS } from "@/content/book";

export const metadata: Metadata = { title: `미션 3 · ${MISSIONS[3].title}` };

export default function Mission3Page() {
  return (
    <>
      <AppHeader />
      <Mission3 />
    </>
  );
}
