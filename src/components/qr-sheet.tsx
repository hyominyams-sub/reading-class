"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { IconPodium, IconPrinter, MISSION_ICONS } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MISSIONS } from "@/content/book";
import { cn } from "@/lib/utils";

type Entry = { path: string; badge: string; title: string; desc: string; icon: React.ReactNode };

const ENTRIES: Entry[] = [
  { path: "/board", badge: "전체 현황판", title: "우리 반 미션 현황", desc: "누가 어디까지 했는지 한눈에 봐요", icon: <IconPodium className="size-5" /> },
  { path: "/mission/1", badge: "미션 1", title: MISSIONS[1].title, desc: MISSIONS[1].subtitle, icon: <MISSION_ICONS.chat className="size-5" /> },
  { path: "/mission/2", badge: "미션 2", title: MISSIONS[2].title, desc: MISSIONS[2].subtitle, icon: <MISSION_ICONS.run className="size-5" /> },
  { path: "/mission/3", badge: "미션 3", title: MISSIONS[3].title, desc: MISSIONS[3].subtitle, icon: <MISSION_ICONS.pen className="size-5" /> },
];

const noop = () => () => {};
function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noop, read, () => serverValue);
}

export function QrSheet({ lanHosts }: { lanHosts: string[] }) {
  const origin = useClientValue(() => window.location.origin, "");
  const port = useClientValue(() => window.location.port || (window.location.protocol === "https:" ? "443" : "80"), "3000");
  const [override, setOverride] = useState<string | null>(null);
  const baseUrl = override ?? origin;
  const setBaseUrl = (value: string) => setOverride(value);

  const suggestions = lanHosts.map((host) => `http://${host}:${port}`);
  const trimmed = baseUrl.replace(/\/+$/, "");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="no-print rounded-2xl bg-card p-5 sticker sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl">QR 코드 인쇄</h1>
            <p className="mt-1 text-muted-foreground">
              4종의 QR을 인쇄해 교실 곳곳에 붙여요. 태블릿이 접속할 주소(선생님 컴퓨터의 와이파이 주소)를 확인하세요.
            </p>
          </div>
          <Button size="lg" onClick={() => window.print()}>
            <IconPrinter data-icon="inline-start" />
            인쇄하기
          </Button>
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="base-url" className="text-sm font-semibold">접속 주소</Label>
          <Input id="base-url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="h-11 font-mono text-base" spellCheck={false} />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>이 컴퓨터의 네트워크 주소:</span>
              {suggestions.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setBaseUrl(url)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-xs transition-colors hover:bg-candy-cream",
                    trimmed === url && "border-ink bg-candy-yellow text-ink",
                  )}
                >
                  {url}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            localhost 주소는 이 컴퓨터에서만 열려요. 태블릿에서 열려면 같은 와이파이의 네트워크 주소를 골라 주세요.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 print:block">
        {ENTRIES.map((entry) => (
          <QrCard key={entry.path} entry={entry} url={trimmed ? `${trimmed}${entry.path}` : ""} />
        ))}
      </div>
    </main>
  );
}

function QrCard({ entry, url }: { entry: Entry; url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    QRCode.toCanvas(ref.current, url, {
      width: 420,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f1f3d", light: "#ffffff" },
    }).catch(() => undefined);
  }, [url]);

  return (
    <article className="flex flex-col items-center rounded-2xl bg-card p-6 text-center sticker print:min-h-screen print:justify-center print:break-after-page print:ring-0">
      <span className="inline-flex items-center gap-2 rounded-full bg-candy-pink px-4 py-1.5 font-heading text-ink sticker-xs print:text-lg">
        {entry.icon}
        {entry.badge}
      </span>
      <h2 className="mt-3 font-heading text-2xl print:text-4xl">{entry.title}</h2>
      <p className="text-muted-foreground print:text-xl">{entry.desc}</p>
      <canvas ref={ref} className="mt-4 aspect-square h-auto w-full max-w-[360px] print:max-w-[520px]" aria-label={`${entry.badge} QR 코드`} />
      <p className="mt-3 max-w-full break-all font-mono text-xs text-muted-foreground print:text-base">{url || "주소를 입력하면 QR이 만들어져요"}</p>
      <p className="mt-2 hidden text-lg font-medium print:block">앱 홈의 “QR 코드 찍기” 또는 태블릿 카메라로 이 QR을 찍으세요</p>
    </article>
  );
}
