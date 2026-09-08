"use client";

import Link from "next/link";
import { SceneIllustration } from "@/components/illustrations/scene";
import { ProgressDots } from "@/components/progress-dots";
import { QrScanButton } from "@/components/qr-scan";
import { IconCheck, IconLollipop, IconQr, IconStar, MISSION_ICONS } from "@/components/candy-icons";
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
  const { student, mode, signOut } = useStudent();
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

          {mode === "guest" ? (
            <div className="mt-6 rounded-2xl bg-candy-blue px-4 py-3 sticker-sm">
              <p className="font-heading text-xl text-ink">게스트로 둘러보는 중</p>
              <p className="mt-0.5 text-sm text-ink/70">아래 게임을 자유롭게 눌러 체험할 수 있어요.</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-candy-cream px-4 py-3 sticker-sm">
              <p className="truncate text-sm font-medium text-muted-foreground">{student.name} 학생의 진행</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="font-heading text-xl whitespace-nowrap text-ink">
                  {done}/{MISSION_IDS.length} 완료{cleared && " · 클리어!"}
                </p>
                <ProgressDots student={student} size="lg" className="shrink-0" />
              </div>
            </div>
          )}
        </div>
      </section>

      {mode === "student" && <section className="mt-8 rounded-3xl bg-card p-6 text-center sticker sm:p-8">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border-[3px] border-ink bg-candy-blue text-ink candy-bob tilt-r">
          <IconQr className="size-10" />
        </span>
        <h2 className="mt-4 font-heading text-2xl">게임은 QR을 찍고 들어가요</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          교실에 붙어 있는 <b className="highlight font-semibold text-ink">미션 QR</b>을 찾아서 찍으면 그 게임이 바로 열려요.
        </p>
        <QrScanButton className="mt-5 w-full" />
        <p className="mt-2 text-xs text-muted-foreground">카메라를 써도 되냐고 물으면 “허용”을 눌러 주세요.</p>
      </section>}

      <div className="mt-8 mb-4 flex items-center gap-2">
        <IconLollipop className="size-7 text-ink candy-bob" />
        <h2 className="font-heading text-2xl">미션 세 개, 찾아서 도전!</h2>
      </div>

      <section className="grid gap-5" aria-label="미션 목록">
        {MISSION_IDS.map((id, i) => (
          <MissionCard key={id} id={id} student={student} guest={mode === "guest"} tilt={i % 2 === 0 ? "tilt-l" : "tilt-r"} />
        ))}
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={signOut}
          className="font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "guest" ? "게스트 나가기" : "다른 학생으로 시작하기"}
        </button>
        {/* QR 인쇄·교사용은 오른쪽 위 "QR 없이 들어가기"(관리자 암호) 안에 있다. */}
        <Link
          href="/board"
          className="rounded-full bg-card px-3 py-1 font-semibold text-ink sticker-xs sticker-press"
        >
          현황판
        </Link>
      </footer>
    </main>
  );
}

/** 미션 카드는 안내판이다 — 들어가는 문은 교실에 붙은 QR뿐. */
function MissionCard({ id, student, guest, tilt }: { id: MissionId; student: StudentRecord; guest: boolean; tilt: string }) {
  const info = MISSIONS[id];
  const done = student.missions[id];
  const Icon = MISSION_ICONS[info.icon];
  const content = (
    <>
      <span
        className={cn(
          "grid size-16 shrink-0 place-items-center rounded-2xl border-[3px] border-ink text-ink",
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
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-ink",
            done ? "bg-candy-mint" : "bg-candy-cream",
          )}
        >
          {done ? `완료 · ${done.score}점` : guest ? `게임 ${id} 시작하기` : `미션 ${id} QR을 찾아 찍으면 시작!`}
        </span>
      </span>
    </>
  );
  return guest ? (
    <Link href={`/mission/${id}`} className="flex items-center gap-4 rounded-3xl bg-card p-4 sticker sticker-hover sm:gap-5 sm:p-5">
      {content}
    </Link>
  ) : (
    <article className="flex items-center gap-4 rounded-3xl bg-card p-4 sticker sm:gap-5 sm:p-5">{content}</article>
  );
}
