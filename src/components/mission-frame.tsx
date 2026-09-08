"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { IconArrow, IconClock, IconMedal, IconPodium, IconRedo, IconSparkle } from "@/components/candy-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { SceneIllustration } from "@/components/illustrations/scene";
import { QrScanButton } from "@/components/qr-scan";
import { useStudent } from "@/lib/student-context";
import { BOOK, MISSIONS } from "@/content/book";
import { MISSION_IDS, type MissionId, type SceneKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CompleteFn = (score: number, details?: Record<string, unknown>) => void;

export type MissionOutcome = {
  score: number;
  details?: Record<string, unknown>;
  saved: boolean;
  error?: string;
};

type Props = {
  mission: MissionId;
  scene: SceneKey;
  howTo: string[];
  summary?: (outcome: MissionOutcome) => ReactNode;
  children: (complete: CompleteFn) => ReactNode;
};

/** 미션 공통 틀: 도입(설명) → 활동 → 완료 화면. 완료 시 서버에 기록한다. */
export function MissionFrame({ mission, scene, howTo, summary, children }: Props) {
  const { student, mode, complete } = useStudent();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [outcome, setOutcome] = useState<MissionOutcome | null>(null);
  const [runKey, setRunKey] = useState(0);
  const info = MISSIONS[mission];
  const previous = student?.missions[mission];

  const handleComplete: CompleteFn = async (score, details) => {
    setPhase("done");
    setOutcome({ score, details, saved: false });
    try {
      await complete(mission, score, details);
      setOutcome({ score, details, saved: true });
    } catch (err) {
      setOutcome({ score, details, saved: false, error: err instanceof Error ? err.message : "기록 저장에 실패했어요." });
    }
  };

  const retrySave = async () => {
    if (!outcome) return;
    setOutcome({ ...outcome, error: undefined });
    try {
      await complete(mission, outcome.score, outcome.details);
      setOutcome({ ...outcome, saved: true, error: undefined });
    } catch (err) {
      setOutcome({ ...outcome, error: err instanceof Error ? err.message : "기록 저장에 실패했어요." });
    }
  };

  const start = () => {
    setRunKey((k) => k + 1);
    setOutcome(null);
    setPhase("play");
  };

  if (phase === "play") {
    return (
      <div key={runKey} className="flex flex-1 flex-col">
        {children(handleComplete)}
      </div>
    );
  }

  if (phase === "done" && outcome) {
    const remaining = MISSION_IDS.filter((id) => id !== mission && !student?.missions[id]);
    const next = remaining[0] ?? null;
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <div className="rounded-3xl bg-card p-6 text-center sticker candy-pop sm:p-10">
          <div className="mx-auto grid size-24 place-items-center rounded-full border-[3px] border-ink bg-candy-mint text-ink candy-bob">
            <IconMedal className="size-14" />
          </div>
          <h1 className="mt-5 font-heading text-4xl">미션 {mission} 완료!</h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">{info.title}</p>
          <div className="mt-6 inline-flex items-baseline gap-1 rounded-2xl bg-candy-yellow px-7 py-3 text-ink sticker-sm tilt-r">
            <span className="font-heading text-5xl tabular-nums">{outcome.score}</span>
            <span className="font-heading text-xl">점</span>
          </div>
          {summary && <div className="mt-6 text-left">{summary(outcome)}</div>}
          {!outcome.saved && !outcome.error && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-candy-cream px-4 py-2 font-medium text-muted-foreground sticker-xs">
              <IconClock className="size-5 motion-safe:animate-spin [animation-duration:2.4s]" />
              기록을 저장하는 중이에요…
            </p>
          )}
          {outcome.error && (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border-[2.5px] border-destructive bg-destructive/10 p-4 text-destructive">
              <p className="flex items-center gap-2 font-semibold">
                <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-destructive text-sm font-bold text-white">!</span>
                {outcome.error}
              </p>
              <Button variant="outline" size="sm" onClick={retrySave}>
                다시 저장하기
              </Button>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3">
            {next && mode === "guest" ? (
              <Link href={`/mission/${next}`} className={cn(buttonVariants({ size: "xl" }))}>
                다음 게임 하기
                <IconArrow data-icon="inline-end" />
              </Link>
            ) : next ? (
              <>
                <p className="leading-relaxed text-muted-foreground">
                  다음은{" "}
                  <b className="font-semibold text-ink">
                    미션 {next} · {MISSIONS[next].title}
                  </b>
                  {" "}— 교실에서 그 QR을 찾아 찍어요.
                </p>
                <QrScanButton label="다음 QR 찍기" />
              </>
            ) : (
              <Link href="/board" className={cn(buttonVariants({ size: "xl" }))}>
                모든 미션 완료! 결과 보기
                <IconArrow data-icon="inline-end" />
              </Link>
            )}
            <div className="flex gap-3">
              {next && mode === "student" && (
                <Link href="/board" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1")}>
                  <IconPodium data-icon="inline-start" />
                  결과 보기
                </Link>
              )}
              <Button variant="outline" size="lg" className="flex-1" onClick={start}>
                <IconRedo data-icon="inline-start" />
                다시 하기
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl bg-card sticker animate-in fade-in">
        <div className="aspect-[2/1] border-b-[3px] border-ink sm:aspect-[21/9]">
          <SceneIllustration scene={scene} className="h-full w-full" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-candy-pink px-3.5 py-1 font-heading text-ink sticker-xs">미션 {mission}</span>
            <span className="font-medium text-muted-foreground">{info.subtitle}</span>
            <span className="ml-auto inline-flex items-center gap-1 font-medium text-muted-foreground">
              <IconClock className="size-5" />
              {info.minutes}
            </span>
          </div>
          <h1 className="mt-3 font-heading text-4xl leading-tight">{info.title}</h1>
          <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{info.description}</p>

          {previous && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-candy-cream px-4 py-3 text-ink sticker-sm">
              <IconMedal className="mt-0.5 size-6 shrink-0" />
              <p>
                이미 완료한 미션이에요 (점수 {previous.score}점). 다시 도전하면 새 기록으로 저장돼요.
              </p>
            </div>
          )}

          <section className="mt-6">
            <h2 className="font-heading text-xl">이렇게 해요</h2>
            <ol className="mt-2 space-y-2">
              {howTo.map((text, index) => (
                <li key={text} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-candy-blue font-heading text-sm text-ink">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </section>

          <details className="mt-5 rounded-2xl border-[2.5px] border-dashed border-ink/40 bg-candy-cream p-4">
            <summary className="cursor-pointer font-heading">이야기 떠올리기 · {BOOK.title}</summary>
            <div className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
              {BOOK.synopsis.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" onClick={start} className="sm:flex-1">
              <IconSparkle data-icon="inline-start" />
              시작하기
            </Button>
            <Link href="/board" className={cn(buttonVariants({ variant: "outline", size: "xl" }))}>
              <IconPodium data-icon="inline-start" />
              현황판
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
