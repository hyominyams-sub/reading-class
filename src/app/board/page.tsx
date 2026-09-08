import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { BoardView } from "@/components/board/board-view";

export const metadata: Metadata = { title: "내 미션 현황" };

export default function BoardPage() {
  return (
    <>
      <AppHeader showBoardLink={false} />
      <BoardView />
    </>
  );
}
