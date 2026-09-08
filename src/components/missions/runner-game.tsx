"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { IconArrow, IconArrowDown, IconArrowUp, IconBoss, IconCheck, IconMute, IconPlay, IconSound, IconX } from "@/components/candy-icons";
import { Button } from "@/components/ui/button";
import type { RunnerQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * 미션 1: 2D 횡스크롤 러너 (루미 달리기)
 * - 하트/사망 없음: 장애물에 부딪히면 잠깐 휘청이고 점수만 조금 잃는다.
 * - 문제 수 = 단계 수. 마지막 문제(5단계)에서 보스가 등장한다.
 * - 캐릭터 스프라이트는 /images/runner/rumi.json 매니페스트를 읽어 그린다.
 */

export type RunnerResult = { score: number; correct: number; total: number; timeSec: number; coins: number };

type Props = { questions: RunnerQuestion[]; onComplete: (result: RunnerResult) => void };

type Phase = "loading" | "ready" | "running" | "quiz" | "clear";
type QuizView = { index: number; question: RunnerQuestion; isBoss: boolean; answered: { chosen: number; correct: boolean } | null };
type Feedback = { id: number; text: string; kind: "good" | "bad" | "info" };
type Hud = { score: number; stage: number; correct: number };

const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const GROUND_Y = 415;
const GRAVITY = 0.6;
const FIRST_QUIZ_DELAY = 4000;
const QUIZ_INTERVAL = 11000;
const MAX_SPEED = 7.5;
const SCORE = { quizCorrect: 70, coin: 8, stomp: 5, obstacle: -5, survivalPerFrame: 0.02 } as const;
const SOUND_KEY = "reading-class:runner-sound";
const ASSETS = {
  background: "/images/runner/background.png",
  enemy: "/images/runner/enemy.png",
  air: "/images/runner/cloud.png",
  boss: "/images/runner/boss.png",
  manifest: "/images/runner/rumi.json",
} as const;

type SpriteState = "run" | "jump" | "double" | "slide" | "hit";
type SpriteFrames = { sy: number; w: number; h: number; count: number; fps: number };
type SpriteManifest = { image: string; scale: number; states: Record<SpriteState, SpriteFrames> };

const FALLBACK_FRAMES: Record<SpriteState, SpriteFrames> = {
  run: { sy: 0, w: 96, h: 96, count: 6, fps: 12 },
  jump: { sy: 96, w: 96, h: 96, count: 2, fps: 6 },
  double: { sy: 192, w: 96, h: 96, count: 2, fps: 10 },
  slide: { sy: 288, w: 96, h: 96, count: 2, fps: 8 },
  hit: { sy: 384, w: 96, h: 96, count: 2, fps: 4 },
};

type Hooks = {
  setPhase: Dispatch<SetStateAction<Phase>>;
  setQuiz: Dispatch<SetStateAction<QuizView | null>>;
  setHud: Dispatch<SetStateAction<Hud>>;
  setBossVisible: Dispatch<SetStateAction<boolean>>;
  pushFeedback: (text: string, kind: Feedback["kind"]) => void;
  onComplete: (result: RunnerResult) => void;
};

type Engine = {
  start(): void;
  jump(): void;
  slideStart(): void;
  slideEnd(): void;
  answer(index: number): void;
  resume(): void;
  setSound(on: boolean): void;
  destroy(): void;
};

type Rect = { x: number; y: number; w: number; h: number };

const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5,
};

type Track = { tempo: number; notes: [number, number][] };
const TRACKS: Record<"forest" | "boss", Track> = {
  forest: {
    tempo: 160,
    notes: [
      [NOTE.C4, 0.5], [NOTE.E4, 0.5], [NOTE.G4, 0.5], [NOTE.E4, 0.5],
      [NOTE.C4, 0.5], [NOTE.E4, 0.5], [NOTE.G4, 0.5], [NOTE.C5, 0.5],
      [NOTE.F4, 0.5], [NOTE.A4, 0.5], [NOTE.C5, 0.5], [NOTE.A4, 0.5],
      [NOTE.G4, 0.5], [NOTE.E4, 0.5], [NOTE.D4, 0.5], [NOTE.E4, 0.5],
      [NOTE.C4, 1], [NOTE.G4, 1],
      [NOTE.E4, 0.5], [NOTE.F4, 0.5], [NOTE.E4, 0.5], [NOTE.D4, 0.5],
      [NOTE.C4, 1],
    ],
  },
  boss: {
    tempo: 240,
    notes: [
      [NOTE.A4, 0.5], [NOTE.A4, 0.5], [NOTE.C5, 0.5], [NOTE.A4, 0.5],
      [NOTE.D5, 0.5], [NOTE.A4, 0.5], [NOTE.E5, 0.5], [NOTE.D5, 0.5],
      [NOTE.C5, 0.5], [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.C5, 0.5],
      [NOTE.G5, 0.5], [NOTE.E5, 0.5], [NOTE.A5, 1],
      [NOTE.G4, 0.5], [NOTE.G4, 0.5], [NOTE.B4, 0.5], [NOTE.G4, 0.5],
      [NOTE.A4, 2],
    ],
  },
};

/* 소리 켬/끔 설정: localStorage에 저장하고 useSyncExternalStore로 읽는다 (SSR 기본값 false) */
const soundListeners = new Set<() => void>();
function readSoundPref(): boolean {
  try { return window.localStorage.getItem(SOUND_KEY) === "1"; } catch { return false; }
}
function writeSoundPref(on: boolean) {
  try { window.localStorage.setItem(SOUND_KEY, on ? "1" : "0"); } catch { /* ignore */ }
  soundListeners.forEach((listener) => listener());
}
function subscribeSound(listener: () => void) {
  soundListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    soundListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function createEngine(canvas: HTMLCanvasElement, questions: RunnerQuestion[], hooks: Hooks): Engine {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D 캔버스를 사용할 수 없어요.");
  const c = ctx;
  const total = questions.length;
  const fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";

  /* ---------------- 사운드 ---------------- */
  let audio: AudioContext | null = null;
  let soundOn = false;
  let musicTrack: keyof typeof TRACKS = "forest";
  let musicPlaying = false;
  let musicTimer = 0;
  let musicNext = 0;
  let musicIndex = 0;

  function ensureAudio(): AudioContext | null {
    if (!audio) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
    }
    if (audio.state === "suspended") void audio.resume();
    return audio;
  }

  function tone(freq: number, time: number, duration: number) {
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.004, time + duration * 0.9);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  function schedule() {
    if (!musicPlaying || !audio) return;
    const track = TRACKS[musicTrack];
    while (musicNext < audio.currentTime + 0.1) {
      const [freq, beats] = track.notes[musicIndex];
      const dur = beats * (60 / track.tempo);
      tone(freq, musicNext, dur);
      musicNext += dur;
      musicIndex = (musicIndex + 1) % track.notes.length;
    }
    musicTimer = window.setTimeout(schedule, 25);
  }

  function stopMusic() {
    musicPlaying = false;
    window.clearTimeout(musicTimer);
  }

  function playMusic(track: keyof typeof TRACKS) {
    musicTrack = track;
    if (!soundOn) return;
    const a = ensureAudio();
    if (!a) return;
    stopMusic();
    musicPlaying = true;
    musicNext = a.currentTime + 0.1;
    musicIndex = 0;
    schedule();
  }

  function playSound(type: "jump" | "stomp" | "hit" | "coin" | "correct" | "clear") {
    if (!soundOn) return;
    const a = ensureAudio();
    if (!a) return;
    const now = a.currentTime;
    const blip = (kind: OscillatorType, from: number, to: number, dur: number, vol: number, at = 0) => {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = kind;
      osc.frequency.setValueAtTime(from, now + at);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + at + dur);
      gain.gain.setValueAtTime(vol, now + at);
      gain.gain.exponentialRampToValueAtTime(0.001, now + at + dur);
      osc.connect(gain);
      gain.connect(a.destination);
      osc.start(now + at);
      osc.stop(now + at + dur);
    };
    switch (type) {
      case "jump": blip("square", 150, 600, 0.1, 0.05); break;
      case "stomp": blip("sine", 600, 150, 0.15, 0.1); break;
      case "hit": blip("sawtooth", 150, 50, 0.3, 0.08); break;
      case "coin": blip("sine", 987.77, 987.77, 0.08, 0.1); blip("sine", 1318.51, 1318.51, 0.25, 0.1, 0.08); break;
      case "correct": blip("triangle", NOTE.E5, NOTE.E5, 0.12, 0.1); blip("triangle", NOTE.G5, NOTE.G5, 0.12, 0.1, 0.12); blip("triangle", NOTE.C6, NOTE.C6, 0.3, 0.1, 0.24); break;
      case "clear": [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => blip("triangle", f, f, 0.18, 0.1, i * 0.12)); break;
    }
  }

  /* ---------------- 에셋 ---------------- */
  const images: { bg: HTMLImageElement | null; enemy: HTMLImageElement | null; air: HTMLImageElement | null; boss: HTMLImageElement | null } = {
    bg: null, enemy: null, air: null, boss: null,
  };
  let sprite: { img: HTMLImageElement; manifest: SpriteManifest } | null = null;

  void loadImage(ASSETS.background).then((img) => { images.bg = img; });
  void loadImage(ASSETS.enemy).then((img) => { images.enemy = img; });
  void loadImage(ASSETS.air).then((img) => { images.air = img; });
  void loadImage(ASSETS.boss).then((img) => { images.boss = img; });

  fetch(ASSETS.manifest, { cache: "no-store" })
    .then((res) => (res.ok ? (res.json() as Promise<SpriteManifest>) : Promise.reject(new Error("no manifest"))))
    .then(async (manifest) => {
      const img = await loadImage(manifest.image);
      if (img) sprite = { img, manifest };
    })
    .catch(() => undefined)
    .finally(() => {
      if (!destroyed) hooks.setPhase("ready");
    });

  function frames(state: SpriteState): SpriteFrames {
    return sprite?.manifest.states[state] ?? FALLBACK_FRAMES[state];
  }

  function drawSize(state: SpriteState) {
    const f = frames(state);
    const scale = sprite?.manifest.scale ?? 0.9;
    return { w: f.w * scale, h: f.h * scale };
  }

  /* ---------------- 상태 ---------------- */
  let destroyed = false;
  let running = false;
  let paused = false;
  let cleared = false;
  let finished = false;
  let bossMode = false;
  let gameSpeed = 4;
  let score = 0;
  let coinsCollected = 0;
  let correctCount = 0;
  let quizCount = 0;
  let startTime = 0;
  let lastQuizTime = 0;
  let lastTime = 0;
  let raf = 0;
  let hudTimer = 0;
  let obstacleTimer = 0;
  let nextObstacleGap = 1400;
  let coinTimer = 0;
  let bossT = 0;
  let clearAnim = 0;
  const keys = { down: false };

  class Particle {
    x: number; y: number; size: number; color: string; vx: number; vy: number;
    constructor(x: number, y: number, size: number, color: string) {
      this.x = x; this.y = y; this.size = size; this.color = color;
      this.vx = Math.random() * 3 - 1.5;
      this.vy = Math.random() * 3 - 1.5;
    }
    update() { this.x += this.vx; this.y += this.vy; this.size -= 0.15; }
    draw() {
      if (this.size <= 0) return;
      c.fillStyle = this.color;
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
    }
  }
  let particles: Particle[] = [];
  function burst(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, Math.random() * 5 + 3, color));
  }

  function drawFallbackRumi(x: number, y: number, w: number, state: SpriteState, frame: number) {
    const u = w / 32;
    c.save();
    c.translate(x, y);
    const px = (gx: number, gy: number, gw: number, gh: number, color: string) => {
      c.fillStyle = color;
      c.fillRect(gx * u, gy * u, gw * u, gh * u);
    };
    if (state === "slide") {
      px(6, 22, 18, 9, "#1c1c22"); px(8, 21, 8, 5, "#604ea8"); px(9, 25, 6, 1, "#ffe066");
      px(22, 21, 6, 6, "#ffffff"); px(23, 20, 4, 2, "#1c1c22"); px(28, 23, 4, 2, "#f6a62e"); px(26, 23, 1, 1, "#14141a");
      px(2, 27, 5, 1, "#f4cb4a"); px(2, 29, 6, 1, "#f4cb4a");
    } else if (state === "hit") {
      px(7, 19, 16, 10, "#1c1c22"); px(8, 22, 7, 5, "#604ea8"); px(15, 8, 10, 10, "#ffffff"); px(15, 8, 10, 3, "#1c1c22");
      px(22, 13, 1, 1, "#14141a"); px(24, 13, 1, 1, "#14141a"); px(25, 12, 4, 2, "#f6a62e");
      px(11, 29, 6, 1, "#f4cb4a"); px(16, 29, 6, 1, "#f4cb4a");
      [[10, 3], [24, 2], [18, 5]].forEach(([sx, sy], i) => { if ((i + frame) % 2 === 0) px(sx, sy, 2, 2, "#ffd166"); });
    } else {
      const bob = state === "run" && frame % 2 === 1 ? -1 : 0;
      const legA = state === "run" ? [-3, -1, 1, 3, 1, -1][frame % 6] : -3;
      c.strokeStyle = "#f4cb4a";
      c.lineWidth = u;
      c.beginPath();
      c.moveTo(13 * u, (22 + bob) * u); c.lineTo((13 + legA) * u, 30 * u);
      c.moveTo(17 * u, (22 + bob) * u); c.lineTo((17 - legA) * u, 30 * u);
      c.stroke();
      px(8, 12 + bob, 14, 10, "#1c1c22"); px(17, 14 + bob, 5, 6, "#ffffff");
      if (state === "jump" || (state === "double" && frame % 2 === 0)) px(9, 6 + bob, 8, 7, "#604ea8");
      else px(10, 14 + bob, 8, 6, "#604ea8");
      px(11, 17 + bob, 6, 1, "#ffe066"); px(19, 7 + bob, 3, 6, "#ffffff"); px(16, 1 + bob, 10, 10, "#ffffff"); px(16, 1 + bob, 10, 3, "#1c1c22");
      px(23, 5 + bob, 1, 2, "#14141a"); px(22, 8 + bob, 2, 1, "#f48a98"); px(26, 5 + bob, 4, 2, "#f6a62e");
    }
    c.restore();
  }

  class Player {
    x = 100;
    y = GROUND_Y;
    vy = 0;
    state: SpriteState = "run";
    grounded = true;
    jumps = 0;
    invincible = false;
    invTimer = 0;
    hitTimer = 0;
    frame = 0;
    frameTimer = 0;

    reset() {
      this.y = GROUND_Y; this.vy = 0; this.state = "run"; this.grounded = true; this.jumps = 0;
      this.invincible = false; this.invTimer = 0; this.hitTimer = 0; this.frame = 0; this.frameTimer = 0;
    }

    update(dt: number) {
      const f = dt / 16.67;
      this.vy += GRAVITY * f;
      this.y += this.vy * f;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y; this.vy = 0; this.grounded = true; this.jumps = 0;
      } else {
        this.grounded = false;
      }

      let next: SpriteState;
      if (this.hitTimer > 0) { this.hitTimer -= dt; next = "hit"; }
      else if (!this.grounded) next = this.jumps >= 2 ? "double" : "jump";
      else if (keys.down) next = "slide";
      else next = "run";
      if (next !== this.state) { this.state = next; this.frame = 0; this.frameTimer = 0; }

      if (this.invincible) {
        this.invTimer -= dt;
        if (this.invTimer <= 0) this.invincible = false;
      }

      const info = frames(this.state);
      this.frameTimer += dt;
      const interval = 1000 / info.fps;
      while (this.frameTimer >= interval) {
        this.frameTimer -= interval;
        this.frame = (this.frame + 1) % info.count;
      }
    }

    jump() {
      if (this.hitTimer > 0 || this.jumps >= 2) return;
      this.vy = this.jumps === 0 ? -12 : -11;
      this.jumps += 1;
      this.grounded = false;
      playSound("jump");
      burst(this.x + 30, this.y, 5, "#ffffff");
    }

    slide() {
      if (!this.grounded) this.vy += 5;
    }

    hit() {
      if (this.invincible || this.hitTimer > 0) return;
      playSound("hit");
      this.invincible = true;
      this.invTimer = 1400;
      this.hitTimer = 500;
      this.vy = -5;
      score = Math.max(0, score + SCORE.obstacle);
      burst(this.x + 40, this.y - 40, 10, "#ff6b6b");
      hooks.pushFeedback("앗, 휘청!", "bad");
    }

    hitbox(): Rect {
      const { w, h } = drawSize(this.state);
      if (this.state === "slide") return { x: this.x + w * 0.15, y: GROUND_Y - 28, w: w * 0.7, h: 26 };
      return { x: this.x + w * 0.28, y: this.y - h * 0.85, w: w * 0.44, h: h * 0.8 };
    }

    draw() {
      if (this.invincible && this.hitTimer <= 0 && Math.floor(performance.now() / 100) % 2 === 0) return;
      const { w, h } = drawSize(this.state);
      const dx = this.x;
      const dy = this.y - h;
      if (sprite) {
        const info = sprite.manifest.states[this.state] ?? sprite.manifest.states.run;
        const frame = this.frame % info.count;
        c.drawImage(sprite.img, frame * info.w, info.sy, info.w, info.h, dx, dy, w, h);
      } else {
        drawFallbackRumi(dx, dy, w, this.state, this.frame);
      }
    }
  }

  class Obstacle {
    type: "ground" | "air";
    x = GAME_WIDTH;
    y: number;
    w: number;
    h: number;
    rotation = 0;
    dead = false;
    constructor(type: "ground" | "air") {
      this.type = type;
      if (type === "ground") { this.y = GROUND_Y - 60; this.w = 60; this.h = 60; }
      else { const heights = [75, 85, 95]; this.y = GROUND_Y - heights[Math.floor(Math.random() * heights.length)]; this.w = 50; this.h = 50; }
    }
    update(f: number) {
      this.x -= gameSpeed * f;
      if (this.type === "air") this.rotation += 0.2 * f;
      if (this.x < -this.w) this.dead = true;
    }
    draw() {
      if (this.type === "ground") {
        if (images.enemy) c.drawImage(images.enemy, this.x, this.y, this.w, this.h);
        else { c.fillStyle = "#7c3aed"; c.fillRect(this.x, this.y, this.w, this.h); }
      } else {
        c.save();
        c.translate(this.x + this.w / 2, this.y + this.h / 2);
        c.rotate(this.rotation);
        if (images.air) c.drawImage(images.air, -this.w / 2, -this.h / 2, this.w, this.h);
        else { c.fillStyle = "#607d8b"; c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h); }
        c.restore();
      }
    }
    hitbox(): Rect { return { x: this.x + 10, y: this.y + 10, w: this.w - 20, h: this.h - 20 }; }
  }

  class Coin {
    size = 24;
    x = GAME_WIDTH;
    y = Math.random() > 0.5 ? GROUND_Y - 50 : GROUND_Y - 150;
    angle = 0;
    dead = false;
    update(f: number) {
      this.x -= gameSpeed * f;
      this.angle -= 0.1 * f;
      if (this.x < -this.size) this.dead = true;
    }
    draw() {
      const r = this.size / 2;
      c.save();
      c.translate(this.x + r, this.y + r);
      c.rotate(this.angle);
      c.beginPath(); c.arc(0, 0, r, Math.PI, 0); c.fillStyle = "#ef4444"; c.fill();
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI); c.fillStyle = "#ffffff"; c.fill();
      c.fillStyle = "#111827"; c.fillRect(-r, -2, r * 2, 4);
      c.beginPath(); c.arc(0, 0, r / 3, 0, Math.PI * 2); c.fillStyle = "#ffffff"; c.fill(); c.strokeStyle = "#111827"; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.strokeStyle = "#111827"; c.lineWidth = 2; c.stroke();
      c.restore();
    }
    hitbox(): Rect { return { x: this.x, y: this.y, w: this.size, h: this.size }; }
  }

  const player = new Player();
  let obstacles: Obstacle[] = [];
  let coins: Coin[] = [];
  let bgX = 0;

  function drawBackground(f: number) {
    const img = images.bg;
    if (!img) {
      c.fillStyle = "#87CEEB"; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      c.fillStyle = "#7cc36b"; c.fillRect(0, GROUND_Y - 10, GAME_WIDTH, GAME_HEIGHT - GROUND_Y + 10);
      c.fillStyle = "#8b5a2b"; c.fillRect(0, GROUND_Y + 8, GAME_WIDTH, GAME_HEIGHT - GROUND_Y - 8);
      return;
    }
    const scale = GAME_HEIGHT / img.height;
    const sw = img.width * scale;
    if (!paused) bgX -= gameSpeed * 0.5 * f;
    if (bgX <= -sw) bgX += sw;
    // 타일 경계에 실선이 생기지 않도록 정수 좌표에 그린다
    const tile = Math.ceil(sw);
    for (let x = Math.floor(bgX); x < GAME_WIDTH; x += tile) c.drawImage(img, x, 0, tile, GAME_HEIGHT);
  }

  function drawBubble(x: number, y: number, text: string) {
    c.save();
    c.font = `bold 15px ${fontFamily}`;
    const tw = Math.min(300, c.measureText(text).width + 32);
    const bw = tw, bh = 44, r = 10;
    const bx = x - bw - 16, by = y + 24;
    c.beginPath();
    c.moveTo(bx + r, by);
    c.lineTo(bx + bw - r, by);
    c.arcTo(bx + bw, by, bx + bw, by + r, r);
    c.lineTo(bx + bw, by + bh - r);
    c.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
    c.lineTo(bx + r, by + bh);
    c.arcTo(bx, by + bh, bx, by + bh - r, r);
    c.lineTo(bx, by + r);
    c.arcTo(bx, by, bx + r, by, r);
    c.closePath();
    c.fillStyle = "#ffffff"; c.fill();
    c.lineWidth = 3; c.strokeStyle = "#12305f"; c.stroke();
    c.beginPath();
    c.moveTo(bx + bw, by + bh / 2 - 6);
    c.lineTo(bx + bw + 16, by + bh / 2 + 4);
    c.lineTo(bx + bw, by + bh / 2 + 10);
    c.closePath();
    c.fillStyle = "#ffffff"; c.fill(); c.stroke();
    c.fillStyle = "#12305f";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, bx + bw / 2, by + bh / 2, bw - 16);
    c.restore();
  }

  function drawBoss(dt: number) {
    bossT += dt;
    let bx = GAME_WIDTH - 300 + Math.sin(bossT / 600) * 12;
    let by = 50 + Math.sin(bossT / 450) * 10;
    if (cleared) { by -= clearAnim * 0.35; bx += clearAnim * 0.25; }
    if (images.boss) c.drawImage(images.boss, bx, by, 250, 250);
    else { c.fillStyle = "#7c3aed"; c.fillRect(bx + 40, by + 40, 170, 170); }
    drawBubble(bx, by, cleared ? "으악, 다음에 보자!" : "마지막 문제다! 각오해라, 루미!");
  }

  function pushHud() {
    hooks.setHud({ score: Math.floor(score), stage: Math.min(quizCount + 1, total), correct: correctCount });
  }

  function maybeOpenQuiz() {
    if (quizCount >= total) return;
    const elapsed = performance.now() - lastQuizTime;
    const due = quizCount === 0 ? elapsed > FIRST_QUIZ_DELAY : elapsed > QUIZ_INTERVAL;
    if (!due) return;
    paused = true;
    keys.down = false;
    hooks.setQuiz({ index: quizCount, question: questions[quizCount], isBoss: quizCount === total - 1, answered: null });
    hooks.setPhase("quiz");
  }

  function render(dt: number) {
    const f = dt / 16.67;
    c.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground(f);
    if (bossMode) drawBoss(dt);

    if (paused) {
      obstacles.forEach((o) => o.draw());
      coins.forEach((coin) => coin.draw());
      player.draw();
      c.fillStyle = "rgba(15, 31, 61, 0.55)";
      c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      return;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].size <= 0) { particles.splice(i, 1); continue; }
      particles[i].draw();
    }

    if (!cleared) {
      obstacleTimer += dt;
      if (obstacleTimer > nextObstacleGap) {
        obstacles.push(new Obstacle(Math.random() < 0.6 ? "ground" : "air"));
        obstacleTimer = 0;
        nextObstacleGap = 1000 + Math.random() * 1500;
      }
      coinTimer += dt;
      if (coinTimer > 600) { coins.push(new Coin()); coinTimer = 0; }
    }

    const pbox = player.hitbox();
    obstacles.forEach((o) => {
      o.update(f);
      o.draw();
      if (o.dead || !overlaps(pbox, o.hitbox())) return;
      if (o.type === "ground") {
        const ob = o.hitbox();
        if (player.vy > 0 && pbox.y + pbox.h < ob.y + ob.h * 0.8) {
          playSound("stomp");
          burst(o.x + o.w / 2, o.y + o.h / 2, 10, "#b45309");
          o.dead = true;
          player.vy = -10;
          score += SCORE.stomp;
          return;
        }
      }
      player.hit();
    });
    obstacles = obstacles.filter((o) => !o.dead);

    coins.forEach((coin) => {
      coin.update(f);
      coin.draw();
      if (!coin.dead && overlaps(pbox, coin.hitbox())) {
        score += SCORE.coin;
        coinsCollected += 1;
        coin.dead = true;
        playSound("coin");
        burst(coin.x + 12, coin.y + 12, 5, "#ffffff");
      }
    });
    coins = coins.filter((coin) => !coin.dead);

    player.update(dt);
    player.draw();

    if (!cleared) {
      score += SCORE.survivalPerFrame * f;
      gameSpeed = Math.min(MAX_SPEED, gameSpeed + 0.0008 * f);
    } else {
      clearAnim += dt;
      if (clearAnim % 120 < dt) burst(Math.random() * GAME_WIDTH, Math.random() * (GAME_HEIGHT / 2), 4, ["#2563eb", "#ffd166", "#ffffff", "#ff8a7a"][Math.floor(Math.random() * 4)]);
      if (clearAnim > 1700 && !finished) finish();
    }
  }

  function loop(ts: number) {
    if (!running || destroyed) return;
    const dt = Math.min(50, ts - lastTime);
    lastTime = ts;
    if (!paused && !cleared) maybeOpenQuiz();
    render(dt);
    if (!paused && running) raf = requestAnimationFrame(loop);
  }

  function finish() {
    finished = true;
    running = false;
    cancelAnimationFrame(raf);
    window.clearInterval(hudTimer);
    stopMusic();
    pushHud();
    hooks.onComplete({
      score: Math.floor(score),
      correct: correctCount,
      total,
      timeSec: Math.max(0, Math.round((performance.now() - startTime) / 1000)),
      coins: coinsCollected,
    });
  }

  function start() {
    if (running || destroyed || total === 0) return;
    ensureAudio();
    running = true; paused = false; cleared = false; finished = false; bossMode = false;
    gameSpeed = 4; score = 0; coinsCollected = 0; correctCount = 0; quizCount = 0;
    obstacles = []; coins = []; particles = []; obstacleTimer = 0; coinTimer = 0; bossT = 0; clearAnim = 0; keys.down = false;
    player.reset();
    startTime = performance.now();
    lastQuizTime = startTime;
    lastTime = startTime;
    hooks.setBossVisible(false);
    hooks.setQuiz(null);
    pushHud();
    hooks.setPhase("running");
    playMusic("forest");
    window.clearInterval(hudTimer);
    hudTimer = window.setInterval(pushHud, 250);
    raf = requestAnimationFrame(loop);
  }

  function answer(index: number) {
    if (!paused || cleared || quizCount >= total) return;
    const q = questions[quizCount];
    const correct = index === q.answer;
    if (correct) { score += SCORE.quizCorrect; correctCount += 1; playSound("correct"); }
    else playSound("hit");
    hooks.setQuiz((prev) => (prev && prev.answered === null ? { ...prev, answered: { chosen: index, correct } } : prev));
  }

  function resume() {
    if (!paused || !running) return;
    quizCount += 1;
    lastQuizTime = performance.now();
    paused = false;
    hooks.setQuiz(null);
    if (quizCount >= total) {
      cleared = true;
      stopMusic();
      playSound("clear");
      hooks.setBossVisible(false);
      hooks.setPhase("clear");
      hooks.pushFeedback("골인!", "good");
    } else {
      if (quizCount === total - 1) {
        bossMode = true;
        bossT = 0;
        hooks.setBossVisible(true);
        playMusic("boss");
      } else {
        playMusic("forest");
      }
      hooks.setPhase("running");
    }
    pushHud();
    lastTime = performance.now();
    raf = requestAnimationFrame(loop);
  }

  return {
    start,
    jump() { if (running && !paused && !cleared) player.jump(); },
    slideStart() { if (!running || paused) return; keys.down = true; player.slide(); },
    slideEnd() { keys.down = false; },
    answer,
    resume,
    setSound(on) {
      soundOn = on;
      if (!on) stopMusic();
      else if (running && !paused && !cleared) playMusic(musicTrack);
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearInterval(hudTimer);
      stopMusic();
      if (audio) void audio.close().catch(() => undefined);
    },
  };
}

/* ======================= React 컴포넌트 ======================= */

export function RunnerGame({ questions, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const onCompleteRef = useRef(onComplete);
  const feedbackId = useRef(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<QuizView | null>(null);
  const [hud, setHud] = useState<Hud>({ score: 0, stage: 1, correct: 0 });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [bossVisible, setBossVisible] = useState(false);
  const sound = useSyncExternalStore(subscribeSound, readSoundPref, () => false);
  const total = questions.length;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: Engine;
    try {
      engine = createEngine(canvas, questions, {
        setPhase,
        setQuiz,
        setHud,
        setBossVisible,
        pushFeedback: (text, kind) => setFeedback({ id: ++feedbackId.current, text, kind }),
        onComplete: (result) => onCompleteRef.current(result),
      });
    } catch {
      return;
    }
    engineRef.current = engine;
    engine.setSound(readSoundPref());
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [questions]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback((cur) => (cur?.id === feedback.id ? null : cur)), 900);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (event.code === "Space" || event.code === "ArrowUp") {
        if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return;
        event.preventDefault();
        engine.jump();
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        if (!event.repeat) engine.slideStart();
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") engineRef.current?.slideEnd();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setSound(sound);
  }, [sound]);

  const toggleSound = () => writeSoundPref(!sound);

  const controlBase =
    "flex h-16 items-center justify-center gap-2 rounded-2xl border-[3px] border-ink font-heading text-lg text-ink shadow-[4px_4px_0_0_var(--ink)] select-none touch-none transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:h-20";

  return (
    <div className="mx-auto w-full max-w-4xl select-none px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-candy-pink px-3.5 py-1 font-heading text-ink sticker-xs">
            단계 {hud.stage}/{total}
          </span>
          <span className="rounded-full bg-candy-blue px-3.5 py-1 font-heading text-ink sticker-xs tabular-nums">
            점수 {hud.score}
          </span>
          <span className="hidden rounded-full bg-candy-cream px-3 py-1 font-bold text-ink/70 tabular-nums sm:inline">
            정답 {hud.correct}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={toggleSound} aria-pressed={sound}>
          {sound ? <IconSound data-icon="inline-start" /> : <IconMute data-icon="inline-start" />}
          {sound ? "소리 켬" : "소리 꺼짐"}
        </Button>
      </div>

      <div
        className="relative aspect-video w-full touch-none overflow-hidden rounded-3xl bg-[#CDEAF8] sticker"
        onPointerDown={(event) => {
          if (phase !== "running") return;
          event.preventDefault();
          engineRef.current?.jump();
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="pixelated block h-full w-full" />

        {feedback && (
          <div
            key={feedback.id}
            className={cn(
              "pointer-events-none absolute top-[36%] left-1/2 -translate-x-1/2 rounded-full border-[3px] border-ink px-5 py-2 font-heading text-xl shadow-[4px_4px_0_0_var(--ink)] animate-in fade-in zoom-in-75",
              feedback.kind === "good" && "bg-candy-mint text-ink",
              feedback.kind === "bad" && "bg-destructive text-white",
              feedback.kind === "info" && "bg-candy-yellow text-ink",
            )}
          >
            {feedback.text}
          </div>
        )}

        {bossVisible && phase === "running" && (
          <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-candy-lilac px-4 py-1.5 font-heading text-sm whitespace-nowrap text-ink shadow-[3px_3px_0_0_var(--ink)] animate-in slide-in-from-top-2">
            <IconBoss className="size-5" /> 보스 등장! 마지막 문제를 맞혀요
          </div>
        )}

        {(phase === "loading" || phase === "ready") && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-ink/55 p-3">
            <div className="my-auto w-full max-w-md rounded-3xl bg-card p-4 text-center sticker candy-pop sm:p-6">
              <p className="font-heading text-sm text-primary-strong">미션 1</p>
              <h2 className="mt-0.5 font-heading text-2xl sm:text-3xl">루미와 함께 달려요</h2>
              <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
                점프로 장애물을 넘고, 슬라이드로 아래를 지나요. 퀴즈 {total}문제를 모두 풀면 골인!
              </p>
              <div className="mt-3 hidden flex-wrap justify-center gap-2 text-xs text-muted-foreground sm:flex">
                <span className="rounded-full bg-candy-cream px-2.5 py-1 font-medium">화면 터치 · Space = 점프 (두 번이면 2단 점프)</span>
                <span className="rounded-full bg-candy-cream px-2.5 py-1 font-medium">↓ = 슬라이드</span>
              </div>
              <Button size="lg" className="mt-3 w-full sm:mt-4 sm:h-14 sm:text-lg" onClick={() => engineRef.current?.start()} disabled={phase === "loading"}>
                <IconPlay data-icon="inline-start" />
                {phase === "loading" ? "불러오는 중…" : "출발!"}
              </Button>
            </div>
          </div>
        )}

        {phase === "quiz" && quiz && (
          <QuizOverlay
            quiz={quiz}
            total={total}
            onAnswer={(index) => engineRef.current?.answer(index)}
            onContinue={() => engineRef.current?.resume()}
          />
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          className={cn(controlBase, "bg-candy-blue")}
          onPointerDown={(event) => { event.preventDefault(); engineRef.current?.slideStart(); }}
          onPointerUp={() => engineRef.current?.slideEnd()}
          onPointerLeave={() => engineRef.current?.slideEnd()}
          onPointerCancel={() => engineRef.current?.slideEnd()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <IconArrowDown className="size-7" /> 슬라이드
          <kbd className="ml-1 rounded-md border-2 border-ink bg-card px-1.5 font-sans text-xs font-bold text-ink">↓</kbd>
        </button>
        <button
          type="button"
          className={cn(controlBase, "bg-candy-pink")}
          onPointerDown={(event) => { event.preventDefault(); engineRef.current?.jump(); }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <IconArrowUp className="size-7" /> 점프
          <kbd className="ml-1 rounded-md border-2 border-ink bg-card px-1.5 font-sans text-xs font-bold text-ink">Space</kbd>
        </button>
      </div>
    </div>
  );
}

function QuizOverlay({
  quiz,
  total,
  onAnswer,
  onContinue,
}: {
  quiz: QuizView;
  total: number;
  onAnswer: (index: number) => void;
  onContinue: () => void;
}) {
  const { question, index, isBoss, answered } = quiz;
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink/55 p-3 sm:p-6">
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-4 text-card-foreground sticker candy-pop sm:p-6">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-3.5 py-1 font-heading text-sm", isBoss ? "bg-candy-lilac text-ink sticker-xs" : "bg-candy-pink text-ink sticker-xs")}>
            {isBoss ? "보스 문제!" : `문제 ${index + 1}`}
          </span>
          <span className="text-sm text-muted-foreground">
            {index + 1} / {total}
          </span>
        </div>
        <p className="mt-3 font-heading text-xl leading-snug sm:text-2xl">{question.q}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.options.map((option, i) => {
            const state = !answered ? "idle" : i === question.answer ? "correct" : i === answered.chosen ? "wrong" : "muted";
            return (
              <button
                key={option}
                type="button"
                disabled={answered !== null}
                onClick={() => onAnswer(i)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border-[2.5px] border-ink px-3 py-3 text-left text-base font-semibold transition-all",
                  state === "idle" && "bg-card shadow-[3px_3px_0_0_var(--ink)] hover:bg-candy-cream active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                  state === "correct" && "border-ink bg-candy-mint text-ink",
                  state === "wrong" && "bg-destructive/15 text-destructive",
                  state === "muted" && "opacity-45",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-candy-blue font-heading text-sm text-ink">
                  {i + 1}
                </span>
                <span className="flex-1">{option}</span>
                {state === "correct" && <IconCheck className="size-5" />}
                {state === "wrong" && <IconX className="size-5" />}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in">
            <p className={cn("flex-1 text-sm sm:text-base", answered.correct ? "text-ink" : "text-muted-foreground")}>
              <span className="font-bold">
                {answered.correct ? `정답! +${SCORE.quizCorrect}점` : `아쉬워요! 정답은 ${question.answer + 1}번이에요.`}
              </span>
              {question.explain && <span className="block">{question.explain}</span>}
            </p>
            <Button size="lg" onClick={onContinue} autoFocus>
              {index + 1 >= total ? "골인하기" : "계속 달리기"}
              <IconArrow data-icon="inline-end" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
