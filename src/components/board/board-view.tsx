"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrow, IconMedal, IconUsers } from "@/components/candy-icons";
import { buttonVariants } from "@/components/ui/button";
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

export function BoardView() {
  const { student } = useStudent();
  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

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
  const clearedCount = list.filter(isCleared).length;
  const totalDone = list.reduce((sum, s) => sum + completedCount(s), 0);
  const totalSlots = list.length * MISSION_IDS.length;
  const pct = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
  const mine = student ? (list.find((s) => s.id === student.id) ?? student) : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-heading text-primary-strong">{BOOK.title}</p>
          <h1 className="font-heading text-4xl sm:text-5xl">우리 반 미션 현황</h1>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn("size-2.5 rounded-full", failed ? "bg-destructive" : "bg-candy-mint")} />
          {failed ? "연결을 확인하는 중…" : "3초마다 자동 새로고침"}
        </p>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="요약">
        <Stat icon={<IconUsers className="size-7" />} label="참여" value={`${list.length}명`} />
        <Stat icon={<IconMedal className="size-7" />} label="클리어" value={`${clearedCount}명`} accent />
        <div className="rounded-3xl bg-card p-4 sticker">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>전체 진행률</span>
            <span className="text-base font-bold text-foreground tabular-nums">{pct}%</span>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full border-2 border-ink bg-card" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-candy-pink transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            미션 {totalDone}개 완료 / 전체 {totalSlots}개
          </p>
        </div>
      </section>

      {mine && <MyProgress student={mine} />}

      <section className="mt-8">
        <h2 className="font-heading text-2xl">친구들</h2>
        {students === null ? (
          <p className="mt-4 text-muted-foreground">불러오는 중…</p>
        ) : list.length === 0 ? (
          <div className="mt-4 rounded-3xl border-[3px] border-dashed border-ink/35 bg-card/70 p-8 text-center text-muted-foreground">
            아직 참여한 친구가 없어요. QR을 찍고 이름을 입력하면 여기에 나타나요.
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sortStudents(list).map((s) => (
              <StudentCard key={s.id} student={s} highlight={student?.id === s.id} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-3xl p-4 sticker", accent ? "bg-candy-yellow" : "bg-card")}>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink text-ink", accent ? "bg-card" : "bg-candy-blue")}>{icon}</span>
      <div>
        <p className={cn("text-sm font-medium", accent ? "text-ink/70" : "text-muted-foreground")}>{label}</p>
        <p className="font-heading text-3xl tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function MyProgress({ student }: { student: StudentRecord }) {
  const remaining = MISSION_IDS.filter((id) => !student.missions[id]);
  const cleared = remaining.length === 0;
  return (
    <section className="mt-6 rounded-3xl bg-candy-cream p-5 sticker" aria-label="내 진행">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProgressDots student={student} size="lg" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">내 진행</p>
            <p className="font-heading text-xl">
              {student.name} · {completedCount(student)}/{MISSION_IDS.length} 완료
            </p>
          </div>
        </div>
        {cleared ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-candy-mint px-4 py-1.5 font-heading text-ink sticker-xs">
            <IconMedal className="size-5" /> 모든 미션 클리어!
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {remaining.map((id) => (
              <Link key={id} href={`/mission/${id}`} className={cn(buttonVariants({ size: "lg" }))}>
                미션 {id} 하러 가기
                <IconArrow data-icon="inline-end" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StudentCard({ student, highlight }: { student: StudentRecord; highlight: boolean }) {
  const cleared = isCleared(student);
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-3xl bg-card p-4 sticker transition-colors",
        cleared && "bg-candy-mint",
        highlight && "bg-candy-yellow",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate font-heading text-xl">{student.name}</p>
        {cleared && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-card px-2 py-0.5 text-xs font-bold text-ink">
            <IconMedal className="size-4" /> 클리어
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <ProgressDots student={student} size="sm" className="shrink-0" />
        <span className="shrink-0 text-sm font-bold text-ink/70 tabular-nums">
          {completedCount(student)}/{MISSION_IDS.length}
        </span>
      </div>
      <div className="flex gap-1">
        {MISSION_IDS.map((id) => (
          <span
            key={id}
            className={cn("h-2.5 flex-1 rounded-full border-2 border-ink", student.missions[id] ? "bg-candy-pink" : "bg-card")}
            title={MISSIONS[id].title}
          />
        ))}
      </div>
    </li>
  );
}
