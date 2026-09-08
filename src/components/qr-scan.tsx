"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconQr, IconX } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import { MISSIONS } from "@/content/book";
import { resolveScannedRoute } from "@/lib/qr-route";
import { cn } from "@/lib/utils";

type Target = { path: string; label: string };

/** 찍은 QR이 우리 미션 QR이면 갈 곳과 화면에 보여 줄 이름을 돌려준다. */
function resolveScan(text: string): Target | null {
  const route = resolveScannedRoute(text, window.location.origin);
  if (!route) return null;
  const label = route.missionId
    ? `미션 ${route.missionId} · ${MISSIONS[route.missionId].title}`
    : "우리 반 현황판";
  return { path: route.path, label };
}

type Detected = { rawValue: string };
type DetectorInstance = { detect(source: CanvasImageSource): Promise<Detected[]> };
type DetectorCtor = {
  new (init?: { formats?: string[] }): DetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
};

/**
 * 화면 한 장에서 QR 글자를 뽑는 함수를 만든다.
 * 크롬 계열은 브라우저에 내장된 BarcodeDetector가 빠르고, 아이패드 사파리에는 없어서
 * 그때 jsQR을 내려받아 캔버스 픽셀을 직접 훑는다.
 */
async function createDecoder(): Promise<(video: HTMLVideoElement) => Promise<string | null>> {
  const Ctor = (globalThis as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
  if (Ctor) {
    try {
      const formats = (await Ctor.getSupportedFormats?.()) ?? ["qr_code"];
      if (formats.includes("qr_code")) {
        const detector = new Ctor({ formats: ["qr_code"] });
        return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
      }
    } catch {
      /* 내장 감지기를 못 쓰면 아래 jsQR로 */
    }
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!ctx || !video.videoWidth) return null;
    const scale = Math.min(1, 640 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

const SCAN_INTERVAL_MS = 120;

/** QR을 찍어 미션에 들어가는 버튼. 누르면 카메라 화면이 열린다. */
export function QrScanButton({ label = "QR 코드 찍기", className }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="xl" className={className} onClick={() => setOpen(true)}>
        <IconQr data-icon="inline-start" />
        {label}
      </Button>
      {open && <QrScanner onClose={() => setOpen(false)} />}
    </>
  );
}

function QrScanner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"starting" | "scanning" | "found" | "error">("starting");
  const [found, setFound] = useState<Target | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let timer: number | undefined;

    const stopCamera = () => stream?.getTracks().forEach((track) => track.stop());
    const fail = (message: string) => {
      if (stopped) return;
      setError(message);
      setPhase("error");
    };

    async function start() {
      const media = navigator.mediaDevices;
      if (!media?.getUserMedia) {
        fail(
          window.isSecureContext
            ? "이 기기에서는 카메라를 열 수 없어요. 선생님께 알려 주세요."
            : "http 주소에서는 카메라가 켜지지 않아요. https 주소로 접속하거나 선생님께 알려 주세요.",
        );
        return;
      }

      // 카메라 권한을 묻는 동안 QR 해독기도 같이 준비한다(사파리는 jsQR을 내려받는다).
      const decoderReady = createDecoder().catch(() => null);
      try {
        stream = await media.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        fail(
          name === "NotAllowedError"
            ? "카메라 사용을 '허용'으로 눌러 주세요."
            : name === "NotFoundError"
              ? "이 기기에는 쓸 수 있는 카메라가 없어요."
              : "카메라를 열지 못했어요. 잠시 뒤 다시 해 볼까요?",
        );
        return;
      }

      const video = videoRef.current;
      if (stopped || !video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* 자동 재생이 막혀도 아래에서 계속 시도한다 */
      }
      if (stopped) return;
      setPhase("scanning");

      const decode = await decoderReady;
      if (stopped) return;
      if (!decode) {
        fail("QR을 읽는 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.");
        return;
      }

      const tick = async () => {
        if (stopped) return;
        let text: string | null = null;
        try {
          text = await decode(video);
        } catch {
          /* 프레임 한 장쯤 실패해도 다음 장에서 다시 읽는다 */
        }
        if (stopped) return;
        if (text) {
          const target = resolveScan(text);
          if (target) {
            stopped = true;
            stopCamera();
            if ("vibrate" in navigator) navigator.vibrate(60);
            setNotice(null);
            setFound(target);
            setPhase("found");
            return;
          }
          setNotice("우리 반 미션 QR이 아니에요. 미션 QR을 찾아서 다시 찍어 볼까요?");
        }
        timer = window.setTimeout(() => void tick(), SCAN_INTERVAL_MS);
      };
      void tick();
    }

    void start();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // 찾은 미션 이름을 잠깐 보여 주고 넘어간다.
  useEffect(() => {
    if (!found) return;
    const timer = window.setTimeout(() => router.push(found.path), 550);
    return () => window.clearTimeout(timer);
  }, [found, router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR 코드 찍기"
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 text-white"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
        <p className="font-heading text-xl">미션 QR을 찍어요</p>
        <Button variant="outline" size="icon-lg" onClick={onClose} aria-label="닫기" className="text-ink">
          <IconX className="size-5" />
        </Button>
      </div>

      <div className="relative mx-auto mt-4 w-full max-w-md flex-1 overflow-hidden rounded-3xl border-[3px] border-white bg-black/60">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={cn("h-full w-full object-cover", phase === "starting" || phase === "error" ? "opacity-0" : "opacity-100")}
        />

        {(phase === "scanning" || phase === "starting") && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative aspect-square w-[64%] max-w-72">
              <span className="absolute top-0 left-0 size-10 rounded-tl-2xl border-t-[6px] border-l-[6px] border-candy-pink" />
              <span className="absolute top-0 right-0 size-10 rounded-tr-2xl border-t-[6px] border-r-[6px] border-candy-blue" />
              <span className="absolute bottom-0 left-0 size-10 rounded-bl-2xl border-b-[6px] border-l-[6px] border-candy-yellow" />
              <span className="absolute right-0 bottom-0 size-10 rounded-br-2xl border-r-[6px] border-b-[6px] border-candy-mint" />
            </div>
          </div>
        )}

        {phase === "starting" && (
          <p className="absolute inset-0 grid place-items-center font-heading text-lg">카메라를 켜는 중…</p>
        )}

        {phase === "found" && found && (
          <div className="absolute inset-0 grid place-items-center bg-ink/85 p-6 text-center candy-pop">
            <div>
              <span className="mx-auto grid size-20 place-items-center rounded-full border-[3px] border-ink bg-candy-mint text-ink">
                <IconCheck className="size-12" />
              </span>
              <p className="mt-4 font-heading text-2xl">{found.label}</p>
              <p className="mt-1 text-white/80">들어가는 중…</p>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <span className="mx-auto grid size-16 place-items-center rounded-full border-[3px] border-ink bg-candy-yellow font-heading text-3xl text-ink">
                !
              </span>
              <p className="mt-4 text-lg leading-relaxed font-medium">{error}</p>
              <p className="mt-2 text-sm text-white/70">
                카메라가 안 되면 선생님이 오른쪽 위 <b>QR 없이 들어가기</b>로 열어 줄 수 있어요.
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto mt-4 max-w-md text-center leading-relaxed text-white/85">
        {notice ?? "교실에 붙은 미션 QR을 네모 안에 맞춰 주세요."}
      </p>
    </div>
  );
}
