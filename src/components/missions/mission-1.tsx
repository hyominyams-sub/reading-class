"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { RunnerGame, type RunnerResult } from "@/components/missions/runner-game";
import { RUNNER_QUIZ } from "@/content/book";

const HOW_TO = [
  "점프 버튼(또는 Space, 화면 터치)으로 장애물을 뛰어넘어요. 두 번 누르면 2단 점프!",
  "슬라이드 버튼(또는 ↓)으로 날아오는 장애물 아래를 미끄러져 지나가요.",
  `달리다 보면 이야기 퀴즈가 나와요. ${RUNNER_QUIZ.length}문제를 모두 풀면 골인!`,
  "마지막 단계에는 보스가 나타나요. 정답을 맞혀 보스를 물리쳐요.",
];

export function Mission1() {
  return (
    <StudentGate>
      <MissionFrame
        mission={1}
        scene="runner"
        howTo={HOW_TO}
        summary={(outcome) => {
          const d = outcome.details as Partial<RunnerResult> | undefined;
          if (!d) return null;
          return (
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["퀴즈 정답", `${d.correct ?? 0} / ${d.total ?? 0}`],
                ["포켓볼", `${d.coins ?? 0}개`],
                ["시간", `${d.timeSec ?? 0}초`],
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
        {(complete) => <RunnerGame questions={RUNNER_QUIZ} onComplete={(result) => complete(result.score, { ...result })} />}
      </MissionFrame>
    </StudentGate>
  );
}
