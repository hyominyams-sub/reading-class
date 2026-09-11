"use client";

import { MissionFrame } from "@/components/mission-frame";
import { StudentGate } from "@/components/student-gate";
import { WritingActivity, type WritingResult } from "@/components/missions/writing-activity";
import { useStudent } from "@/lib/student-context";
import { WRITING } from "@/content/book";

export function Mission3() {
  const { student, mode } = useStudent();
  const isGuest = mode === "guest";
  const howTo = [
    "마음에 남은 장면 하나를 골라요.",
    "그때 내 마음에 어울리는 감정 낱말을 1~3개 골라요.",
    `생각한 보물과 소중한 까닭을 짧게 써요. 공백을 빼고 ${WRITING.minChars}자 이상이면 ${isGuest ? "완성할" : "제출할"} 수 있어요.`,
  ];
  return (
    <StudentGate>
      <MissionFrame
        mission={3}
        scene="book"
        howTo={howTo}
        summary={(outcome) => {
          const d = outcome.details as Partial<WritingResult> | undefined;
          if (!d?.text) return null;
          return (
            <div className="rounded-xl bg-muted/70 p-4">
              <p className="text-xs text-muted-foreground">
                {d.sceneLabel} · {d.chars}자
              </p>
              <p className="mt-2 line-clamp-4 leading-relaxed whitespace-pre-wrap">{d.text}</p>
            </div>
          );
        }}
      >
        {(complete) => (
          <WritingActivity
            config={WRITING}
            studentName={student?.name ?? ""}
            isGuest={isGuest}
            onComplete={(result) => complete(result.score, { ...result })}
          />
        )}
      </MissionFrame>
    </StudentGate>
  );
}
