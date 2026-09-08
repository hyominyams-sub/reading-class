"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconEye, IconMedal, IconPodium, IconPrinter, IconRefresh, IconTrash } from "@/components/candy-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MISSIONS, WRITING } from "@/content/book";
import { completedCount, isCleared, MISSION_IDS, type StudentRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type WritingDetails = { sceneId?: string; sceneLabel?: string; who?: string; feelings?: string[]; text?: string; chars?: number };

function timeLabel(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function missionSummary(student: StudentRecord, id: 1 | 2 | 3): string {
  const r = student.missions[id];
  if (!r) return "";
  const d = (r.details ?? {}) as Record<string, unknown>;
  if (id === 1 && typeof d.firstTryCorrect === "number" && typeof d.decisionScenes === "number") return `첫 선택 ${d.firstTryCorrect}/${d.decisionScenes}`;
  if (id === 2 && typeof d.correct === "number" && typeof d.answered === "number") return `정답 ${d.correct}/${d.answered}`;
  if (id === 3 && typeof d.chars === "number") return `${d.chars}자`;
  return "";
}

export function TeacherView() {
  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<StudentRecord | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { students: StudentRecord[] };
      setStudents(data.students);
    } catch {
      /* 네트워크 오류는 다음 새로고침에서 복구 */
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [load]);

  async function reset() {
    setBusy(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      await load();
      setResetOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const list = students ?? [];
  const writing = (viewing?.missions[3]?.details ?? null) as WritingDetails | null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-heading text-primary-strong">교사용</p>
          <h1 className="font-heading text-3xl">학생 기록 관리</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/qr" className={cn(buttonVariants({ variant: "outline" }))}>
            <IconPrinter data-icon="inline-start" /> QR 인쇄
          </Link>
          <Link href="/board" className={cn(buttonVariants({ variant: "outline" }))}>
            <IconPodium data-icon="inline-start" /> 현황판
          </Link>
          <Button variant="outline" onClick={() => void load()}>
            <IconRefresh data-icon="inline-start" /> 새로고침
          </Button>
          <Button variant="destructive" onClick={() => setResetOpen(true)}>
            <IconTrash data-icon="inline-start" /> 전체 초기화
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["참여", `${list.length}명`],
          ["클리어", `${list.filter(isCleared).length}명`],
          ["미션 완료 수", `${list.reduce((s, st) => s + completedCount(st), 0)}개`],
          ["글쓰기 제출", `${list.filter((s) => s.missions[3]).length}편`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-card p-4 sticker">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-heading text-2xl tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-card sticker">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">참여 시각</th>
              {MISSION_IDS.map((id) => (
                <th key={id} className="px-4 py-3 font-semibold">
                  미션 {id} · {MISSIONS[id].subtitle}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">상태</th>
            </tr>
          </thead>
          <tbody>
            {students === null && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">불러오는 중…</td>
              </tr>
            )}
            {students !== null && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">아직 참여한 학생이 없어요.</td>
              </tr>
            )}
            {list.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 text-base font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{timeLabel(s.createdAt)}</td>
                {MISSION_IDS.map((id) => {
                  const r = s.missions[id];
                  return (
                    <td key={id} className="px-4 py-3">
                      {r ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border-2 border-ink bg-candy-mint px-2 py-0.5 text-xs font-bold text-ink">{r.score}점</span>
                          <span className="text-muted-foreground">{missionSummary(s, id)}</span>
                          {id === 3 && (
                            <Button variant="outline" size="xs" onClick={() => setViewing(s)}>
                              <IconEye data-icon="inline-start" /> 글 보기
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  {isCleared(s) ? (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-candy-mint px-2.5 py-0.5 text-xs font-bold text-ink">
                      <IconMedal className="size-3" /> 클리어
                    </span>
                  ) : (
                    <span className="text-muted-foreground tabular-nums">{completedCount(s)}/3</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>모든 기록을 지울까요?</DialogTitle>
            <DialogDescription>
              학생 {list.length}명의 이름과 미션 기록이 모두 삭제돼요. 학생 태블릿은 다음 접속 때 이름을 다시 입력하게 됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={busy}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => void reset()} disabled={busy}>
              {busy ? "지우는 중…" : "전체 초기화"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewing?.name ? `${viewing.name}의 마음 일기` : WRITING.title}
            </DialogTitle>
            <DialogDescription>
              {writing?.sceneLabel ?? "장면"} · {writing?.who ? `${writing.who}의 일기` : ""}
              {writing?.chars ? ` · ${writing.chars}자` : ""}
            </DialogDescription>
          </DialogHeader>
          {writing?.feelings && writing.feelings.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {writing.feelings.map((f) => (
                <span key={f} className="rounded-full bg-candy-blue px-2.5 py-0.5 text-xs font-bold text-ink">
                  {f}
                </span>
              ))}
            </div>
          )}
          <div className="paper-lines max-h-[50vh] overflow-y-auto rounded-xl border p-4 text-base leading-[36px] whitespace-pre-wrap">
            {writing?.text ?? "저장된 글이 없어요."}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
