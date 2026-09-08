"use client";

import { useMemo, useRef, useState } from "react";
import { IconArrow, IconArrowLeft, IconCheck, IconCloud, IconCloudRain, IconSend, IconSun } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SceneIllustration } from "@/components/illustrations/scene";
import type { WritingConfig, WritingScene } from "@/lib/types";
import { cn } from "@/lib/utils";

export type WritingResult = {
  score: number;
  sceneId: string;
  sceneLabel: string;
  who: string;
  feelings: string[];
  weather: string;
  text: string;
  chars: number;
};

type Props = {
  config: WritingConfig;
  studentName: string;
  isGuest?: boolean;
  onComplete: (result: WritingResult) => void;
};

const STEPS = ["장면 고르기", "마음 고르기", "일기 쓰기", "확인하기"];
const WEATHERS = [
  { key: "맑음", icon: IconSun },
  { key: "흐림", icon: IconCloud },
  { key: "비", icon: IconCloudRain },
] as const;

function countChars(text: string) {
  return text.replace(/\s/g, "").length;
}

export function WritingActivity({ config, studentName, isGuest = false, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [weather, setWeather] = useState<string>("맑음");
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scene = useMemo(() => config.scenes.find((s) => s.id === sceneId) ?? null, [config.scenes, sceneId]);
  const chars = countChars(text);
  const enough = chars >= config.minChars;
  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(new Date()),
    [],
  );

  function pickScene(s: WritingScene) {
    setSceneId(s.id);
    setWeather(s.scene === "rain" ? "비" : "맑음");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFeeling(word: string) {
    setFeelings((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 3) return prev;
      return [...prev, word];
    });
  }

  function insertStarter(starter: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? start;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const needsSpace = before.length > 0 && !/[\s]$/.test(before);
    const inserted = `${needsSpace ? " " : ""}${starter} `;
    const next = `${before}${inserted}${after}`;
    setText(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = before.length + inserted.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function submit() {
    if (!scene) return;
    onComplete({
      score: 100,
      sceneId: scene.id,
      sceneLabel: scene.label,
      who: scene.who,
      feelings,
      weather,
      text: text.trim(),
      chars,
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
      <ol className="mb-5 flex items-center gap-2 text-sm" aria-label="진행 단계">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-bold",
                i < step ? "bg-candy-mint text-ink" : i === step ? "bg-candy-pink text-ink" : "bg-card text-muted-foreground",
              )}
            >
              {i < step ? <IconCheck className="size-4" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", i === step ? "font-semibold" : "text-muted-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-border sm:w-6" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="animate-in fade-in">
          <h1 className="font-heading text-3xl">어느 장면의 마음을 써 볼까요?</h1>
          <p className="mt-1 text-muted-foreground">{config.intro}</p>
          <div className="mt-4 grid gap-4">
            {config.scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickScene(s)}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card text-left sticker transition-colors hover:ring-primary sm:flex-row"
              >
                <div className="aspect-[2/1] w-full sm:aspect-auto sm:w-56 sm:shrink-0">
                  <SceneIllustration scene={s.scene} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-5">
                  <p className="text-sm font-heading text-primary-strong">{s.who}의 마음</p>
                  <p className="mt-0.5 text-xl font-bold">{s.label}</p>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.situation}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-heading text-primary-strong">
                    이 장면 고르기 <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && scene && (
        <section className="animate-in fade-in">
          <h1 className="font-heading text-3xl">{scene.who}의 마음은 어땠을까요?</h1>
          <p className="mt-1 text-muted-foreground">어울리는 감정 낱말을 1~3개 골라요. {scene.hint}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {config.feelings.map((word) => {
              const on = feelings.includes(word);
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => toggleFeeling(word)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-base font-semibold transition-colors",
                    on ? "border-ink bg-candy-pink text-ink shadow-[2px_2px_0_0_var(--ink)]" : "border-ink bg-card hover:bg-candy-cream",
                  )}
                >
                  {word}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">고른 낱말: {feelings.length ? feelings.join(", ") : "없음"} ({feelings.length}/3)</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(0)}>
              <IconArrowLeft data-icon="inline-start" /> 이전
            </Button>
            <Button size="lg" className="flex-1" disabled={feelings.length === 0} onClick={() => setStep(2)}>
              일기 쓰러 가기 <IconArrow data-icon="inline-end" />
            </Button>
          </div>
        </section>
      )}

      {step === 2 && scene && (
        <section className="animate-in fade-in">
          <div className="overflow-hidden rounded-3xl bg-card sticker">
            <div className="flex items-center gap-4 border-b p-4">
              <div className="aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg">
                <SceneIllustration scene={scene.scene} className="h-full w-full" />
              </div>
              <div>
                <p className="text-sm font-heading text-primary-strong">{scene.label}</p>
                <p className="leading-snug text-muted-foreground">{scene.situation}</p>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xl font-bold">{scene.who}의 일기</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{dateLabel}</span>
                  <span className="flex gap-1">
                    {WEATHERS.map(({ key, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setWeather(key)}
                        aria-pressed={weather === key}
                        aria-label={`날씨 ${key}`}
                        className={cn("grid size-8 place-items-center rounded-full border", weather === key ? "border-ink bg-candy-yellow text-ink" : "border-ink bg-card")}
                      >
                        <Icon className="size-4" />
                      </button>
                    ))}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feelings.map((f) => (
                  <span key={f} className="rounded-full bg-candy-blue px-2.5 py-0.5 text-xs font-bold text-ink">{f}</span>
                ))}
              </div>
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`${scene.who}이/가 되어 오늘 있었던 일과 마음을 써 보세요.\n예) 오늘 나는 … 마음이 들었다. 왜냐하면 …`}
                className="paper-lines mt-3 min-h-64 resize-y rounded-2xl border-[2.5px] border-ink px-4 py-0 text-lg leading-[36px] shadow-[3px_3px_0_0_var(--ink)] focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-lg"
                spellCheck={false}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">문장 시작 도움:</span>
                {config.starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => insertStarter(s)}
                    className="rounded-full bg-card px-3 py-1 text-sm font-bold text-ink sticker-xs sticker-press hover:bg-candy-cream"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={cn("font-medium tabular-nums", enough ? "text-ink" : "text-muted-foreground")}>
                  공백 제외 {chars}자 / 최소 {config.minChars}자
                </span>
                <span className="text-muted-foreground">{enough ? "충분해요!" : `${config.minChars - chars}자 더 써 보세요`}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              <IconArrowLeft data-icon="inline-start" /> 이전
            </Button>
            <Button size="lg" className="flex-1" disabled={!enough} onClick={() => setStep(3)}>
              다 썼어요 <IconArrow data-icon="inline-end" />
            </Button>
          </div>
        </section>
      )}

      {step === 3 && scene && (
        <section className="animate-in fade-in">
          <h1 className="font-heading text-3xl">{isGuest ? "이대로 완성할까요?" : "이렇게 제출할까요?"}</h1>
          <p className="mt-1 text-muted-foreground">
            {isGuest ? "게스트 일기를 완성해요. 체험 기록은 선생님께 제출되지 않아요." : "제출하면 선생님이 읽어 볼 수 있어요."}
          </p>
          <article className="mt-4 overflow-hidden rounded-3xl bg-card sticker">
            <div className="aspect-[21/9]">
              <SceneIllustration scene={scene.scene} className="h-full w-full" />
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xl font-bold">{scene.who}의 일기</p>
                <p className="text-sm text-muted-foreground">
                  {dateLabel} · 날씨 {weather} · 쓴 사람 {studentName}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feelings.map((f) => (
                  <span key={f} className="rounded-full bg-candy-blue px-2.5 py-0.5 text-xs font-bold text-ink">{f}</span>
                ))}
              </div>
              <div className="paper-lines mt-4 rounded-2xl border-[2.5px] border-ink px-4 text-lg leading-[36px] whitespace-pre-wrap">{text.trim()}</div>
            </div>
          </article>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(2)}>
              <IconArrowLeft data-icon="inline-start" /> 고치기
            </Button>
            <Button size="lg" className="flex-1" onClick={submit}>
              {isGuest ? <IconCheck data-icon="inline-start" /> : <IconSend data-icon="inline-start" />}
              {isGuest ? "완료하기" : "제출하기"}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
