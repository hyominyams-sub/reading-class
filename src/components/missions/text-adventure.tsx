"use client";

import { useMemo, useState } from "react";
import { IconArrow, IconBulb, IconRedo, IconSparkle } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { SceneIllustration } from "@/components/illustrations/scene";
import type { AdventureChoice, AdventureScene } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AdventureResult = {
  score: number;
  firstTryCorrect: number;
  decisionScenes: number;
  wrongCount: number;
};

type Props = {
  scenes: AdventureScene[];
  protagonist?: string;
  onComplete: (result: AdventureResult) => void;
};

const LETTERS = ["①", "②", "③", "④", "⑤"];

export function TextAdventure({ scenes, protagonist = "주인공", onComplete }: Props) {
  const byId = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);
  const decisionScenes = useMemo(() => scenes.filter((s) => s.choices && s.choices.length > 0).length, [scenes]);

  const [currentId, setCurrentId] = useState(scenes[0]?.id ?? "");
  const [feedback, setFeedback] = useState<AdventureChoice | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(() => new Set());

  const scene = byId.get(currentId);
  if (!scene) return null;
  const stepIndex = scenes.findIndex((s) => s.id === scene.id) + 1;

  function choose(choice: AdventureChoice) {
    if (!scene) return;
    if (choice.correct) {
      if (!missed.has(scene.id)) setFirstTryCorrect((n) => n + 1);
      setFeedback(null);
      if (choice.next) setCurrentId(choice.next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setWrongCount((n) => n + 1);
      setMissed((prev) => new Set(prev).add(scene.id));
      setFeedback(choice);
    }
  }

  function finish() {
    const score = decisionScenes ? Math.round((firstTryCorrect / decisionScenes) * 100) : 100;
    onComplete({ score, firstTryCorrect, decisionScenes, wrongCount });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="rounded-full bg-candy-pink px-3.5 py-1 font-heading text-ink sticker-xs">
          장면 {stepIndex} / {scenes.length}
        </span>
        <span className="font-medium text-muted-foreground">주인공: {protagonist}</span>
      </div>
      <div className="mb-4 flex gap-1" aria-hidden>
        {scenes.map((s, i) => (
          <span key={s.id} className={cn("h-2.5 flex-1 rounded-full border-2 border-ink", i < stepIndex ? "bg-candy-pink" : "bg-card")} />
        ))}
      </div>

      <article key={scene.id} className="overflow-hidden rounded-3xl bg-card sticker animate-in fade-in slide-in-from-bottom-2">
        <div className="relative aspect-[2/1] sm:aspect-[21/9]">
          <SceneIllustration scene={scene.scene} className="h-full w-full" />
          <span className="absolute bottom-3 left-3 rounded-full bg-card px-3.5 py-1 font-heading text-sm text-ink sticker-xs">{scene.title}</span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="space-y-3 text-lg leading-relaxed">
            {scene.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {scene.ending ? (
            <div className="mt-6 rounded-2xl bg-candy-mint p-5 text-ink sticker-sm">
              <p className="flex items-center gap-2 font-heading text-xl">
                <IconSparkle className="size-6" /> 이야기의 끝
              </p>
              <p className="mt-1">
                갈림길 {decisionScenes}곳 중 {firstTryCorrect}곳을 한 번에 지혜롭게 골랐어요.
                {wrongCount > 0 && ` 다시 생각한 횟수 ${wrongCount}번.`}
              </p>
              <Button size="xl" className="mt-4 w-full" onClick={finish}>
                미션 완료하기
                <IconArrow data-icon="inline-end" />
              </Button>
            </div>
          ) : feedback ? (
            <div className="mt-6 rounded-2xl bg-candy-yellow p-5 text-ink sticker-sm animate-in fade-in">
              <p className="flex items-center gap-2 font-heading text-xl">
                <IconBulb className="size-6" /> 다시 생각해 볼까요?
              </p>
              <p className="mt-2 leading-relaxed">{feedback.feedback}</p>
              <Button size="lg" variant="outline" className="mt-4" onClick={() => setFeedback(null)}>
                <IconRedo data-icon="inline-start" />
                다시 고르기
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <p className="font-heading text-primary-strong">{protagonist}라면 어떻게 할까요?</p>
              <div className="mt-3 grid gap-2.5">
                {scene.choices?.map((choice, i) => (
                  <button
                    key={choice.text}
                    type="button"
                    onClick={() => choose(choice)}
                    className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5 text-left text-base leading-snug sticker-sm sticker-press hover:bg-candy-cream"
                  >
                    <span className="mt-0.5 shrink-0 text-xl font-heading text-primary-strong">{LETTERS[i] ?? i + 1}</span>
                    <span>{choice.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
