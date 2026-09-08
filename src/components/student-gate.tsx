"use client";

import { useState } from "react";
import { IconArrow, IconBook, IconLollipop, IconUsers } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { SceneIllustration } from "@/components/illustrations/scene";
import { useStudent } from "@/lib/student-context";
import { BOOK } from "@/content/book";
import { CLASS_ROSTER, type ClassStudent } from "@/lib/class-roster";

/** 로그인하지 않았으면 역할과 학생을 고르게 하고, 로그인 뒤 children을 보여 준다. */
export function StudentGate({ children }: { children: React.ReactNode }) {
  const { status } = useStudent();
  if (status === "loading") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
        <IconLollipop className="size-10 text-ink motion-safe:animate-spin [animation-duration:1.6s]" />
        <span className="font-heading text-lg">불러오는 중…</span>
      </div>
    );
  }
  if (status === "anonymous") return <LoginEntry />;
  return <>{children}</>;
}

type Step = "role" | "roster" | "confirm";

function LoginEntry() {
  const { register, enterGuest, registerError } = useStudent();
  const [step, setStep] = useState<Step>("role");
  const [selected, setSelected] = useState<ClassStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chooseStudent = (student: ClassStudent) => {
    setSelected(student);
    setError(null);
    setStep("confirm");
  };

  async function confirmStudent() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await register(selected.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-card sticker candy-pop">
        <div className="aspect-[2/1] w-full border-b-[3px] border-ink">
          <SceneIllustration scene="book" className="h-full w-full" />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div>
            <p className="inline-block rounded-full bg-candy-yellow px-3 py-0.5 text-sm font-bold text-ink sticker-xs">
              {BOOK.title}
            </p>
            <h1 className="mt-3 font-heading text-3xl sm:text-4xl">
              {step === "role" && "어떻게 들어갈까요?"}
              {step === "roster" && "내 번호표를 골라요"}
              {step === "confirm" && `${selected?.name} 학생이 맞나요?`}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {step === "role" && "학생은 이름을 고르고, 참관자는 게스트로 들어가요."}
              {step === "roster" && "번호와 이름을 확인한 뒤 눌러 주세요."}
              {step === "confirm" && `${selected?.number}번 ${selected?.name} 학생으로 미션을 시작해요.`}
            </p>
          </div>

          {step === "role" && (
            <div className="grid gap-3">
              <Button size="xl" onClick={() => setStep("roster")} className="h-20 text-xl">
                <IconBook data-icon="inline-start" className="size-7" />
                학생 로그인
                <IconArrow data-icon="inline-end" />
              </Button>
              <Button variant="outline" size="lg" onClick={enterGuest} className="mx-auto h-10 px-5 text-sm">
                <IconUsers data-icon="inline-start" />
                게스트 로그인
              </Button>
            </div>
          )}

          {step === "roster" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CLASS_ROSTER.map((student) => (
                <button
                  key={student.number}
                  type="button"
                  onClick={() => chooseStudent(student)}
                  className="flex min-h-16 items-center gap-3 rounded-2xl bg-candy-cream px-3 py-2 text-left sticker-sm sticker-press focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-candy-yellow font-heading text-sm">
                    {student.number}
                  </span>
                  <span className="font-heading text-lg">{student.name}</span>
                </button>
              ))}
            </div>
          )}

          {step === "confirm" && selected && (
            <div className="rounded-3xl bg-candy-blue p-5 text-center sticker-sm">
              <span className="mx-auto grid size-16 place-items-center rounded-full border-[3px] border-ink bg-card font-heading text-2xl">
                {selected.number}
              </span>
              <p className="mt-3 font-heading text-3xl">{selected.name}</p>
            </div>
          )}

          {(error ?? registerError) && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error ?? registerError}
            </p>
          )}
          {step === "roster" && (
            <Button variant="ghost" size="lg" onClick={() => setStep("role")} className="self-start text-muted-foreground">
              로그인 방법 다시 고르기
            </Button>
          )}
          {step === "confirm" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" size="xl" onClick={() => setStep("roster")} disabled={busy}>
                다시 고르기
              </Button>
              <Button size="xl" onClick={confirmStudent} disabled={busy}>
                {busy ? "들어가는 중…" : "네, 맞아요"}
                <IconArrow data-icon="inline-end" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
