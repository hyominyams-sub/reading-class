"use client";

import { useMemo, useRef, useState } from "react";
import { IconArrow, IconBulb, IconCheck, IconRedo, IconSparkle } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { SceneIllustration } from "@/components/illustrations/scene";
import type { AdventureChoice, AdventureScene } from "@/lib/types";
import { hasSceneIllustration } from "@/content/scene-assets";
import { cn } from "@/lib/utils";

export type AdventureResult = {
  score: number;
  firstTryCorrect: number;
  decisionScenes: number;
  wrongCount: number;
  decisions: AdventureDecision[];
  encouragedFriends: number[];
};

export type AdventureDecision = {
  sceneId: string;
  sceneTitle: string;
  firstChoiceIndex: number;
  firstChoiceText: string;
  finalChoiceIndex: number;
  finalChoiceText: string;
  reconsiderations: number;
  feedback: string;
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
  const [feedback, setFeedback] = useState<{ choice: AdventureChoice; index: number } | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, AdventureDecision>>({});
  const [completed, setCompleted] = useState(false);
  const [encouragedFriends, setEncouragedFriends] = useState<number[]>([]);
  const completedRef = useRef(false);
  const selectionLockRef = useRef(false);

  const scene = byId.get(currentId);
  if (!scene) return null;
  const stepIndex = scenes.findIndex((s) => s.id === scene.id) + 1;
  const hasIllustration = hasSceneIllustration(scene.scene);
  const allDecisionsMade = Object.keys(decisions).length >= decisionScenes;
  const allFriendsEncouraged = encouragedFriends.length >= (scene.encouragement?.count ?? 0);

  function choose(choice: AdventureChoice, choiceIndex: number) {
    if (!scene) return;
    if (feedback || selectionLockRef.current) return;
    selectionLockRef.current = true;

    const previous = decisions[scene.id];
    if (!previous) {
      if (choice.correct) setFirstTryCorrect((n) => n + 1);
      setDecisions((prev) => ({
        ...prev,
        [scene.id]: {
          sceneId: scene.id,
          sceneTitle: scene.title,
          firstChoiceIndex: choiceIndex,
          firstChoiceText: choice.text,
          finalChoiceIndex: choiceIndex,
          finalChoiceText: choice.text,
          reconsiderations: 0,
          feedback: choice.feedback,
        },
      }));
    } else {
      setWrongCount((n) => n + 1);
      setDecisions((prev) => ({
        ...prev,
        [scene.id]: {
          ...previous,
          finalChoiceIndex: choiceIndex,
          finalChoiceText: choice.text,
          reconsiderations: previous.reconsiderations + 1,
          feedback: choice.feedback,
        },
      }));
    }
    setFeedback({ choice, index: choiceIndex });
  }

  function continueScene() {
    if (!scene || !feedback) return;
    if (feedback.choice.correct && feedback.choice.next) {
      selectionLockRef.current = false;
      setFeedback(null);
      setCurrentId(feedback.choice.next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function finish() {
    if (completedRef.current || !allDecisionsMade || !allFriendsEncouraged) return;
    completedRef.current = true;
    setCompleted(true);
    const score = decisionScenes ? Math.round((firstTryCorrect / decisionScenes) * 100) : 100;
    onComplete({ score, firstTryCorrect, decisionScenes, wrongCount, decisions: Object.values(decisions), encouragedFriends });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="rounded-full bg-candy-pink px-3.5 py-1 font-heading text-ink sticker-xs">
          활동 {stepIndex} / {scenes.length}
        </span>
        <span className="font-medium text-muted-foreground">안내: {protagonist.replace(/^안내자\s*/, "")}</span>
      </div>
      <div className="mb-4 flex gap-1" aria-hidden>
        {scenes.map((s, i) => (
          <span key={s.id} className={cn("h-2.5 flex-1 rounded-full border-2 border-ink", i < stepIndex ? "bg-candy-pink" : "bg-card")} />
        ))}
      </div>

      <article key={scene.id} className={cn("overflow-hidden rounded-3xl bg-card sticker animate-in fade-in slide-in-from-bottom-2", hasIllustration && "sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]")}>
        {hasIllustration ? (
          <div className="flex items-start justify-center bg-candy-cream">
            <SceneIllustration scene={scene.scene} className="max-h-80 w-full sm:max-h-none sm:h-auto" />
          </div>
        ) : (
          <div className="border-b-[3px] border-ink px-5 pt-5 sm:px-7 sm:pt-7">
            <h1 className="font-heading text-2xl text-ink">{scene.title}</h1>
          </div>
        )}
        <div className="p-5 sm:p-7">
          {hasIllustration && <h1 className="mb-4 font-heading text-2xl leading-snug">{scene.title}</h1>}
          <div className="space-y-3 text-lg leading-relaxed">
            {scene.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {scene.encouragement ? (
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{scene.encouragement.reminder}</p>
              <div className="mt-5 grid grid-cols-3 gap-3" role="group" aria-label="응원한 친구 확인">
                {Array.from({ length: scene.encouragement.count }, (_, i) => i + 1).map((number) => {
                  const checked = encouragedFriends.includes(number);
                  return (
                    <button
                      key={number}
                      type="button"
                      aria-label={`${number}번 친구 응원`}
                      aria-pressed={checked}
                      onClick={() => setEncouragedFriends((prev) => prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number])}
                      className={cn("flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl font-heading text-3xl sticker-sm sticker-press focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary", checked ? "bg-candy-mint" : "bg-card hover:bg-candy-cream")}
                    >
                      {number}
                      {checked && <IconCheck className="size-5" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center font-medium" aria-live="polite">{encouragedFriends.length} / {scene.encouragement.count}명에게 응원했어요</p>
              <Button size="xl" className="mt-5 w-full" onClick={finish} disabled={completed || !allDecisionsMade || !allFriendsEncouraged}>
                미션 완료하기 <IconArrow data-icon="inline-end" />
              </Button>
            </div>
          ) : scene.ending ? (
            <div className="mt-6 rounded-2xl bg-candy-mint p-5 text-ink sticker-sm">
              <p className="flex items-center gap-2 font-heading text-xl">
                <IconSparkle className="size-6" /> 이야기의 끝
              </p>
              <p className="mt-1">
                갈림길 {decisionScenes}곳을 살펴봤어요.
                {wrongCount > 0 && ` 다시 생각한 횟수 ${wrongCount}번.`}
              </p>
              <Button size="xl" className="mt-4 w-full" onClick={finish} disabled={completed || !allDecisionsMade}>
                미션 완료하기
                <IconArrow data-icon="inline-end" />
              </Button>
            </div>
          ) : feedback ? (
            <div className="mt-6 rounded-2xl bg-candy-yellow p-5 text-ink sticker-sm animate-in fade-in">
              <p className="flex items-center gap-2 font-heading text-xl">
                <IconBulb className="size-6" /> 선택을 살펴봐요
              </p>
              <p className="mt-2 leading-relaxed">{feedback.choice.feedback}</p>
              {feedback.choice.correct && feedback.choice.next ? (
                <Button size="lg" className="mt-4" onClick={continueScene}>
                  다음 활동
                  <IconArrow data-icon="inline-end" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    selectionLockRef.current = false;
                    setFeedback(null);
                  }}
                >
                  <IconRedo data-icon="inline-start" />
                  다시 고르기
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="font-heading text-primary-strong">
                {(scene as AdventureScene & { prompt?: string }).prompt ?? "어떤 선택이 이 장면에 잘 어울릴까요?"}
              </p>
              <div className="mt-3 grid gap-2.5">
                {scene.choices?.map((choice, i) => (
                  <button
                    key={(choice as AdventureChoice & { id?: string }).id ?? choice.text}
                    type="button"
                    onClick={() => choose(choice, i)}
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
