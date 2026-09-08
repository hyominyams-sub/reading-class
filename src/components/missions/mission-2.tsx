"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { TextAdventure, type AdventureResult } from "@/components/missions/text-adventure";
import { ADVENTURE } from "@/content/book";

const HOW_TO = [
  "장면을 읽고, 지우가 되어 어떻게 할지 골라요.",
  "배운 내용을 떠올리면 답이 보여요. 틀려도 이유를 읽고 다시 고를 수 있어요.",
  "이야기의 끝까지 가면 미션 완료! 한 번에 고른 갈림길이 많을수록 점수가 높아요.",
];

export function Mission2() {
  return (
    <StudentGate>
      <MissionFrame
        mission={2}
        scene="classroom"
        howTo={HOW_TO}
        summary={(outcome) => {
          const d = outcome.details as Partial<AdventureResult> | undefined;
          if (!d) return null;
          return (
            <dl className="grid grid-cols-2 gap-2 text-center">
              {[
                ["한 번에 고른 갈림길", `${d.firstTryCorrect ?? 0} / ${d.decisionScenes ?? 0}`],
                ["다시 생각한 횟수", `${d.wrongCount ?? 0}번`],
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
        {(complete) => <TextAdventure scenes={ADVENTURE} onComplete={(result) => complete(result.score, { ...result })} />}
      </MissionFrame>
    </StudentGate>
  );
}
