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
  1: { title: "뚱이와 마음을 잇는 말", subtitle: "생각 선택", description: "두 친구의 마음을 생각하며 건넬 말을 골라요.", minutes: "2분", icon: "chat" },
  2: { title: "루미와 이야기 되짚기", subtitle: "이야기 퀴즈 러너", description: "루미와 달리며 2장부터 4장까지의 인물과 사건을 떠올려요.", minutes: "2분", icon: "run" },
  3: { title: "책 속 보물, 나의 보물", subtitle: "마음 글쓰기", description: "책 속에서 찾은 보물과 나에게 소중한 것을 짧게 써 봐요.", minutes: "3분", icon: "pen" },
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
  { id: "jangdae-reconciliation", scene: "jangdae-reconciliation", q: "다툰 두 친구는 나중에 어떻게 되었나요?", options: ["서로 만나지 않았어요", "화해했어요", "루미와 달렸어요"], answer: 1, explain: "태현이와 연우는 다툰 뒤 화해했어요." },
];

export const ADVENTURE: AdventureScene[] = [
  { id: "jangdae-conflict", title: "장대공원에서", scene: "jangdae-conflict", prompt: "장대공원에서 태현이와 연우가 다투었어요. 나라면 두 친구에게 어떤 말을 건넬까요?", text: ["태현이와 연우가 장대공원에서 다투었어요.", "두 친구의 이야기를 차례로 들어 보며 건넬 말을 골라 봐요."], choices: [
    { id: "listen-first", text: "무슨 일인지 한 명씩 이야기해 줄래?", correct: true, next: "jangdae-listening", feedback: "한 명씩 이야기를 들으면 두 친구의 마음을 살펴볼 수 있어요." },
    { id: "apologize-first", text: "먼저 서로 미안하다고 하면 되잖아.", correct: false, feedback: "미안하다는 말에 앞서 무슨 일이 있었는지 들어 볼 수 있어요." },
    { id: "find-first", text: "누가 먼저 시작했는지부터 말해 봐.", correct: false, feedback: "잘잘못을 가리기보다 두 친구의 이야기를 먼저 들어 볼 수 있어요." },
  ] },
  { id: "jangdae-listening", title: "서로의 말 듣기", scene: "jangdae-listening", prompt: "친구가 자기 생각을 이야기한다면, 어떻게 들어 주면 좋을까요?", text: ["친구가 자기 생각을 이야기하는 모습을 떠올려요.", "연우의 이야기도 차례로 들어 볼 수 있어요."], choices: [
    { id: "take-turns", text: "네 이야기 끝까지 들어 볼게.", correct: true, next: "jangdae-reconciliation", feedback: "끝까지 듣겠다고 말하면 친구가 마음 놓고 이야기할 수 있어요." },
    { id: "listen-together", text: "연우 이야기까지 듣고 같이 생각해 보자.", correct: true, next: "jangdae-reconciliation", feedback: "두 친구의 이야기를 함께 들으면 서로를 더 잘 살필 수 있어요." },
    { id: "assume", text: "나도 겪어 봐서 네 마음 다 알아.", correct: false, feedback: "비슷한 경험이 있어도 친구의 이야기를 먼저 들어 볼 수 있어요." },
  ] },
  { id: "jangdae-reconciliation", title: "화해를 떠올리며", scene: "jangdae-reconciliation", prompt: "친구와 생각이 다를 때, 나라면 어떤 말을 건넬까요?", text: ["태현이와 연우가 장대공원에서 화해했어요.", "상대의 마음을 존중하는 말을 골라 봐요."], choices: [
    { id: "respect", text: "다음에는 네 생각도 먼저 물어볼게.", correct: true, next: "jangdae-ending", feedback: "친구의 생각을 먼저 물으면 서로의 마음을 이해하는 데 도움이 돼요." },
    { id: "share-listen", text: "내 생각도 말하고 네 이야기도 들어 볼게.", correct: true, next: "jangdae-ending", feedback: "내 생각을 전하고 친구의 말도 들으며 함께 대화할 수 있어요." },
    { id: "decide-alone", text: "앞으로는 내가 하자는 대로 하면 되겠지?", correct: false, feedback: "한 사람의 생각만 따르기보다 서로의 생각을 나누어 봐요." },
  ] },
  { id: "jangdae-ending", title: "마음 잇기", scene: "jangdae-reconciliation", text: ["태현이와 연우가 화해한 장면을 떠올려 봐요.", "나도 친구의 이야기를 듣고 존중하는 말을 건넬 수 있어요."], ending: true },
];

export const WRITING: WritingConfig = {
  title: "책 속 보물, 나의 보물",
  intro: "책 속에서 찾은 보물과 나에게 소중한 까닭을 한 편의 글로 써 보세요.",
  prompt: "나에게 소중한 보물은 무엇인가요? 왜 소중한지도 써 봐요.",
  placeholder: "내가 생각한 보물은 …\n나에게 소중한 까닭은 …",
  experienceHint: "비슷한 경험이나 소식을 듣고 떠올린 생각을 한 문장 넣어도 좋아요.",
  scenes: [
    { id: "beomam", label: "범암마을의 사건", who: "나", scene: "beomam-story", situation: "3장 범암마을의 1813년 대해일과 오늘날 태풍을 떠올려요.", hint: "기억에 남은 까닭과 내 생각을 써 보세요." },
    { id: "document", label: "복사골의 고문서", who: "나", scene: "boksagol-question", situation: "4장 복사골의 고문서와 관련한 장면을 떠올려요.", hint: "그 장면에서 내가 찾은 보물을 생각해 보세요." },
    { id: "treasure", label: "나의 보물", who: "나", scene: "treasure-reflection", situation: "책 속 보물과 나에게 소중한 보물을 이어 생각해요.", hint: "왜 소중한지 한 가지 까닭을 써 보세요." },
  ],
  feelings: ["궁금해요", "놀라워요", "걱정돼요", "따뜻해요", "고마워요", "소중해요"],
  starters: ["내가 생각한 보물은", "나에게 소중한 까닭은", "그 장면을 떠올리면"],
  minChars: 30,
};
