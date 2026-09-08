"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { TextAdventure, type AdventureResult } from "@/components/missions/text-adventure";
import { ADVENTURE } from "@/content/book";

const HOW_TO = [
  "그림책 속 장면을 천천히 살펴봐요.",
  "뚱이가 되어 나라면 어떻게 할지 골라요.",
  "다른 선택을 해도 괜찮아요. 까닭을 읽고 다시 생각해 봐요.",
];

export function Mission1() {
  return (
    <StudentGate>
      <MissionFrame
        mission={1}
        scene="ddungi-choice"
        howTo={HOW_TO}
        summary={(outcome) => {
          const d = outcome.details as Partial<AdventureResult> | undefined;
          if (!d) return null;
          return (
            <dl className="grid grid-cols-2 gap-2 text-center">
              {[
                ["한 번에 고른 선택", `${d.firstTryCorrect ?? 0} / ${d.decisionScenes ?? 0}`],
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
        {(complete) => (
          <TextAdventure
            scenes={ADVENTURE}
            protagonist="뚱이"
            onComplete={(result) => complete(result.score, { ...result })}
          />
        )}
      </MissionFrame>
    </StudentGate>
  );
}
