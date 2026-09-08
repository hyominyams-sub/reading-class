"use client";

import { useState, type FormEvent } from "react";
import { IconArrow, IconLollipop } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SceneIllustration } from "@/components/illustrations/scene";
import { useStudent } from "@/lib/student-context";
import { BOOK } from "@/content/book";

/** 이름이 없으면 이름 입력 화면을, 있으면 children을 보여 준다. */
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
  if (status === "anonymous") return <NameEntry />;
  return <>{children}</>;
}

function NameEntry() {
  const { register } = useStudent();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("이름을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card sticker candy-pop">
        <div className="aspect-[2/1] w-full border-b-[3px] border-ink">
          <SceneIllustration scene="book" className="h-full w-full" />
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <p className="inline-block rounded-full bg-candy-yellow px-3 py-0.5 text-sm font-bold text-ink sticker-xs">
              {BOOK.title}
            </p>
            <h1 className="mt-2 font-heading text-3xl">이름을 알려 주세요</h1>
            <p className="mt-1 text-muted-foreground">미션을 완료하면 현황판에 이름이 표시돼요.</p>
          </div>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예) 김하늘"
            maxLength={12}
            autoFocus
            autoComplete="off"
            enterKeyHint="go"
            aria-label="이름"
            className="h-16 rounded-2xl border-[2.5px] border-ink bg-candy-cream px-4 text-xl font-bold shadow-[3px_3px_0_0_var(--ink)] placeholder:font-medium placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring/60"
          />
          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="xl" disabled={busy}>
            {busy ? "등록 중…" : "시작하기"}
            <IconArrow data-icon="inline-end" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">태블릿 한 대에 한 명씩 입력해요.</p>
        </form>
      </div>
    </main>
  );
}
