import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Mission1 } from "@/components/missions/mission-1";
import { MISSIONS } from "@/content/book";

export const metadata: Metadata = { title: `미션 1 · ${MISSIONS[1].title}` };

export default function Mission1Page() {
  return (
    <>
      <AppHeader />
      <Mission1 />
    </>
  );
}
