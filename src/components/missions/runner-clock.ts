export type RunnerClockState = {
  startedAt: number;
  lastAt: number;
  totalMs: number;
  activeMs: number;
};

export function startRunnerClock(now: number): RunnerClockState {
  return { startedAt: now, lastAt: now, totalMs: 0, activeMs: 0 };
}

/** Advances both clocks. Hidden or paused time is intentionally excluded from activeMs. */
export function advanceRunnerClock(clock: RunnerClockState, now: number, active: boolean): RunnerClockState {
  const monotonicNow = Math.max(clock.lastAt, now);
  const delta = monotonicNow - clock.lastAt;
  return {
    ...clock,
    lastAt: monotonicNow,
    totalMs: Math.max(clock.totalMs, monotonicNow - clock.startedAt),
    activeMs: clock.activeMs + (active ? delta : 0),
  };
}

export function seconds(ms: number): number {
  return Math.max(0, Math.round(ms / 1000));
}
