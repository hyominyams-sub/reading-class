"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { IconArrow, IconLock, IconPodium, IconPrinter, IconUsers, MISSION_ICONS } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MISSIONS } from "@/content/book";
import { ADMIN_CODE, isAdminUnlocked, setAdminUnlocked } from "@/lib/admin";
import { MISSION_IDS } from "@/lib/types";

const TOOLS = [
  { href: "/board", label: "우리 반 현황판", icon: <IconPodium className="size-5" /> },
  { href: "/qr", label: "QR 인쇄 시트", icon: <IconPrinter className="size-5" /> },
  { href: "/teacher", label: "교사용 기록 관리", icon: <IconUsers className="size-5" /> },
];

/** 오른쪽 위 뒷문: 암호를 넣으면 QR 없이 미션으로 바로 들어간다. */
export function AdminEntry() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openDialog = () => {
    setUnlocked(isAdminUnlocked());
    setCode("");
    setError(null);
    setOpen(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (code.trim() !== ADMIN_CODE) {
      setError("암호가 맞지 않아요.");
      setCode("");
      return;
    }
    setAdminUnlocked(true);
    setUnlocked(true);
    setError(null);
    setCode("");
  };

  const lock = () => {
    setAdminUnlocked(false);
    setUnlocked(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        aria-label="QR 없이 들어가기"
        className="size-9 gap-1.5 p-0 sm:h-9 sm:w-auto sm:px-3 sm:pl-2.5"
      >
        <IconLock className="size-5" />
        <span className="hidden sm:inline">QR 없이 들어가기</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{unlocked ? "어디로 들어갈까요?" : "선생님 확인"}</DialogTitle>
            <DialogDescription>
              {unlocked
                ? "QR 없이 바로 열 수 있어요. 학생 태블릿은 QR을 찍어 들어가게 해 주세요."
                : "QR 없이 미션에 들어가려면 관리자 암호가 필요해요."}
            </DialogDescription>
          </DialogHeader>

          {unlocked ? (
            <div className="grid gap-2">
              {MISSION_IDS.map((id) => {
                const Icon = MISSION_ICONS[MISSIONS[id].icon];
                return (
                  <Link
                    key={id}
                    href={`/mission/${id}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-2xl bg-card p-3 text-ink sticker-sm sticker-press"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-candy-cream">
                      <Icon className="size-7" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-base">
                        미션 {id} · {MISSIONS[id].title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{MISSIONS[id].subtitle}</span>
                    </span>
                    <IconArrow className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}

              <div className="mt-1 flex flex-wrap gap-2">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-ink sticker-xs sticker-press"
                  >
                    {tool.icon}
                    {tool.label}
                  </Link>
                ))}
              </div>

              <Button variant="ghost" size="sm" onClick={lock} className="mt-1 justify-self-start text-muted-foreground">
                <IconLock data-icon="inline-start" className="size-4" />
                다시 잠그기
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-3">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={8}
                autoFocus
                aria-label="관리자 암호"
                placeholder="••••"
                className="h-14 rounded-2xl border-[2.5px] border-ink bg-candy-cream text-center font-mono text-2xl tracking-[0.4em] shadow-[3px_3px_0_0_var(--ink)]"
              />
              {error && (
                <p className="text-center text-sm font-semibold text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg">
                들어가기
                <IconArrow data-icon="inline-end" />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
