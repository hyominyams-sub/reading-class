import type { SceneKey } from "@/lib/types";

/** 수업 자료로 제공된 세로형 삽화. */
export const LESSON_ILLUSTRATIONS: Partial<Record<SceneKey, { src: string; alt: string }>> = {
  "jangdae-conflict": { src: "/images/scenes/activity-1.png", alt: "장대공원에서 친구에게 사과하는 아이와 곁에서 다독이는 친구들" },
  "friend-empathy": { src: "/images/scenes/activity-2.png", alt: "장대공원에서 덜덜 떠는 친구를 다독이는 아이" },
  "friend-encouragement": { src: "/images/scenes/activity-3.png", alt: "교실에서 손을 모으고 서로 응원하는 친구들과 선생님" },
  "treasure-reflection": { src: "/images/scenes/my-treasure.png", alt: "돌다리 아래에서 보물 상자를 발견하고 기뻐하는 아이들" },
};

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
  return Boolean(LESSON_ILLUSTRATIONS[scene]) || READY_SCENES.has(scene);
}
