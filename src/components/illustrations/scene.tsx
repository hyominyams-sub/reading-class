import type { SceneKey } from "@/lib/types";

/**
 * 플랫 스타일 SVG 삽화. 외부 이미지 없이 장면을 그린다.
 * 팔레트는 앱 테마(Candyland 파스텔)와 맞추고, 그라디언트는 쓰지 않는다.
 * 이름(blue/navy 등)은 형태별 역할 표시로 유지하고 값만 캔디 색으로 바꾼다.
 */
const P = {
  sky: "#D6EEFA",
  skyDusk: "#F6CBDF",
  skyNight: "#4A3352",
  navy: "#3E2B3E",
  blue: "#7FC5E8",
  blueMid: "#A5DAF0",
  blueLight: "#CDEAF8",
  blueSoft: "#EFF9FE",
  white: "#FFFFFF",
  yellow: "#FFE06B",
  orange: "#FFB347",
  coral: "#FF9E8A",
  pink: "#F7A8C4",
  green: "#8BE0B0",
  grass: "#B6EED0",
  skin: "#FBDCC6",
  hair: "#4A3040",
  hairBrown: "#8A5A3B",
  wall: "#FFF6E6",
  floor: "#F2E2D2",
  wood: "#EBC894",
  woodDark: "#D4A870",
  board: "#5C4460",
  cloudDark: "#E0C6DC",
  gray: "#BBA8B9",
  lilac: "#C6B3F0",
  candyCream: "#FFF6E6",
};

type Face = "smile" | "sad" | "flat" | "laugh" | "open";
type Arm = "down" | "wave" | "out" | "up";

type KidProps = {
  x: number;
  y: number;
  shirt: string;
  hair?: string;
  hairStyle?: "short" | "bob" | "cap";
  arm?: Arm;
  face?: Face;
  flip?: boolean;
};

function Kid({ x, y, shirt, hair = P.hair, hairStyle = "short", arm = "down", face = "smile", flip = false }: KidProps) {
  const transform = flip ? `translate(${x} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={transform}>
      <rect x={-11} y={-24} width={9} height={22} rx={3} fill={P.navy} />
      <rect x={2} y={-24} width={9} height={22} rx={3} fill={P.navy} />
      <rect x={-13} y={-5} width={12} height={5} rx={2} fill={hair} />
      <rect x={1} y={-5} width={12} height={5} rx={2} fill={hair} />
      <rect x={-15} y={-56} width={30} height={34} rx={9} fill={shirt} />
      <rect x={-22} y={-54} width={8} height={24} rx={4} fill={shirt} />
      {arm === "down" && <rect x={14} y={-54} width={8} height={24} rx={4} fill={shirt} />}
      {arm === "wave" && <rect x={14} y={-78} width={8} height={28} rx={4} fill={shirt} transform="rotate(24 18 -52)" />}
      {arm === "out" && <rect x={14} y={-56} width={28} height={8} rx={4} fill={shirt} />}
      {arm === "up" && <rect x={14} y={-84} width={8} height={32} rx={4} fill={shirt} />}
      {arm === "wave" && <circle cx={26} cy={-78} r={5} fill={P.skin} />}
      {arm === "out" && <circle cx={44} cy={-52} r={5} fill={P.skin} />}
      {arm === "up" && <circle cx={18} cy={-86} r={5} fill={P.skin} />}
      <circle cx={0} cy={-72} r={17} fill={P.skin} />
      {hairStyle === "short" && <path d="M-17,-74 a17,17 0 0 1 34,0 v3 h-34 z" fill={hair} />}
      {hairStyle === "bob" && <path d="M-18,-72 a18,18 0 0 1 36,0 v9 h-6 v-7 h-24 v7 h-6 z" fill={hair} />}
      {hairStyle === "cap" && (
        <>
          <path d="M-17,-74 a17,17 0 0 1 34,0 v2 h-34 z" fill={P.blue} />
          <rect x={-23} y={-74} width={46} height={5} rx={2.5} fill={P.blue} />
        </>
      )}
      <circle cx={-6} cy={-70} r={2} fill={P.navy} />
      <circle cx={6} cy={-70} r={2} fill={P.navy} />
      {face === "smile" && <path d="M-5,-64 q5,4 10,0" stroke={P.navy} strokeWidth={2} fill="none" strokeLinecap="round" />}
      {face === "sad" && <path d="M-5,-61 q5,-4 10,0" stroke={P.navy} strokeWidth={2} fill="none" strokeLinecap="round" />}
      {face === "flat" && <path d="M-4,-63 h8" stroke={P.navy} strokeWidth={2} strokeLinecap="round" />}
      {face === "laugh" && <path d="M-6,-65 q6,8 12,0 z" fill={P.navy} />}
      {face === "open" && <ellipse cx={0} cy={-62} rx={3} ry={4} fill={P.navy} />}
      <circle cx={-10} cy={-65} r={2.5} fill={P.pink} opacity={0.8} />
      <circle cx={10} cy={-65} r={2.5} fill={P.pink} opacity={0.8} />
    </g>
  );
}

function Umbrella({ x, y, r = 50, color = P.blue, tilt = 0, handle = true }: { x: number; y: number; r?: number; color?: string; tilt?: number; handle?: boolean }) {
  const hl = Math.max(40, r * 1.1);
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <path d={`M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y} Z`} fill={color} />
      {[-2, -1, 0, 1].map((i) => (
        <path key={i} d={`M${x + (i * r) / 2},${y} a${r / 4},${r / 6} 0 0 0 ${r / 2},0`} fill={color} />
      ))}
      {[-0.62, -0.22, 0.22, 0.62].map((k) => (
        <line key={k} x1={x} y1={y - r + 3} x2={x + k * r} y2={y + 2} stroke={P.white} strokeOpacity={0.45} strokeWidth={2} />
      ))}
      <circle cx={x} cy={y - r} r={4} fill={P.navy} />
      {handle && (
        <>
          <line x1={x} y1={y} x2={x} y2={y + hl} stroke={P.navy} strokeWidth={4} strokeLinecap="round" />
          <path d={`M${x},${y + hl} a8,8 0 0 0 16,0`} stroke={P.navy} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function ClosedUmbrella({ x, y, color = P.blue }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x} y1={y - 70} x2={x + 6} y2={y} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <line x1={x + 1} y1={y - 60} x2={x + 5} y2={y - 8} stroke={P.blueLight} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x} cy={y - 74} r={4} fill={P.navy} />
    </g>
  );
}

function Cloud({ x, y, s = 1, color = P.white }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-40,14 a15,15 0 0 1 1,-27 a19,19 0 0 1 33,-10 a15,15 0 0 1 23,10 a14,14 0 0 1 -1,27 z" />
    </g>
  );
}

function Sun({ x, y, r = 26 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * (r + 8)}
            y1={y + Math.sin(a) * (r + 8)}
            x2={x + Math.cos(a) * (r + 18)}
            y2={y + Math.sin(a) * (r + 18)}
            stroke={P.yellow}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={x} cy={y} r={r} fill={P.yellow} />
    </g>
  );
}

function Rain({ count = 34, color = P.blueMid }: { count?: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.75}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 53 + 17) % 640;
        const y = ((i * 37) % 190) + 8;
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 18} />;
      })}
    </g>
  );
}

function Desk({ x, y, w = 120 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={14} rx={5} fill={P.wood} />
      <rect x={x - w / 2 + 10} y={y + 14} width={8} height={34} fill={P.woodDark} />
      <rect x={x + w / 2 - 18} y={y + 14} width={8} height={34} fill={P.woodDark} />
    </g>
  );
}

function Window({ x, y, w = 150, h = 110, night = false }: { x: number; y: number; w?: number; h?: number; night?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={night ? P.skyNight : P.sky} />
      {night ? (
        <>
          <circle cx={x + w - 40} cy={y + 34} r={16} fill={P.yellow} />
          <circle cx={x + w - 48} cy={y + 28} r={13} fill={P.skyNight} />
          {[
            [24, 22],
            [50, 60],
            [88, 30],
            [40, 88],
            [110, 78],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={x + sx} cy={y + sy} r={2.2} fill={P.white} />
          ))}
        </>
      ) : (
        <Cloud x={x + w / 2 + 8} y={y + h / 2} s={0.55} />
      )}
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={P.white} strokeWidth={8} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={P.white} strokeWidth={6} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={P.white} strokeWidth={6} />
    </g>
  );
}

function Bunting() {
  const colors = [P.blue, P.yellow, P.white, P.coral];
  return (
    <g>
      <path d="M0,28 Q320,70 640,28" stroke={P.navy} strokeWidth={3} fill="none" />
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const x = t * 640;
        const y = 28 + 42 * 4 * t * (1 - t);
        return <path key={i} d={`M${x - 12},${y} l12,26 l12,-26 z`} fill={colors[i % colors.length]} />;
      })}
    </g>
  );
}

function Heart({ x, y, s = 1, color = P.coral }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0,6 C-8,-2 -14,-10 -6,-14 C-2,-16 0,-12 0,-10 C0,-12 2,-16 6,-14 C14,-10 8,-2 0,6 z"
      fill={color}
    />
  );
}

function Star({ x, y, s = 1, color = P.yellow }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0,-10 L3,-3 L10,-3 L4,2 L6,9 L0,5 L-6,9 L-4,2 L-10,-3 L-3,-3 z"
      fill={color}
    />
  );
}

function Classroom() {
  return (
    <>
      <rect width={640} height={300} fill={P.wall} />
      <rect y={222} width={640} height={78} fill={P.floor} />
      <Window x={36} y={34} />
      <rect x={250} y={34} width={350} height={112} rx={8} fill={P.board} />
      <rect x={250} y={34} width={350} height={112} rx={8} fill="none" stroke={P.wood} strokeWidth={6} />
      <line x1={282} y1={68} x2={430} y2={68} stroke={P.white} strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
      <line x1={282} y1={92} x2={540} y2={92} stroke={P.white} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
      <line x1={282} y1={116} x2={470} y2={116} stroke={P.white} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
      <Desk x={140} y={226} />
      <Desk x={520} y={226} />
      <Kid x={300} y={272} shirt={P.yellow} arm="wave" />
      <Kid x={470} y={272} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} face="flat" flip />
      <ClosedUmbrella x={518} y={272} />
      <Heart x={352} y={176} s={0.9} />
    </>
  );
}

function Lunch() {
  return (
    <>
      <rect width={640} height={300} fill={P.wall} />
      <rect y={222} width={640} height={78} fill={P.floor} />
      <Window x={440} y={30} w={140} h={100} />
      <Kid x={170} y={236} shirt={P.coral} face="laugh" arm="up" />
      <ClosedUmbrella x={392} y={236} />
      <Kid x={330} y={236} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} face="sad" />
      <Kid x={490} y={236} shirt={P.yellow} arm="out" face="smile" flip />
      <rect x={80} y={216} width={480} height={18} rx={7} fill={P.wood} />
      <rect x={100} y={234} width={10} height={44} fill={P.woodDark} />
      <rect x={530} y={234} width={10} height={44} fill={P.woodDark} />
      {[150, 310, 470].map((tx) => (
        <g key={tx}>
          <rect x={tx - 34} y={200} width={68} height={16} rx={5} fill={P.blueSoft} stroke={P.blueLight} strokeWidth={2} />
          <circle cx={tx - 16} cy={206} r={6} fill={P.white} />
          <circle cx={tx + 2} cy={206} r={6} fill={P.green} />
          <circle cx={tx + 20} cy={206} r={6} fill={P.orange} />
        </g>
      ))}
    </>
  );
}

function UmbrellaStory() {
  return (
    <>
      <rect width={640} height={300} fill={P.sky} />
      <Sun x={560} y={60} />
      <Cloud x={120} y={70} />
      <Cloud x={340} y={48} s={0.7} />
      <rect y={230} width={640} height={70} fill={P.grass} />
      <ellipse cx={100} cy={240} rx={90} ry={16} fill={P.green} />
      <rect x={72} y={140} width={16} height={100} fill={P.woodDark} />
      <circle cx={80} cy={120} r={48} fill={P.green} />
      <circle cx={52} cy={140} r={30} fill={P.green} />
      <Umbrella x={300} y={140} r={64} />
      <Kid x={296} y={272} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} arm="up" />
      <Kid x={400} y={272} shirt={P.yellow} face="smile" />
      <Heart x={455} y={170} s={0.8} />
      <Heart x={480} y={196} s={0.55} />
    </>
  );
}

function ArtClass() {
  const pencils = [P.coral, P.yellow, P.blue, P.green, P.orange, P.blueMid];
  return (
    <>
      <rect width={640} height={300} fill={P.wall} />
      <rect y={222} width={640} height={78} fill={P.floor} />
      <rect x={60} y={40} width={110} height={80} rx={6} fill={P.white} stroke={P.blueLight} strokeWidth={3} />
      <circle cx={92} cy={70} r={12} fill={P.yellow} />
      <path d="M70,110 l22,-22 l18,14 l20,-24 l20,32 z" fill={P.green} />
      <rect x={470} y={40} width={110} height={80} rx={6} fill={P.white} stroke={P.blueLight} strokeWidth={3} />
      <Umbrella x={525} y={90} r={30} handle={false} />
      <line x1={525} y1={90} x2={525} y2={112} stroke={P.navy} strokeWidth={3} />
      <Kid x={250} y={236} shirt={P.yellow} arm="out" />
      <Kid x={420} y={236} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} face="open" flip />
      <rect x={120} y={214} width={420} height={18} rx={7} fill={P.wood} />
      <rect x={140} y={232} width={10} height={46} fill={P.woodDark} />
      <rect x={510} y={232} width={10} height={46} fill={P.woodDark} />
      <rect x={180} y={198} width={70} height={16} rx={3} fill={P.white} />
      <rect x={400} y={198} width={70} height={16} rx={3} fill={P.white} />
      {pencils.map((c, i) => (
        <rect key={c} x={290 + i * 12} y={186 + (i % 2) * 3} width={8} height={30} rx={2} fill={c} />
      ))}
    </>
  );
}

function Rumor() {
  return (
    <>
      <rect width={640} height={300} fill={P.wall} />
      <rect y={222} width={640} height={78} fill={P.floor} />
      <Window x={440} y={30} w={150} h={100} />
      <Kid x={180} y={272} shirt={P.coral} arm="out" face="open" />
      <Kid x={290} y={272} shirt={P.yellow} face="flat" flip />
      <g>
        <rect x={130} y={120} width={110} height={54} rx={16} fill={P.white} stroke={P.blueLight} strokeWidth={3} />
        <path d="M200,172 l10,18 l6,-18 z" fill={P.white} stroke={P.blueLight} strokeWidth={3} />
        <circle cx={160} cy={147} r={5} fill={P.gray} />
        <circle cx={185} cy={147} r={5} fill={P.gray} />
        <circle cx={210} cy={147} r={5} fill={P.gray} />
      </g>
      <Kid x={520} y={272} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} face="sad" />
      <ClosedUmbrella x={560} y={272} />
    </>
  );
}

function SportsDayRain() {
  return (
    <>
      <rect width={640} height={300} fill={P.skyDusk} />
      <Cloud x={110} y={64} s={1.1} color={P.cloudDark} />
      <Cloud x={520} y={54} s={0.9} color={P.cloudDark} />
      <Cloud x={330} y={40} s={0.6} color={P.cloudDark} />
      <Rain />
      <Bunting />
      <rect y={236} width={640} height={64} fill={P.grass} />
      <ellipse cx={150} cy={262} rx={60} ry={8} fill={P.blueLight} />
      <ellipse cx={520} cy={268} rx={70} ry={9} fill={P.blueLight} />
      <Umbrella x={330} y={120} r={118} />
      <Kid x={250} y={272} shirt={P.yellow} arm="wave" />
      <Kid x={330} y={272} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} arm="up" />
      <Kid x={410} y={272} shirt={P.coral} face="laugh" />
      <Kid x={130} y={272} shirt={P.green} hairStyle="cap" face="open" flip />
      <Kid x={540} y={272} shirt={P.blueMid} face="open" />
    </>
  );
}

function Ending() {
  return (
    <>
      <rect width={640} height={300} fill={P.sky} />
      <Sun x={90} y={62} r={30} />
      <Cloud x={420} y={58} s={0.9} />
      <Cloud x={590} y={90} s={0.6} />
      <rect y={236} width={640} height={64} fill={P.grass} />
      <Umbrella x={320} y={112} r={70} handle={false} />
      <Kid x={140} y={272} shirt={P.coral} arm="up" face="laugh" />
      <Kid x={230} y={272} shirt={P.yellow} arm="up" />
      <Kid x={320} y={272} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} arm="up" />
      <Kid x={410} y={272} shirt={P.green} hairStyle="cap" arm="up" />
      <Kid x={500} y={272} shirt={P.blueMid} arm="up" face="laugh" />
      <Heart x={200} y={150} s={0.8} />
      <Heart x={450} y={140} s={0.7} />
      <Star x={260} y={40} s={0.8} />
      <Star x={520} y={160} s={0.6} />
      <Star x={40} y={170} s={0.7} />
    </>
  );
}

function DiaryNight() {
  return (
    <>
      <rect width={640} height={300} fill="#E4ECFA" />
      <rect y={222} width={640} height={78} fill="#CFDBEE" />
      <Window x={360} y={30} w={200} h={120} night />
      <Umbrella x={110} y={150} r={52} tilt={-18} />
      <rect x={200} y={210} width={320} height={16} rx={6} fill={P.wood} />
      <rect x={216} y={226} width={10} height={50} fill={P.woodDark} />
      <rect x={494} y={226} width={10} height={50} fill={P.woodDark} />
      <Kid x={360} y={232} shirt={P.blue} hairStyle="bob" hair={P.hairBrown} arm="out" face="smile" />
      <g>
        <path d="M280,206 l70,-6 l0,-50 l-70,6 z" fill={P.white} />
        <path d="M350,200 l70,6 l0,-50 l-70,-6 z" fill={P.white} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={290} y1={166 + i * 11} x2={340} y2={162 + i * 11} stroke={P.blueLight} strokeWidth={2} />
        ))}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={360} y1={162 + i * 11} x2={410} y2={166 + i * 11} stroke={P.blueLight} strokeWidth={2} />
        ))}
      </g>
      <g>
        <rect x={456} y={190} width={8} height={22} fill={P.navy} />
        <path d="M436,192 l48,0 l-10,-30 l-28,0 z" fill={P.yellow} />
        <ellipse cx={460} cy={208} rx={40} ry={10} fill={P.yellow} opacity={0.35} />
      </g>
    </>
  );
}

function BookStack() {
  return (
    <>
      <rect width={640} height={300} fill={P.candyCream} />
      <ellipse cx={320} cy={264} rx={196} ry={15} fill={P.lilac} opacity={0.55} />
      <rect x={200} y={222} width={240} height={28} rx={8} fill={P.pink} />
      <rect x={214} y={194} width={220} height={28} rx={8} fill={P.blue} />
      <rect x={206} y={166} width={230} height={28} rx={8} fill={P.green} />
      <rect x={222} y={176} width={14} height={7} rx={3.5} fill={P.white} opacity={0.85} />
      <rect x={230} y={204} width={14} height={7} rx={3.5} fill={P.white} opacity={0.85} />
      <rect x={216} y={232} width={14} height={7} rx={3.5} fill={P.white} opacity={0.85} />
      <path d="M320,162 l-100,-14 l0,-88 l100,14 z" fill={P.white} />
      <path d="M320,162 l100,-14 l0,-88 l-100,14 z" fill={P.white} />
      {[0, 1, 2, 3].map((i) => (
        <line key={`l${i}`} x1={236} y1={86 + i * 16} x2={300} y2={94 + i * 16} stroke={P.gray} strokeWidth={3} strokeLinecap="round" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`r${i}`} x1={340} y1={94 + i * 16} x2={404} y2={86 + i * 16} stroke={P.gray} strokeWidth={3} strokeLinecap="round" />
      ))}
      {/* 책 위로 뿜어져 나오는 사탕들 */}
      <circle cx={150} cy={96} r={20} fill={P.pink} />
      <path d="M150,96 a20,20 0 0 1 20,-20 20,20 0 0 1 -20,20" fill={P.white} opacity={0.7} />
      <circle cx={498} cy={80} r={16} fill={P.lilac} />
      <path d="M498,80 a16,16 0 0 1 16,-16 16,16 0 0 1 -16,16" fill={P.white} opacity={0.7} />
      <Star x={468} y={140} s={0.6} />
      <Star x={176} y={158} s={0.5} />
      <Star x={392} y={44} s={0.45} />
      <Cloud x={80} y={210} s={0.65} />
      <Cloud x={566} y={200} s={0.75} />
    </>
  );
}

function RunnerScene() {
  return (
    <>
      <rect width={640} height={300} fill={P.sky} />
      <Sun x={560} y={56} r={24} />
      <Cloud x={120} y={60} s={0.9} />
      <Cloud x={360} y={46} s={0.6} />
      <path d="M0,220 Q120,150 240,210 Q360,140 480,200 Q560,170 640,210 L640,300 L0,300 z" fill={P.blueLight} />
      <rect y={240} width={640} height={60} fill={P.grass} />
      <rect y={236} width={640} height={8} fill={P.green} />
      {/* 루미 */}
      <g transform="translate(250 236)">
        <line x1={-4} y1={-38} x2={-12} y2={0} stroke={P.yellow} strokeWidth={5} strokeLinecap="round" />
        <line x1={6} y1={-38} x2={14} y2={0} stroke={P.yellow} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={0} cy={-52} rx={34} ry={24} fill={P.hair} />
        <ellipse cx={-6} cy={-54} rx={22} ry={14} fill="#5B4B9E" />
        <line x1={-22} y1={-50} x2={8} y2={-50} stroke={P.yellow} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={22} cy={-48} rx={12} ry={12} fill={P.white} />
        <line x1={26} y1={-66} x2={34} y2={-92} stroke={P.white} strokeWidth={12} strokeLinecap="round" />
        <circle cx={40} cy={-104} r={20} fill={P.white} />
        <path d="M20,-108 a20,20 0 0 1 40,0 v-2 h-40 z" fill={P.hair} />
        <path d="M30,-118 q6,-10 14,-4" stroke={P.hair} strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={48} cy={-104} r={2.6} fill={P.navy} />
        <circle cx={46} cy={-96} r={3.5} fill={P.pink} />
        <path d="M58,-106 l20,4 l-20,6 z" fill={P.orange} />
      </g>
      <Star x={420} y={150} s={0.9} />
      <Star x={470} y={110} s={0.6} />
      <rect x={520} y={206} width={36} height={30} rx={8} fill={P.navy} />
      <rect x={590} y={196} width={40} height={40} rx={10} fill={P.coral} />
    </>
  );
}

const SCENES: Record<SceneKey, { title: string; render: () => React.ReactNode }> = {
  classroom: { title: "전학 첫날 교실", render: Classroom },
  lunch: { title: "점심시간", render: Lunch },
  umbrella: { title: "파란 우산 이야기", render: UmbrellaStory },
  art: { title: "미술 시간", render: ArtClass },
  rumor: { title: "이상한 소문", render: Rumor },
  rain: { title: "비 오는 운동회", render: SportsDayRain },
  ending: { title: "우리 반 친구 하늘이", render: Ending },
  "diary-night": { title: "일기 쓰는 밤", render: DiaryNight },
  book: { title: "책", render: BookStack },
  runner: { title: "루미 달리기", render: RunnerScene },
};

export function SceneIllustration({ scene, className }: { scene: SceneKey; className?: string }) {
  const def = SCENES[scene];
  const Render = def.render;
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label={def.title} className={className ?? "h-auto w-full"} preserveAspectRatio="xMidYMid slice">
      <title>{def.title}</title>
      {/* paint-order: stroke → 모든 도형 뒤에 잉크 외곽선을 깔아 스티커 질감을 낸다 */}
      <g stroke={P.navy} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" paintOrder="stroke">
        <Render />
      </g>
    </svg>
  );
}
