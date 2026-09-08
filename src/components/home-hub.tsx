"use client";

import Link from "next/link";
import { SceneIllustration } from "@/components/illustrations/scene";
import { ProgressDots } from "@/components/progress-dots";
import { IconArrow, IconCheck, IconLollipop, IconStar, MISSION_ICONS } from "@/components/candy-icons";
import { useStudent } from "@/lib/student-context";
import { BOOK, MISSIONS } from "@/content/book";
import { completedCount, isCleared, MISSION_IDS, type MissionId, type StudentRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 미션마다 고유한 사탕 색을 준다 — 카드가 서로 구분되도록. */
const MISSION_TONE: Record<MissionId, string> = {
  1: "bg-candy-pink",
  2: "bg-candy-blue",
  3: "bg-candy-lilac",
};

export function HomeHub() {
  const { student, signOut } = useStudent();
  if (!student) return null;
  const done = completedCount(student);
  const cleared = isCleared(student);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-card sticker">
        <div className="aspect-[21/9] border-b-[3px] border-ink">
          <SceneIllustration scene="book" className="h-full w-full" />
        </div>
        <div className="p-6 sm:p-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-candy-yellow px-3 py-1 text-sm font-bold text-ink sticker-xs">
            <IconStar className="size-4" />
            오늘의 책
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-tight">{BOOK.title}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{BOOK.synopsis[0]}</p>
          <details className="group mt-2">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-bold text-primary-strong hover:underline">
              줄거리 더 보기
              <span className="transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="mt-2 space-y-2 leading-relaxed text-muted-foreground">
              {BOOK.synopsis.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>

          <div className="mt-6 rounded-2xl bg-candy-cream px-4 py-3 sticker-sm">
            <p className="truncate text-sm font-medium text-muted-foreground">{student.name} 님의 진행</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-heading text-xl whitespace-nowrap text-ink">
                {done}/{MISSION_IDS.length} 완료{cleared && " · 클리어!"}
              </p>
              <ProgressDots student={student} size="lg" className="shrink-0" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 mb-4 flex items-center gap-2">
        <IconLollipop className="size-7 text-ink candy-bob" />
        <h2 className="font-heading text-2xl">미션 세 개, 골라서 시작!</h2>
      </div>

      <section className="grid gap-5" aria-label="미션 목록">
        {MISSION_IDS.map((id, i) => (
          <MissionCard key={id} id={id} student={student} tilt={i % 2 === 0 ? "tilt-l" : "tilt-r"} />
        ))}
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={signOut}
          className="font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          다른 이름으로 시작하기
        </button>
        <nav className="flex gap-2">
          {[
            { href: "/board", label: "현황판" },
            { href: "/qr", label: "QR 인쇄" },
            { href: "/teacher", label: "교사용" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full bg-card px-3 py-1 font-semibold text-ink sticker-xs sticker-press"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}

function MissionCard({ id, student, tilt }: { id: MissionId; student: StudentRecord; tilt: string }) {
  const info = MISSIONS[id];
  const done = student.missions[id];
  const Icon = MISSION_ICONS[info.icon];
  return (
    <Link
      href={`/mission/${id}`}
      className="group flex items-center gap-4 rounded-3xl bg-card p-4 sticker sticker-hover sm:gap-5 sm:p-5"
    >
      <span
        className={cn(
          "grid size-16 shrink-0 place-items-center rounded-2xl border-[3px] border-ink text-ink transition-transform group-hover:rotate-3",
          tilt,
          done ? "bg-candy-mint" : MISSION_TONE[id],
        )}
      >
        {done ? <IconCheck className="size-8" /> : <Icon className="size-10" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-heading text-primary-strong">미션 {id}</span>
          <span className="font-medium text-muted-foreground">{info.subtitle}</span>
          <span className="ml-auto shrink-0 rounded-full bg-candy-cream px-2.5 py-0.5 text-xs font-bold text-ink/70">
            {info.minutes}
          </span>
        </span>
        <span className="mt-0.5 block font-heading text-xl leading-snug">{info.title}</span>
        {done && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-candy-mint px-2 py-0.5 text-xs font-bold text-ink">
            완료 · {done.score}점
          </span>
        )}
      </span>
      <IconArrow className="size-6 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
