/**
 * 수업에서 사용할 그림책이 정해지면 이 파일의 BOOK과 활동 문항만 교체합니다.
 * 지금은 세 미션의 흐름을 미리 체험할 수 있는 짧은 예시 문항을 둡니다.
 */
import type { AdventureScene, MissionId, RunnerQuestion, WritingConfig } from "@/lib/types";

export const BOOK = {
  title: "오늘 만날 그림책",
  author: "수업 시간에 공개해요",
  protagonist: "이야기 속 주인공",
  synopsis: [
    "어떤 그림책을 만나게 될까요? 표지와 그림을 천천히 살펴보며 이야기를 상상해 봐요.",
    "책이 펼쳐지면 뚱이와 루미가 세 가지 미션으로 여러분을 안내할 거예요.",
  ],
  characters: [
    { name: "뚱이", desc: "이야기 속 선택을 함께 고민하는 짱뚱어 친구예요." },
    { name: "루미", desc: "책 속 질문을 만나며 함께 달리는 흑두루미 친구예요." },
  ],
};

export const MISSIONS: Record<
  MissionId,
  { title: string; subtitle: string; description: string; minutes: string; icon: "run" | "chat" | "pen" }
> = {
  1: {
    title: "뚱이라면 어떻게 할까?",
    subtitle: "생각 선택",
    description: "뚱이와 함께 그림책 속 장면을 보고, 나라면 어떤 선택을 할지 골라요.",
    minutes: "2분",
    icon: "chat",
  },
  2: {
    title: "루미와 함께 달려요",
    subtitle: "이야기 퀴즈 러너",
    description: "루미와 2분 동안 달리며 이야기 퀴즈를 풀어요. 모든 문제를 다 풀지 못해도 시간이 되면 골인!",
    minutes: "2분",
    icon: "run",
  },
  3: {
    title: "나의 마음 일기",
    subtitle: "마음 글쓰기",
    description: "마음에 남은 장면을 고르고, 그때 떠오른 감정과 생각을 짧은 일기로 남겨요.",
    minutes: "3분",
    icon: "pen",
  },
};

export function missionTitle(id: MissionId, studentName?: string): string {
  const name = studentName?.trim();
  return id === 3 && name && name !== "게스트" ? `${name}의 마음 일기` : MISSIONS[id].title;
}

/** 그림책 확정 전에도 러너의 흐름을 확인할 수 있는 예시 문항입니다. */
export const RUNNER_QUIZ: RunnerQuestion[] = [
  {
    q: "그림책의 첫 장면을 볼 때 가장 먼저 살펴보면 좋은 것은?",
    options: ["인물의 표정", "페이지 번호", "책의 두께", "글자 수"],
    answer: 0,
    explain: "인물의 표정에는 지금 어떤 마음인지 알 수 있는 단서가 담겨 있어요.",
  },
  {
    q: "주인공이 갑자기 멈춰 섰다면 무엇을 생각해 볼까요?",
    options: ["왜 멈췄는지", "책값이 얼마인지", "종이가 몇 장인지", "글씨체 이름"],
    answer: 0,
    explain: "행동의 까닭을 생각하면 이야기의 흐름을 더 잘 이해할 수 있어요.",
  },
  {
    q: "친구와 생각이 다를 때 가장 좋은 방법은?",
    options: ["끝까지 내 말만 하기", "친구의 까닭도 듣기", "바로 자리를 뜨기", "모른 척하기"],
    answer: 1,
    explain: "서로의 까닭을 들으면 같은 장면도 새롭게 볼 수 있어요.",
  },
  {
    q: "이야기의 마지막 장면에서 떠올리면 좋은 질문은?",
    options: ["나는 어떤 마음이 들었지?", "책상은 무슨 색이지?", "책은 얼마나 무겁지?", "페이지는 얼마나 크지?"],
    answer: 0,
    explain: "마지막에는 이야기와 내 마음이 어떻게 이어졌는지 돌아봐요.",
  },
];

/** 미션 1의 2분 흐름을 보여 주는 짧은 선택 예시입니다. */
export const ADVENTURE: AdventureScene[] = [
  {
    id: "look-closely",
    title: "첫 장면",
    scene: "book",
    text: [
      "그림책이 펼쳐졌어요. 주인공은 친구들 곁에서 조금 떨어진 채 고개를 숙이고 있어요.",
      "뚱이는 주인공의 마음이 궁금해졌어요. 뚱이라면 어떻게 할까요?",
    ],
    choices: [
      {
        text: "표정과 주변 모습을 천천히 살펴본다.",
        correct: true,
        next: "ask-kindly",
        feedback: "그림 속에는 마음을 알려 주는 단서가 숨어 있어요. 먼저 자세히 살펴봐요.",
      },
      {
        text: "첫 장면은 중요하지 않으니 바로 넘긴다.",
        correct: false,
        feedback: "첫 장면에는 인물과 사건을 이해할 단서가 많아요. 조금만 더 바라볼까요?",
      },
      {
        text: "이유를 생각하지 않고 이상하다고 말한다.",
        correct: false,
        feedback: "겉모습만 보고 정하면 주인공의 진짜 마음을 놓칠 수 있어요.",
      },
    ],
  },
  {
    id: "ask-kindly",
    title: "마음이 궁금한 장면",
    scene: "book",
    text: [
      "주인공은 괜찮다고 말하지만 표정은 아직 어두워 보여요.",
      "뚱이는 한 걸음 가까이 다가갔어요. 이번에는 어떻게 할까요?",
    ],
    choices: [
      {
        text: "무슨 일이 있었는지 다정하게 물어본다.",
        correct: true,
        next: "listen-together",
        feedback: "다정한 질문은 닫힌 마음을 여는 작은 문이 될 수 있어요.",
      },
      {
        text: "괜찮다고 했으니 더는 관심을 갖지 않는다.",
        correct: false,
        feedback: "말과 표정이 다를 때는 마음을 한 번 더 살펴볼 수 있어요.",
      },
      {
        text: "친구들에게 먼저 이야기한다.",
        correct: false,
        feedback: "주인공의 이야기는 주인공에게 직접 듣는 것이 가장 정확해요.",
      },
    ],
  },
  {
    id: "listen-together",
    title: "서로의 이야기를 듣는 장면",
    scene: "book",
    text: [
      "주인공이 천천히 자기 이야기를 들려주기 시작했어요. 뚱이가 생각한 것과는 조금 다른 까닭이 있었어요.",
      "뚱이라면 어떤 마음으로 이야기를 들을까요?",
    ],
    choices: [
      {
        text: "내 생각을 잠시 내려놓고 끝까지 들어 본다.",
        correct: true,
        next: "ending",
        feedback: "끝까지 듣는 동안 처음에는 보이지 않던 마음을 만날 수 있어요.",
      },
      {
        text: "내 생각이 맞다고 바로 끼어든다.",
        correct: false,
        feedback: "먼저 끝까지 들은 뒤 내 생각을 말하면 서로를 더 잘 이해할 수 있어요.",
      },
      {
        text: "다른 이야기를 하며 관심을 돌린다.",
        correct: false,
        feedback: "지금은 주인공이 용기 내어 말하는 중이에요. 잠시 귀를 기울여 볼까요?",
      },
    ],
  },
  {
    id: "ending",
    title: "뚱이의 선택",
    scene: "book",
    ending: true,
    text: [
      "뚱이는 눈에 보이는 모습만으로 마음을 정하지 않았어요. 자세히 보고, 다정하게 묻고, 끝까지 들었어요.",
      "이제 그림책을 만나면 뚱이처럼 인물의 마음을 천천히 따라가 봐요.",
    ],
  },
];

export const WRITING: WritingConfig = {
  title: "나의 마음 일기",
  intro: "마음에 오래 남은 장면 하나를 골라 내 마음을 써 보세요.",
  scenes: [
    {
      id: "opening",
      label: "처음 마음이 움직인 장면",
      who: "나",
      scene: "book",
      situation: "그림책의 첫 장면을 떠올려요. 가장 먼저 눈에 들어온 인물과 그때 든 마음을 생각해 봐요.",
      hint: "처음 본 순간의 느낌과 그렇게 느낀 까닭을 담아 보세요.",
    },
    {
      id: "turning-point",
      label: "마음이 달라진 장면",
      who: "나",
      scene: "book",
      situation: "인물의 말이나 행동을 보고 내 생각이 달라진 순간을 떠올려요.",
      hint: "처음 생각과 나중 생각이 어떻게 달라졌는지 써 보세요.",
    },
    {
      id: "ending",
      label: "마지막까지 남은 장면",
      who: "나",
      scene: "book",
      situation: "책을 덮은 뒤에도 기억에 남는 장면을 하나 골라요.",
      hint: "왜 그 장면이 오래 남았는지 내 경험과 이어 써 보세요.",
    },
  ],
  feelings: ["궁금해요", "기뻐요", "슬퍼요", "놀라워요", "따뜻해요", "걱정돼요", "속상해요", "용기가 나요", "고마워요", "뿌듯해요"],
  starters: ["오늘 나는", "그 장면에서", "내 마음은", "왜냐하면"],
  minChars: 30,
};
