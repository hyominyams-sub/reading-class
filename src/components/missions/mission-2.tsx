"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { RunnerGame, type RunnerResult } from "@/components/missions/runner-game";
import { RUNNER_QUIZ } from "@/content/book";

const HOW_TO = [
  "점프 버튼(또는 Space, 화면 터치)으로 장애물을 뛰어넘어요. 두 번 누르면 2단 점프!",
  "슬라이드 버튼(또는 ↓)으로 날아오는 장애물 아래를 지나가요.",
  "달리며 이야기 퀴즈를 풀어요. 시간이 끝나도 남은 문제를 풀고 골인해요.",
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
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                {[
                  ["푼 문제", `${d.answered ?? 0} / ${d.total ?? 0}`],
                  ["정답", `${d.correct ?? 0}개`],
                  ["활동 시간", `${d.timeSec ?? 0}초`],
                  ["달린 시간", `${d.activeRunSec ?? d.timeSec ?? 0}초`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-muted/70 p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              {d.answers && d.answers.length > 0 && (
                <div className="space-y-2 text-left">
                  <p className="font-heading text-base">이야기 퀴즈 돌아보기</p>
                  {d.answers.map((answer) => (
                    <div key={answer.questionId} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                      <p className="font-medium">{answer.correct ? "맞힌 문제" : "다시 살펴볼 문제"}: {answer.question}</p>
                      {!answer.correct && answer.explain && <p className="mt-1 text-muted-foreground">{answer.explain}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
