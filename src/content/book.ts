import type { AdventureScene, MissionId, RunnerQuestion, WritingConfig } from "@/lib/types";

export const CONTENT_SOURCE_NOTE =
  "2장 장대공원의 태현이와 연우의 갈등과 화해, 3장 범암마을의 1813년 대해일과 오늘날 태풍 비교, 4장 복사골의 고문서 관련 사실만 사용합니다.";

export const BOOK = {
  title: "함께 읽은 이야기",
  author: "저자 정보",
  protagonist: "이야기 속 주인공",
  synopsis: [
    "태현이와 연우가 장대공원에서 겪은 갈등과 화해를 살펴봐요.",
    "범암마을의 1813년 대해일과 오늘날 태풍을 떠올리고, 복사골의 고문서와 책 속 보물을 생각해 봐요.",
  ],
  characters: [
    { name: "뚱이", desc: "장면을 살피며 서로의 말을 생각해 보는 친구예요." },
    { name: "루미", desc: "책 속 인물과 사건을 떠올리며 함께 달리는 친구예요." },
    { name: "태현", desc: "2장 장대공원에서 연우와 갈등을 겪은 인물이에요." },
    { name: "연우", desc: "2장 장대공원에서 태현이와 갈등을 겪은 인물이에요." },
  ],
};

export const MISSIONS: Record<MissionId, { title: string; subtitle: string; description: string; minutes: string; icon: "run" | "chat" | "pen" }> = {
  1: { title: "뚱이와 마음을 잇는 말", subtitle: "마음 나누기", description: "친구의 마음을 헤아리는 말을 고르고, 우리 반 친구에게 응원을 전해요.", minutes: "2분", icon: "chat" },
  2: { title: "루미와 이야기 되짚기", subtitle: "이야기 퀴즈 러너", description: "루미와 달리며 2장부터 4장까지의 인물과 사건을 떠올려요.", minutes: "2분", icon: "run" },
  3: { title: "나의 보물", subtitle: "마음 글쓰기", description: "나에게 소중한 보물과 그 까닭을 짧게 써 봐요.", minutes: "3분", icon: "pen" },
};

export function missionTitle(id: MissionId, studentName?: string): string {
  const name = studentName?.trim();
  if (id !== 3 || !name || name === "게스트") return MISSIONS[id].title;
  const last = name.codePointAt(name.length - 1) ?? 0;
  const hasFinalConsonant = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${name}${hasFinalConsonant ? "이의" : "의"} 보물`;
}

export const RUNNER_QUIZ: RunnerQuestion[] = [
  { id: "jangdae-friends", scene: "jangdae-conflict", q: "장대공원에서 다툰 두 친구는 누구였나요?", options: ["태현이와 연우", "루미와 뚱이", "태현이와 루미"], answer: 0, explain: "2장 장대공원에서 태현이와 연우가 다투었어요." },
  { id: "beomam-event", scene: "beomam-story", q: "범암마을에는 어떤 일이 있었나요?", options: ["친구들이 화해했어요", "큰 해일이 일어났어요", "고문서를 읽었어요"], answer: 1, explain: "3장 범암마을에서는 큰 해일이 일어났어요." },
  { id: "boksagol-document", scene: "boksagol-question", q: "고문서가 등장하는 곳은 어디였나요?", options: ["장대공원", "범암마을", "복사골"], answer: 2, explain: "4장에서는 복사골에 등장하는 고문서를 살펴봐요." },
  { id: "suncheon-natural-heritage", q: "다음 중 유네스코 세계자연유산은 무엇인가요?", options: ["낙안읍성", "선암사", "순천만습지"], answer: 2, explain: "정답은 순천만습지예요." },
];

export const ADVENTURE: AdventureScene[] = [
  { id: "jangdae-conflict", title: "장대공원에서", scene: "jangdae-conflict", prompt: "장대공원에서 태현이와 연우가 다투었어요. 나라면 두 친구에게 어떤 말을 건넬까요?", text: ["태현이와 연우가 장대공원에서 다투었어요.", "두 친구의 이야기를 차례로 들어 보며 건넬 말을 골라 봐요."], choices: [
    { id: "listen-first", text: "무슨 일인지 한 명씩 이야기해 줄래?", correct: true, next: "friend-empathy", feedback: "한 명씩 이야기를 들으면 두 친구의 마음을 살펴볼 수 있어요." },
    { id: "apologize-first", text: "먼저 서로 미안하다고 하면 되잖아.", correct: false, feedback: "미안하다는 말에 앞서 무슨 일이 있었는지 들어 볼 수 있어요." },
    { id: "find-first", text: "누가 먼저 시작했는지부터 말해 봐.", correct: false, feedback: "잘잘못을 가리기보다 두 친구의 이야기를 먼저 들어 볼 수 있어요." },
  ] },
  { id: "friend-empathy", title: "상대방의 마음 헤아리기", scene: "friend-empathy", prompt: "상대의 마음을 헤아릴 수 있는 말은 무엇일까요?", text: ["친구가 덜덜 떨고 있어요."], choices: [
    { id: "tease", text: "키도 크면서 겁쟁이구나?", correct: false, feedback: "겁쟁이라고 놀리면 친구의 마음이 더 힘들어질 수 있어요. 친구를 다독이는 말을 골라 봐요." },
    { id: "dismiss", text: "그게 왜 떨릴 일이야?", correct: false, feedback: "나에게 괜찮은 일도 친구에게는 무서울 수 있어요. 친구의 마음을 헤아려 봐요." },
    { id: "comfort", text: "괜찮아? 내가 다독여줄게!", correct: true, next: "friend-encouragement", feedback: "친구의 마음을 살피고 다독여 주면 친구가 안심할 수 있어요." },
  ] },
  { id: "friend-encouragement", title: "친구에게 응원 전하기", scene: "friend-encouragement", text: ["주변에 있는 우리 반 친구 3명에게 오늘 하루를 응원하는 말을 해주고 1, 2, 3번 버튼을 모두 눌러주세요."], encouragement: { count: 3, reminder: "활동을 하지 않고 1, 2, 3번을 누르면 자신을 속이는 일이에요." } },
];

export const WRITING: WritingConfig = {
  title: "나의 보물",
  intro: "나에게 소중한 보물을 떠올리고, 왜 소중한지 써 보세요.",
  prompt: "나에게 소중한 보물은 무엇인가요? 왜 소중한지도 써 봐요.",
  placeholder: "내가 생각한 보물은 …\n나에게 소중한 까닭은 …",
  experienceHint: "비슷한 경험이나 소식을 듣고 떠올린 생각을 한 문장 넣어도 좋아요.",
  scenes: [
    { id: "treasure", label: "나의 보물", who: "나", scene: "treasure-reflection", situation: "나에게 소중한 보물은 무엇인가요?", hint: "왜 소중한지 한 가지 까닭을 써 보세요." },
  ],
  feelings: ["궁금해요", "놀라워요", "걱정돼요", "따뜻해요", "고마워요", "소중해요"],
  starters: ["내가 생각한 보물은", "나에게 소중한 까닭은", "이 보물을 떠올리면"],
  minChars: 30,
};
