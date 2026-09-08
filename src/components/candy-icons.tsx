import type { SVGProps } from "react";

/**
 * 손그림 느낌의 스티커 아이콘 세트.
 *
 * lucide 같은 균일한 선 아이콘 대신, 두꺼운 잉크 외곽선 + 캔디 색 면으로
 * 채워 UI 전체의 스티커 질감과 결을 맞춘다.
 * - 외곽선은 currentColor를 쓰므로 놓이는 자리의 글자색을 그대로 따라간다.
 * - 면 색은 캔디 팔레트 토큰을 직접 참조한다.
 */

type IconProps = SVGProps<SVGSVGElement>;

const PINK = "var(--candy-pink)";
const BLUE = "var(--candy-blue)";
const YELLOW = "var(--candy-yellow)";
const MINT = "var(--candy-mint)";
const LILAC = "var(--candy-lilac)";
const CREAM = "var(--candy-cream)";

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** 달리는 두루미 루미 */
export function IconCrane(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 9.5c2.6 0 4.6 1.7 5.4 4.1.7 2.2.1 4.6-1.7 6.2-1.6 1.4-3.6 1.9-5.8 1.9h-4.6" fill={CREAM} />
      <path d="M13.8 21.7 9.6 17c-1.4-1.6-1.2-3.8.3-5 1.4-1.2 3.4-1 4.7.4l2.3 2.6" fill={CREAM} />
      <path d="M18.6 11.6c1.9-.6 3.9.2 4.9 1.9" />
      <path d="m24.7 8.8 4.6-1.4-3.5 3.6" fill={YELLOW} />
      <path d="M22.6 8.3a2.6 2.6 0 1 1 3.4 2.5" fill="#fff" />
      <circle cx={24.2} cy={9.4} r={1.1} fill="currentColor" stroke="none" />
      <path d="M13 22.4 9.4 27M17.4 22.4 15.6 27" />
      <path d="m8 27 3 .6M14.2 27l3 .6" />
      <path d="M4 12.5h6M2 17h5" opacity={0.5} />
    </Svg>
  );
}

/** 뚱이의 선택 · 갈림길 이정표 */
export function IconSignpost(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.5 3.5v25" />
      <path d="M13.5 5h11l4 3.6-4 3.6h-11z" fill={PINK} />
      <path d="M13.5 15.5H4l-1.8 3.4L4 22.3h9.5z" fill={BLUE} />
      <path d="M17.5 8.6h5.5M6.5 18.9h4.5" opacity={0.65} />
      <path d="M8.5 28.5h10" />
      <path d="M22 25.5c2.8 0 4.5-1.4 4.5-3" opacity={0.45} />
    </Svg>
  );
}

/** 미션 3 · 마음 일기 (연필 + 하트) */
export function IconHeartPencil(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M23.4 4.6 27 8.2 13.2 22 8 23.6l1.6-5.2z" fill={YELLOW} />
      <path d="m21.2 6.8 3.6 3.6" />
      <path d="M9.6 18.4 13.2 22" />
      <path
        d="M7.6 8.9c1.1-1.2 3-1.2 4.1 0l.6.6.6-.6c1.1-1.2 3-1.2 4.1 0 1.1 1.1 1.1 3 0 4.1l-4.7 4.8-4.7-4.8c-1.1-1.1-1.1-3 0-4.1z"
        fill={PINK}
        transform="translate(-2 -2) scale(0.85)"
      />
      <path d="M6 27h16" opacity={0.5} />
    </Svg>
  );
}

/** 두툼한 체크 */
export function IconCheck(props: IconProps) {
  return (
    <Svg strokeWidth={3.6} {...props}>
      <path d="m6 17 6.5 6.5L26 9.5" />
    </Svg>
  );
}

/** 완료 훈장 (별사탕 메달) */
export function IconMedal(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m10 3 3.6 7M22 3l-3.6 7" />
      <circle cx={16} cy={19} r={9.5} fill={YELLOW} />
      <path d="m16 13.4 1.7 3.5 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6z" fill={CREAM} />
    </Svg>
  );
}

/** 펼친 책 */
export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 9.2C13.8 7 10.6 6.4 4.5 6.6v17c6.1-.2 9.3.4 11.5 2.6 2.2-2.2 5.4-2.8 11.5-2.6v-17c-6.1-.2-9.3.4-11.5 2.6z" fill="#fff" />
      <path d="M16 9.2v17" />
      <path d="M8.4 11.6h3.8M8.4 15.6h3.8M19.8 11.6h3.8M19.8 15.6h3.8" opacity={0.55} />
    </Svg>
  );
}

/** 현황판 (시상대) */
export function IconPodium(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 19h7v9h-7z" fill={BLUE} />
      <path d="M12.5 12h7v16h-7z" fill={PINK} />
      <path d="M21.5 22h7v6h-7z" fill={MINT} />
      <path d="M16 5.5 17.3 8l2.7.4-2 1.9.5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-1.9 2.7-.4z" fill={YELLOW} />
    </Svg>
  );
}

/** 두툼한 화살표 */
export function IconArrow(props: IconProps) {
  return (
    <Svg strokeWidth={2.8} {...props}>
      <path d="M5 16h21M18.5 8.5 26 16l-7.5 7.5" />
    </Svg>
  );
}

/** 별 */
export function IconStar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m16 4 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill={YELLOW} />
    </Svg>
  );
}

/** 막대사탕 (장식) */
export function IconLollipop(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={16} cy={12} r={9.5} fill={PINK} />
      <path d="M16 12a3.2 3.2 0 0 1 3.2-3.2A6.4 6.4 0 0 1 12.8 15 4.8 4.8 0 0 0 16 12" fill={CREAM} />
      <path d="M16 21.5V29" strokeWidth={2.8} />
    </Svg>
  );
}

/** 시계 */
export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={16} cy={17} r={11} fill={CREAM} />
      <path d="M16 11v6l4 2.5" />
      <path d="M11 4.5 8 7M21 4.5 24 7" />
    </Svg>
  );
}

/** 프린터 */
export function IconPrinter(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4.5h14v6H9z" fill={CREAM} />
      <path d="M6 10.5h20a2 2 0 0 1 2 2v7h-5v-3H9v3H4v-7a2 2 0 0 1 2-2z" fill={BLUE} />
      <path d="M9 16.5h14V28H9z" fill="#fff" />
      <path d="M12.5 20.5h7M12.5 24h4.5" opacity={0.6} />
    </Svg>
  );
}

/** 힌트 전구 */
export function IconBulb(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 4.5a8 8 0 0 1 4.8 14.4c-.8.6-1.3 1.5-1.3 2.5v1h-7v-1c0-1-.5-1.9-1.3-2.5A8 8 0 0 1 16 4.5z" fill={YELLOW} />
      <path d="M12.5 25.5h7M14 28.5h4" />
    </Svg>
  );
}

/** 다시 하기 */
export function IconRedo(props: IconProps) {
  return (
    <Svg strokeWidth={2.6} {...props}>
      <path d="M26.5 16a10.5 10.5 0 1 1-3.4-7.7" />
      <path d="M27 5v6h-6" />
    </Svg>
  );
}

/** 반짝임 */
export function IconSparkle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 4c0 5 2 7 7 7-5 0-7 2-7 7 0-5-2-7-7-7 5 0 7-2 7-7z" fill={LILAC} />
      <path d="M23.5 17c0 3 1.2 4.2 4.2 4.2-3 0-4.2 1.2-4.2 4.2 0-3-1.2-4.2-4.2-4.2 3 0 4.2-1.2 4.2-4.2z" fill={YELLOW} />
    </Svg>
  );
}

/** 재생 (출발!) */
export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 6.5 26 16 10 25.5z" fill={MINT} />
    </Svg>
  );
}

/** 오답 X */
export function IconX(props: IconProps) {
  return (
    <Svg strokeWidth={3.6} {...props}>
      <path d="M8 8l16 16M24 8 8 24" />
    </Svg>
  );
}

/** 소리 켬 */
export function IconSound(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 12.5h4.5L17 7v18l-6.5-5.5H6z" fill={BLUE} />
      <path d="M21 12.5a5 5 0 0 1 0 7M24.5 9.5a9 9 0 0 1 0 13" />
    </Svg>
  );
}

/** 소리 꺼짐 */
export function IconMute(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 12.5h4.5L17 7v18l-6.5-5.5H6z" fill={CREAM} />
      <path d="M21.5 12.5 28 19M28 12.5l-6.5 6.5" />
    </Svg>
  );
}

/** 보스 등장 (사탕 괴물) */
export function IconBoss(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 17a10 10 0 0 1 20 0v6.5c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8z" fill={LILAC} />
      <path d="M8 25.3v3.2M16 25.3v3.2M24 25.3v3.2" />
      <circle cx={12} cy={16} r={2.2} fill="#fff" />
      <circle cx={20} cy={16} r={2.2} fill="#fff" />
      <path d="m9 5 2.5 3.4M23 5l-2.5 3.4" />
      <path d="M12.5 21h7" />
    </Svg>
  );
}

/** 화살표(위/아래)는 IconArrow 회전 대신 별도 형태로 */
export function IconArrowUp(props: IconProps) {
  return (
    <Svg strokeWidth={2.8} {...props}>
      <path d="M16 27V6M8.5 13.5 16 6l7.5 7.5" />
    </Svg>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <Svg strokeWidth={2.8} {...props}>
      <path d="M16 5v21M8.5 18.5 16 26l7.5-7.5" />
    </Svg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <Svg strokeWidth={2.8} {...props}>
      <path d="M27 16H6M13.5 8.5 6 16l7.5 7.5" />
    </Svg>
  );
}

/** 날씨 — 글쓰기 활동의 그날 날씨 */
export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={16} cy={16} r={7} fill={YELLOW} />
      <path d="M16 3v3.5M16 25.5V29M3 16h3.5M25.5 16H29M6.8 6.8l2.5 2.5M22.7 22.7l2.5 2.5M25.2 6.8l-2.5 2.5M9.3 22.7l-2.5 2.5" />
    </Svg>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 23a5.5 5.5 0 0 1 .4-11 7.5 7.5 0 0 1 14.2 2A4.5 4.5 0 0 1 23 23z" fill={CREAM} />
    </Svg>
  );
}

export function IconCloudRain(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 19.5a5.5 5.5 0 0 1 .4-11 7.5 7.5 0 0 1 14.2 2 4.5 4.5 0 0 1-.6 9z" fill={BLUE} />
      <path d="M11.5 23.5 10 27.5M17 23.5l-1.5 4M22.5 23.5 21 27.5" />
    </Svg>
  );
}

/** 보내기 (제출) */
export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M28 4 4 13.5l10 3.8L17.8 28z" fill={PINK} />
      <path d="m14 17.3 14-13.3" />
    </Svg>
  );
}

/** 우리 반 (사람들) */
export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={12} cy={11} r={5} fill={PINK} />
      <path d="M3.5 27c0-4.7 3.8-8 8.5-8s8.5 3.3 8.5 8z" fill={PINK} />
      <circle cx={23} cy={12.5} r={4} fill={BLUE} />
      <path d="M22 19.2c3.9.4 6.5 3.5 6.5 7.8h-5" fill={BLUE} />
    </Svg>
  );
}

/** 보기 */
export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 16S7.5 8 16 8s13.5 8 13.5 8-5 8-13.5 8S2.5 16 2.5 16z" fill={CREAM} />
      <circle cx={16} cy={16} r={4} fill={BLUE} />
    </Svg>
  );
}

/** 삭제 */
export function IconTrash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5.5 8.5h21" />
      <path d="M12 8.5V5.5h8v3" />
      <path d="M8 8.5h16l-1.4 18a2 2 0 0 1-2 1.9H11.4a2 2 0 0 1-2-1.9z" fill={CREAM} />
      <path d="M13.5 14v8M18.5 14v8" />
    </Svg>
  );
}

/** 새로고침 */
export function IconRefresh(props: IconProps) {
  return (
    <Svg strokeWidth={2.6} {...props}>
      <path d="M27 16A11 11 0 1 1 23.5 8" />
      <path d="M28 4.5v6h-6" />
    </Svg>
  );
}

/** QR 코드 찍기 */
export function IconQr(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 11V6a3 3 0 0 1 3-3h5" />
      <path d="M21 3h5a3 3 0 0 1 3 3v5" />
      <path d="M29 21v5a3 3 0 0 1-3 3h-5" />
      <path d="M11 29H6a3 3 0 0 1-3-3v-5" />
      <rect x={7.5} y={7.5} width={7} height={7} rx={1.6} fill={PINK} />
      <rect x={17.5} y={7.5} width={7} height={7} rx={1.6} fill={BLUE} />
      <rect x={7.5} y={17.5} width={7} height={7} rx={1.6} fill={YELLOW} />
      <path d="M17.5 17.5h3v3M24.5 17.8v3.2M17.8 24.5h6.7" />
    </Svg>
  );
}

/** 선생님 잠금 (관리자 암호) */
export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.5 14.5v-4a5.5 5.5 0 0 1 11 0v4" />
      <rect x={5.5} y={14.5} width={21} height={13.5} rx={3.5} fill={YELLOW} />
      <circle cx={16} cy={20} r={2.1} fill="currentColor" stroke="none" />
      <path d="M16 22.2v2.4" />
    </Svg>
  );
}

/** 미션 아이콘 키 → 컴포넌트 */
export const MISSION_ICONS = {
  run: IconCrane,
  chat: IconSignpost,
  pen: IconHeartPencil,
} as const;
