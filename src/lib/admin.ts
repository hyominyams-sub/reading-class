/**
 * 교사용 뒷문 잠금.
 *
 * 학생은 교실에 붙은 QR을 찍어야 미션에 들어간다. 이 암호는 QR 없이 바로 들어가는
 * 길을 선생님만 쓰게 막는 정도의 장치라서 브라우저에서 검사한다 — 서버 비밀이 아니고,
 * 번들을 뜯어보면 보인다. 성적이나 개인정보를 지키는 용도로는 쓰지 않는다.
 */
export const ADMIN_CODE = "0800";

const KEY = "reading-class:admin";

/** 해제 상태는 탭을 닫으면 사라진다 — 태블릿을 다음 학생에게 넘겨도 다시 잠긴다. */
export function isAdminUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdminUnlocked(value: boolean): void {
  try {
    if (value) window.sessionStorage.setItem(KEY, "1");
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* sessionStorage를 쓸 수 없는 환경 */
  }
}
