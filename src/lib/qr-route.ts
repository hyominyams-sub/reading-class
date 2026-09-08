import type { MissionId } from "./types";

export type ScannedRoute = { path: string; missionId: MissionId | null };

/**
 * QR에 담긴 글자 → 우리 앱 안의 경로. 우리 QR이 아니면 null.
 *
 * 주소에서 경로만 떼어 쓴다. 그래서 선생님이 배포 주소로 만들어 붙인 QR을,
 * 교실 와이파이 주소로 열어 둔 태블릿에서 찍어도(또는 그 반대여도) 같은 미션이 열린다.
 * 밖으로 나가는 주소로는 절대 보내지 않는다 — 아는 경로만 통과시킨다.
 */
export function resolveScannedRoute(text: string, origin: string): ScannedRoute | null {
  let pathname: string;
  try {
    pathname = new URL(text.trim(), origin).pathname;
  } catch {
    return null;
  }
  const mission = /^\/mission\/([123])\/?$/.exec(pathname);
  if (mission) return { path: `/mission/${mission[1]}`, missionId: Number(mission[1]) as MissionId };
  if (/^\/board\/?$/.test(pathname)) return { path: "/board", missionId: null };
  return null;
}
