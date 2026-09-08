"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { RunnerGame, type RunnerResult } from "@/components/missions/runner-game";
import { RUNNER_QUIZ } from "@/content/book";

const HOW_TO = [
  "점프 버튼(또는 Space, 화면 터치)으로 장애물을 뛰어넘어요. 두 번 누르면 2단 점프!",
  "슬라이드 버튼(또는 ↓)으로 날아오는 장애물 아래를 지나가요.",
  "2분 동안 만나는 이야기 퀴즈를 풀어요. 문제를 다 풀지 못해도 시간이 되면 골인!",
];

export function Mission2() {
  return (
    <StudentGate>
      <MissionFrame
        mission={2}
        scene="runner"
        howTo={HOW_TO}
        summary={(outcome) => {
          const d = outcome.details as Partial<RunnerResult> | undefined;
          if (!d) return null;
          return (
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["푼 문제", `${d.answered ?? 0} / ${d.total ?? 0}`],
                ["정답", `${d.correct ?? 0}개`],
                ["달린 시간", `${d.timeSec ?? 0}초`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-muted/70 p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          );
        }}
      >
        {(complete) => (
          <RunnerGame
            questions={RUNNER_QUIZ}
            durationSec={120}
            missionNumber={2}
            onComplete={(result) => complete(result.score, { ...result })}
          />
        )}
      </MissionFrame>
    </StudentGate>
  );
}
