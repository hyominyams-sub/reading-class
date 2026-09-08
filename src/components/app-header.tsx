"use client";

import Link from "next/link";
import { AdminEntry } from "@/components/admin-entry";
import { buttonVariants } from "@/components/ui/button";
import { IconBook, IconPodium } from "@/components/candy-icons";
import { ProgressDots } from "@/components/progress-dots";
import { useStudent } from "@/lib/student-context";
import { BOOK } from "@/content/book";
import { cn } from "@/lib/utils";

export function AppHeader({
  showBoardLink = true,
  adminEntry = false,
}: {
  showBoardLink?: boolean;
  /** 오른쪽 위에 "QR 없이 들어가기"(관리자 암호) 버튼을 둔다 — 학생 홈에서만 쓴다. */
  adminEntry?: boolean;
}) {
  const { student } = useStudent();
  return (
    <header className="no-print sticky top-0 z-30 bg-card">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-candy-pink text-ink sticker-xs transition-transform group-hover:-rotate-6">
            <IconBook className="size-6" />
          </span>
          <span className="truncate font-heading text-lg">
            독서 미션
            <span className="hidden font-sans text-sm font-medium text-muted-foreground sm:inline"> · {BOOK.title}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {student && (
            <div className="flex items-center gap-2 rounded-full bg-candy-blue py-1 pr-3 pl-3.5 text-sm font-bold text-ink sticker-xs sm:pr-1.5">
              <span className="max-w-20 truncate">{student.name}</span>
              <ProgressDots student={student} size="sm" className="hidden sm:flex" />
            </div>
          )}
          {showBoardLink && (
            <Link
              href="/board"
              aria-label="현황판"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "size-9 gap-1.5 p-0 sm:h-9 sm:w-auto sm:px-3 sm:pl-2.5")}
            >
              <IconPodium className="size-5" />
              <span className="hidden sm:inline">현황판</span>
            </Link>
          )}
          {adminEntry && <AdminEntry />}
        </div>
      </div>
      {/* 사탕 줄무늬 띠 — 밋밋한 1px 보더 대신 */}
      <div className="candy-stripe h-2 border-y-[2.5px] border-ink" />
    </header>
  );
}
