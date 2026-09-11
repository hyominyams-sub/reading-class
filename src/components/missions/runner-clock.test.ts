import test from "node:test";
import assert from "node:assert/strict";
import { advanceRunnerClock, seconds, startRunnerClock } from "./runner-clock";

test("active clock excludes quiz and hidden time", () => {
  let clock = startRunnerClock(0);
  clock = advanceRunnerClock(clock, 4_000, true);
  clock = advanceRunnerClock(clock, 20_000, false); // quiz pause
  clock = advanceRunnerClock(clock, 31_000, true);
  assert.equal(seconds(clock.activeMs), 15);
  assert.equal(seconds(clock.totalMs), 31);
});

test("clock never moves backwards after a visibility timestamp regression", () => {
  let clock = startRunnerClock(10_000);
  clock = advanceRunnerClock(clock, 12_000, true);
  clock = advanceRunnerClock(clock, 11_000, true);
  assert.equal(clock.activeMs, 2_000);
  assert.equal(clock.totalMs, 2_000);
  clock = advanceRunnerClock(clock, 13_000, true);
  assert.equal(clock.activeMs, 3_000);
  assert.equal(clock.totalMs, 3_000);
});

test("active budget boundary is reached only by running time", () => {
  let clock = startRunnerClock(0);
  clock = advanceRunnerClock(clock, 119_000, true);
  clock = advanceRunnerClock(clock, 124_000, false); // hidden/quiz time
  assert.equal(clock.activeMs, 119_000);
  clock = advanceRunnerClock(clock, 125_000, true);
  assert.equal(clock.activeMs, 120_000);
});
