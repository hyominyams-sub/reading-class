"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { TextAdventure, type AdventureResult } from "@/components/missions/text-adventure";
import { ADVENTURE } from "@/content/book";

const HOW_TO = [
  "그림책 속 장면을 천천히 살펴봐요.",
  "안내자 뚱이와 함께 친구의 마음을 헤아리는 말을 골라요.",
  "우리 반 친구 3명에게 응원을 전하고 숫자 버튼을 모두 눌러요.",
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
          const decisions = Array.isArray(d.decisions) ? d.decisions : [];
          return (
            <div className="space-y-3">
              <dl className="grid grid-cols-2 gap-2 text-center">
                {[
                  ["말 고르기 활동", `${d.decisionScenes ?? 0}개`],
                  ["다시 고른 횟수", `${d.wrongCount ?? 0}번`],
                  ["응원한 친구", `${d.encouragedFriends?.length ?? 0}명`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-muted/70 p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              {decisions.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-heading text-lg">내가 고른 말</h2>
                  {decisions.map((decision) => (
                    <article key={decision.sceneId} className="rounded-xl bg-candy-cream p-3 text-sm">
                      <p className="font-semibold">{decision.sceneTitle}</p>
                      <p className="mt-1">
                        {decision.firstChoiceText === decision.finalChoiceText ? (
                          <>“{decision.finalChoiceText}”</>
                        ) : (
                          <>
                            처음: “{decision.firstChoiceText}”<br />
                            다시 고른 말: “{decision.finalChoiceText}”
                          </>
                        )}
                      </p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{decision.feedback}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
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
