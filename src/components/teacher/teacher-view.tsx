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
import { completedCount, currentMissionResult, isCleared, MISSION_IDS, type StudentRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type WritingDetails = { sceneId?: string; sceneLabel?: string; who?: string; feelings?: string[]; text?: string; chars?: number };
type DecisionRow = { sceneId?: string; sceneTitle?: string; firstChoiceIndex?: number; firstChoiceText?: string; finalChoiceIndex?: number; finalChoiceText?: string; reconsiderations?: number; feedback?: string };
type AnswerRow = { questionId?: string; question?: string; chosenText?: string; answerIndex?: number; correct?: boolean; explain?: string };

function safeText(value: unknown, fallback: string): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : fallback;
}

function timeLabel(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function missionSummary(student: StudentRecord, id: 1 | 2 | 3): string {
  const r = student.missions[id];
  if (!r) return "";
  const d = (r.details ?? {}) as Record<string, unknown>;
  if (id === 1) {
    const scenes = Array.isArray(d.decisions) ? d.decisions : [];
    const total = typeof d.decisionScenes === "number" ? d.decisionScenes : scenes.length;
    const first = typeof d.firstTryCorrect === "number"
      ? d.firstTryCorrect
      : scenes.filter((scene) => scene && typeof scene === "object" && (scene as { firstChoiceIndex?: unknown }).firstChoiceIndex === (scene as { finalChoiceIndex?: unknown }).finalChoiceIndex).length;
    if (total) return `선택한 장면 ${total}곳 · 첫 선택 ${first}/${total}`;
  }
  if (id === 2) {
    const answers = Array.isArray(d.answers) ? d.answers : [];
    const answered = typeof d.answered === "number" ? d.answered : answers.length;
    const correct = typeof d.correct === "number" ? d.correct : answers.filter((answer) => answer && typeof answer === "object" && (answer as { correct?: unknown }).correct === true).length;
    if (answered) return `맞힌 문제 ${correct}/${answered}`;
  }
  if (id === 3 && typeof d.chars === "number") return `${d.chars}자`;
  return "";
}

export function TeacherView() {
  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<StudentRecord | null>(null);
  const [viewingMission, setViewingMission] = useState<1 | 2 | 3 | null>(null);

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
  const viewedResult = viewing && viewingMission ? viewing.missions[viewingMission] : undefined;
  const viewedDetails = (viewedResult?.details ?? {}) as Record<string, unknown>;
  const writing = viewingMission === 3 ? viewedDetails as WritingDetails : null;
  const decisions = Array.isArray(viewedDetails.decisions) ? viewedDetails.decisions.flatMap((row): DecisionRow[] => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    return [{ sceneId: safeText(item.sceneId, "scene"), sceneTitle: safeText(item.sceneTitle, "장면"), firstChoiceText: safeText(item.firstChoiceText, "기록 없음"), finalChoiceText: safeText(item.finalChoiceText, "기록 없음"), reconsiderations: typeof item.reconsiderations === "number" ? item.reconsiderations : 0, feedback: typeof item.feedback === "string" ? item.feedback : undefined }];
  }) : [];
  const answers = Array.isArray(viewedDetails.answers) ? viewedDetails.answers.flatMap((row): AnswerRow[] => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    return [{ questionId: safeText(item.questionId, "question"), question: safeText(item.question, "문제"), chosenText: safeText(item.chosenText, "고른 답 없음"), correct: item.correct === true, explain: typeof item.explain === "string" ? item.explain : undefined }];
  }) : [];

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
          ["글쓰기 제출", `${list.filter((s) => Boolean(currentMissionResult(s, 3))).length}편`],
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
                  const current = currentMissionResult(s, id);
                  return (
                    <td key={id} className="px-4 py-3">
                      {r ? (
                        <div className="flex items-center gap-2">
                          {id === 3 ? (
                            <span className={cn("rounded-full border-2 border-ink px-2 py-0.5 text-xs font-bold text-ink", current ? "bg-candy-mint" : "bg-candy-cream")}>{current ? "작성 완료" : "작성 기록"}</span>
                          ) : (
                            <span className="rounded-full border-2 border-ink bg-candy-mint px-2 py-0.5 text-xs font-bold text-ink">{r.score}점</span>
                          )}
                          {!current && <span className="rounded-full bg-candy-cream px-2 py-0.5 text-xs font-semibold text-muted-foreground">이전 활동</span>}
                          <span className="text-muted-foreground">{missionSummary(s, id)}</span>
                          <Button variant="outline" size="xs" onClick={() => { setViewing(s); setViewingMission(id); }}>
                            <IconEye data-icon="inline-start" /> {id === 3 ? "글 보기" : "기록 보기"}
                            </Button>
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

      <Dialog open={viewing !== null && viewingMission !== null} onOpenChange={(open) => { if (!open) { setViewing(null); setViewingMission(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewing?.name ? `${viewing.name} · ${viewingMission === 3 ? (currentMissionResult(viewing, 3) ? WRITING.title : "이전 활동 기록") : MISSIONS[viewingMission ?? 1].title}` : WRITING.title}
            </DialogTitle>
            <DialogDescription>
              {viewingMission === 3 ? `${writing?.sceneLabel ?? "장면"} · ${writing?.who ? `${writing.who}의 보물글` : "보물글"}` : "학생이 선택하고 답한 기록이에요."}
              {writing?.chars ? ` · ${writing.chars}자` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewingMission === 1 && (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {decisions.length ? decisions.map((decision, index) => (
                <div key={`${decision.sceneId ?? "scene"}-${index}`} className="rounded-2xl bg-candy-cream p-3 text-sm">
                  <p className="font-bold">{decision.sceneTitle ?? `장면 ${index + 1}`}</p>
                  <p className="mt-1">첫 선택: {decision.firstChoiceText ?? "기록 없음"}</p>
                  <p>최종 선택: {decision.finalChoiceText ?? "기록 없음"} · 다시 고른 횟수 {decision.reconsiderations ?? 0}번</p>
                  {decision.feedback && <p className="mt-1 text-muted-foreground">{decision.feedback}</p>}
                </div>
              )) : <p className="text-sm text-muted-foreground">선택 상세 기록이 없어요.</p>}
            </div>
          )}
          {viewingMission === 2 && (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {answers.length ? answers.map((answer, index) => (
                <div key={`${answer.questionId ?? "question"}-${index}`} className="rounded-2xl bg-candy-cream p-3 text-sm">
                  <p className="font-bold">{answer.question ?? `문제 ${index + 1}`}</p>
                  <p className={answer.correct ? "text-green-700" : "text-destructive"}>{answer.chosenText ?? "고른 답 없음"} · {answer.correct ? "맞힘" : "다시 살펴볼 문제"}</p>
                  {answer.explain && <p className="mt-1 text-muted-foreground">{answer.explain}</p>}
                </div>
              )) : <p className="text-sm text-muted-foreground">문항별 기록이 없어요.</p>}
            </div>
          )}
          {viewingMission === 3 && writing?.feelings && writing.feelings.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {writing.feelings.map((f) => (
                <span key={f} className="rounded-full bg-candy-blue px-2.5 py-0.5 text-xs font-bold text-ink">
                  {f}
                </span>
              ))}
            </div>
          )}
          {viewingMission === 3 && (
            <div className="paper-lines max-h-[50vh] overflow-y-auto rounded-xl border p-4 text-base leading-[36px] whitespace-pre-wrap">
              {writing?.text ?? "저장된 글이 없어요."}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
