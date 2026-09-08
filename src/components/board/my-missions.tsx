"use client";

import Link from "next/link";
import { IconCheck, IconMedal, IconQr, IconRedo, IconStar, MISSION_ICONS } from "@/components/candy-icons";
import { QrScanButton } from "@/components/qr-scan";
import { buttonVariants } from "@/components/ui/button";
import { MISSIONS, missionTitle } from "@/content/book";
import {
  completedCount,
  isCleared,
  MISSION_IDS,
  nextMission,
  type MissionId,
  type MissionResult,
  type StudentRecord,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * 현황판의 주인공: 내가 한 미션과 그 결과.
 * 태블릿(가로 768~1194px)에서 팔 길이만큼 떨어져 봐도 읽히도록
 * 글자·버튼·아이콘을 크게 잡고, 한 줄에 한 미션씩 쌓는다.
 */

/* 각 활동이 저장하는 details 모양 (mission-1/2/3의 result와 같음) */
type RunnerDetails = { correct?: number; answered?: number; total?: number; timeSec?: number; coins?: number };
type AdventureDetails = { firstTryCorrect?: number; decisionScenes?: number; wrongCount?: number };
type WritingDetails = {
  sceneLabel?: string;
  who?: string;
  feelings?: string[];
  weather?: string;
  text?: string;
  chars?: number;
};

const MISSION_TONE: Record<MissionId, string> = {
  1: "bg-candy-pink",
  2: "bg-candy-blue",
  3: "bg-candy-lilac",
};

function timeLabel(iso: string): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function statsOf(id: MissionId, result: MissionResult): { label: string; value: string }[] {
  const d = (result.details ?? {}) as RunnerDetails & AdventureDetails & WritingDetails;
  if (id === 1) {
    return [
      { label: "한 번에 고른 답", value: `${d.firstTryCorrect ?? 0}/${d.decisionScenes ?? 0}` },
      { label: "다시 고른 횟수", value: `${d.wrongCount ?? 0}번` },
    ];
  }
  if (id === 2) {
    return [
      { label: "푼 문제", value: `${d.answered ?? 0}/${d.total ?? 0}` },
      { label: "퀴즈 정답", value: `${d.correct ?? 0}개` },
      { label: "걸린 시간", value: `${d.timeSec ?? 0}초` },
    ];
  }
  return [
    { label: "쓴 글자 수", value: `${d.chars ?? 0}자` },
    { label: "고른 감정", value: `${d.feelings?.length ?? 0}개` },
  ];
}

export function MyMissions({ student }: { student: StudentRecord }) {
  const done = completedCount(student);
  const total = MISSION_IDS.length;
  const cleared = isCleared(student);
  const next = nextMission(student);

  return (
    <section aria-labelledby="my-missions-heading">
      {/* ── 내 진행 요약 ── */}
      <div className="rounded-3xl bg-candy-cream p-5 sticker sm:p-7">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-bold text-ink sticker-xs">
          <IconStar className="size-4" />내 미션 카드
        </p>
        <h1 id="my-missions-heading" className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
          {student.name}
          <span className="text-primary-strong">의 기록</span>
        </h1>

        {/* 미션 3칸 진행 막대 — 칸 자체가 미션이라 한눈에 어디까지 왔는지 보인다 */}
        <ol className="mt-5 flex gap-2 sm:gap-3" aria-label={`${total}개 중 ${done}개 완료`}>
          {MISSION_IDS.map((id) => {
            const finished = Boolean(student.missions[id]);
            return (
              <li
                key={id}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-ink font-heading text-base sm:h-14 sm:text-lg",
                  finished ? "bg-candy-mint text-ink" : id === next ? "bg-card text-ink" : "bg-card/60 text-muted-foreground",
                )}
              >
                {finished ? <IconCheck className="size-5 sm:size-6" /> : <span className="tabular-nums sm:hidden">{id}</span>}
                <span className="hidden sm:inline">미션 {id}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-2xl sm:text-3xl">
            {cleared ? (
              <span className="inline-flex items-center gap-2">
                <IconMedal className="size-8 candy-bob" />세 미션 모두 완료!
              </span>
            ) : (
              <>
                <span className="tabular-nums">
                  {done}/{total}
                </span>{" "}
                완료 · <span className="highlight">{total - done}개 남았어요</span>
              </>
            )}
          </p>
          {next ? (
            <QrScanButton className="w-full sm:w-auto" label={`미션 ${next} QR 찍기`} />
          ) : (
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "xl" }), "w-full sm:w-auto")}>
              <IconRedo data-icon="inline-start" />
              다시 해 보기
            </Link>
          )}
        </div>
      </div>

      {/* ── 미션별 내 결과 ── */}
      <ul className="mt-5 grid gap-4">
        {MISSION_IDS.map((id, i) => (
          <MyMissionCard
            key={id}
            id={id}
            studentName={student.name}
            result={student.missions[id]}
            isNext={id === next}
            tilt={i % 2 === 0 ? "tilt-l" : "tilt-r"}
          />
        ))}
      </ul>
    </section>
  );
}

function MyMissionCard({
  id,
  studentName,
  result,
  isNext,
  tilt,
}: {
  id: MissionId;
  studentName: string;
  result: MissionResult | undefined;
  isNext: boolean;
  tilt: string;
}) {
  const info = MISSIONS[id];
  const Icon = MISSION_ICONS[info.icon];
  const title = missionTitle(id, studentName);
  const at = result ? timeLabel(result.completedAt) : "";

  return (
    <li
      className={cn(
        "rounded-3xl p-4 sticker sm:p-5",
        result ? "bg-card" : isNext ? "bg-candy-yellow" : "bg-card/70",
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-2xl border-[3px] border-ink text-ink sm:size-16",
            tilt,
            result ? "bg-candy-mint" : MISSION_TONE[id],
          )}
        >
          {result ? <IconCheck className="size-8" /> : <Icon className="size-9 sm:size-10" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-heading text-primary-strong">미션 {id}</span>
            <span className="font-medium text-muted-foreground">{info.subtitle}</span>
            {!result && isNext && (
              <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-bold text-ink sticker-xs">지금 할 차례</span>
            )}
            {!result && !isNext && <span className="text-xs font-bold text-muted-foreground">· {info.minutes}</span>}
          </p>
          <p className="mt-0.5 font-heading text-2xl leading-snug">{title}</p>
          {result ? (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {at && `${at} 완료`}
              {result.attempts > 1 && ` · ${result.attempts}번 도전`}
            </p>
          ) : (
            <p className="mt-1 leading-relaxed text-ink/75">{info.description}</p>
          )}
        </div>

        {result && (
          <span className="shrink-0 rounded-2xl bg-candy-yellow px-3 py-1.5 text-center text-ink sticker-sm tilt-r sm:px-4 sm:py-2">
            <span className="font-heading text-3xl tabular-nums sm:text-4xl">{result.score}</span>
            <span className="font-heading text-base">점</span>
          </span>
        )}
      </div>

      {result && <MyResult id={id} result={result} />}

      {/* 들어가는 문은 교실에 붙은 QR뿐 — 여기서는 어디로 가야 하는지만 알려 준다. */}
      <div className="mt-4 flex justify-end">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold text-ink",
            isNext && !result ? "bg-card sticker-xs" : "bg-card/70",
          )}
        >
          <IconQr className="size-5" />
          {result ? `다시 하려면 미션 ${id} QR을 한 번 더 찍어요` : `교실에서 미션 ${id} QR을 찾아 찍어요`}
        </span>
      </div>
    </li>
  );
}

/** 완료한 미션의 실제 결과 — 점수만이 아니라 "내가 무엇을 했는지"를 보여 준다. */
function MyResult({ id, result }: { id: MissionId; result: MissionResult }) {
  const stats = statsOf(id, result);
  const writing = id === 3 ? ((result.details ?? {}) as WritingDetails) : null;

  return (
    <div className="mt-4">
      <dl className={cn("grid gap-2", stats.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-candy-cream px-3 py-2.5 text-center sticker-xs">
            <dt className="truncate text-xs font-medium text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 font-heading text-xl tabular-nums sm:text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {writing?.text && (
        <div className="mt-3 overflow-hidden rounded-2xl sticker-sm">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-[2.5px] border-ink bg-candy-lilac px-4 py-2 text-sm font-bold text-ink">
            <span>
              {writing.sceneLabel} · {writing.who}의 일기
            </span>
            {writing.weather && <span className="text-ink/70">날씨 {writing.weather}</span>}
            {writing.feelings?.map((feeling) => (
              <span key={feeling} className="rounded-full border-2 border-ink bg-card px-2 py-0.5 text-xs">
                {feeling}
              </span>
            ))}
          </div>
          <p className="paper-lines max-h-64 overflow-y-auto px-4 text-lg leading-[36px] whitespace-pre-wrap">
            {writing.text}
          </p>
        </div>
      )}
    </div>
  );
}
