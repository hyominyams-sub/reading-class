"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrow, IconMedal, IconUsers, MISSION_ICONS } from "@/components/candy-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { MyMissions } from "@/components/board/my-missions";
import { ProgressDots } from "@/components/progress-dots";
import { useStudent } from "@/lib/student-context";
import { BOOK, MISSIONS } from "@/content/book";
import { completedCount, isCleared, MISSION_IDS, type StudentRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_MS = 3000;

function sortStudents(list: StudentRecord[]): StudentRecord[] {
  return [...list].sort((a, b) => {
    const ca = completedCount(a);
    const cb = completedCount(b);
    if (ca !== cb) return cb - ca;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/**
 * 현황판 = 먼저 "내 기록", 그 다음 "우리 반".
 * 학생은 태블릿으로 자기 결과를 확인하러 오므로 화면 위쪽 전체를 내 미션에 준다.
 * 반 전체 현황은 아래에 접힌 채로 두고 필요할 때만 펼친다.
 */
export function BoardView() {
  const { student, mode } = useStudent();
  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/students", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as { students: StudentRecord[] };
        if (!alive) return;
        setStudents(data.students);
        setFailed(false);
      } catch {
        if (alive) setFailed(true);
      }
    };
    void tick();
    const timer = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const list = students ?? [];
  // 서버 기록이 있으면 그쪽이 최신, 없으면 로컬 정보로라도 내 진행을 보여 준다.
  const mine = mode === "student" && student ? (list.find((s) => s.id === student.id) ?? student) : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm text-primary-strong">{BOOK.title}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn("size-2.5 rounded-full", failed ? "bg-destructive" : "bg-candy-mint")} />
          {failed ? "연결을 확인하는 중…" : "3초마다 자동 새로고침"}
        </p>
      </div>

      {mine ? <MyMissions student={mine} /> : mode === "guest" ? <GuestPrompt /> : <JoinPrompt />}

      {/* 내 기록과 반 현황을 가르는 사탕 띠 */}
      <div className="candy-stripe my-7 h-3 rounded-full border-[2.5px] border-ink sm:my-9" />

      <ClassSection
        list={list}
        loading={students === null}
        myId={mine?.id}
        open={showFriends || !mine}
        onToggle={mine ? () => setShowFriends((v) => !v) : null}
      />
    </main>
  );
}

/** 로그인하지 않은 태블릿 — 학생 선택 화면으로 안내한다. */
function JoinPrompt() {
  return (
    <section className="rounded-3xl bg-candy-cream p-6 sticker sm:p-8">
      <h1 className="font-heading text-4xl leading-tight sm:text-5xl">내 미션 카드</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink/75">
        내 이름을 고르고 미션을 시작하면, 내가 푼 퀴즈와 내가 쓴 일기가 여기에 모여요.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "xl" }), "mt-5 w-full sm:w-auto")}>
        학생 로그인하기
        <IconArrow data-icon="inline-end" />
      </Link>
    </section>
  );
}

function GuestPrompt() {
  return (
    <section className="rounded-3xl bg-candy-blue p-6 sticker sm:p-8">
      <h1 className="font-heading text-4xl leading-tight sm:text-5xl">우리 반 미션 보기</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink/75">친구들의 진행을 살펴보고, 원하는 게임을 직접 체험해 보세요.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {MISSION_IDS.map((id) => {
          const Icon = MISSION_ICONS[MISSIONS[id].icon];
          return (
            <Link key={id} href={`/mission/${id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-card")}>
              <Icon data-icon="inline-start" />
              게임 {id}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ClassSection({
  list,
  loading,
  myId,
  open,
  onToggle,
}: {
  list: StudentRecord[];
  loading: boolean;
  myId?: string;
  open: boolean;
  onToggle: (() => void) | null;
}) {
  const clearedCount = list.filter(isCleared).length;
  const totalDone = list.reduce((sum, s) => sum + completedCount(s), 0);
  const totalSlots = list.length * MISSION_IDS.length;
  const pct = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;

  return (
    <section className="rounded-3xl bg-card/80 p-4 sticker-sm sm:p-5" aria-labelledby="class-heading">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink bg-candy-blue text-ink">
          <IconUsers className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="class-heading" className="font-heading text-xl">
            우리 반
          </h2>
          <p className="text-sm text-muted-foreground">
            참여 {list.length}명 · 클리어 {clearedCount}명 · 전체 진행률 {pct}%
          </p>
        </div>
        {onToggle && (
          <Button variant="outline" size="lg" onClick={onToggle} aria-expanded={open}>
            {open ? "접기" : `친구들 보기 (${list.length})`}
          </Button>
        )}
      </div>

      <div
        className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-card"
        role="progressbar"
        aria-label="우리 반 전체 진행률"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-candy-pink transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {open && (
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">불러오는 중…</p>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border-[2.5px] border-dashed border-ink/35 p-5 text-center text-sm text-muted-foreground">
              아직 참여한 친구가 없어요. QR을 찍고 학생 로그인을 하면 여기에 나타나요.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {sortStudents(list).map((s) => (
                <FriendChip key={s.id} student={s} isMe={s.id === myId} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function FriendChip({ student, isMe }: { student: StudentRecord; isMe: boolean }) {
  const cleared = isCleared(student);
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-2xl bg-card px-3 py-2 sticker-xs",
        cleared && "bg-candy-mint",
        isMe && "bg-candy-yellow",
      )}
    >
      <span className="truncate font-heading text-base">{student.name}</span>
      {isMe && <span className="shrink-0 rounded-full border-2 border-ink bg-card px-1.5 text-xs font-bold text-ink">나</span>}
      {cleared && !isMe && <IconMedal className="size-5 shrink-0 text-ink" />}
      <ProgressDots student={student} size="sm" className="ml-auto shrink-0" />
    </li>
  );
}
