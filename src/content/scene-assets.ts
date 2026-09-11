import type { SceneKey } from "@/lib/types";

/**
 * 장면별로 현재 사용할 수 있는 삽화가 있는지 나타냅니다.
 * 새 이야기 장면은 원문과 참고 이미지 확인 전까지 연결하지 않습니다.
 */
const READY_SCENES = new Set<SceneKey>([
  "classroom",
  "lunch",
  "umbrella",
  "art",
  "rumor",
  "rain",
  "ending",
  "diary-night",
  "book",
  "ddungi-choice",
  "runner",
]);

export function hasSceneIllustration(scene: SceneKey): boolean {
  return READY_SCENES.has(scene);
}
