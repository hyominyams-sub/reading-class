# reading-class

교실에서 QR을 찍고 세 가지 독서 미션을 푸는 초등 독서 수업용 웹 앱입니다.
태블릿 한 대에 한 명씩 이름을 입력하고, 진행 상황은 교실 현황판에 실시간으로 모입니다.

## 미션

| | 미션 | 활동 |
|---|---|---|
| 1 | 루미와 함께 달려요 | 픽셀 러너 게임 + 이야기 퀴즈 5문제 |
| 2 | 지우라면 어떻게 할까? | 갈림길마다 선택하는 텍스트 모험 |
| 3 | 하늘이의 마음 일기 | 인물의 마음이 되어 쓰는 짧은 일기 |

## 화면

- `/` 학생 홈 (이름 입력 → 미션 선택)
- `/board` 우리 반 현황판 (3초마다 자동 새로고침)
- `/qr` 교실에 붙일 QR 인쇄 시트
- `/teacher` 교사용 기록 관리

## 실행

```bash
npm install
npm run dev
```

태블릿에서 접속하려면 `/qr`에서 안내하는 **같은 와이파이의 네트워크 주소**(`http://10.x.x.x:3000`)를 사용하세요.
학생 기록은 `data/store.json`에 저장되며 git에는 올라가지 않습니다.

## 수업 내용 바꾸기

`src/content/book.ts` 파일 하나만 고치면 됩니다. 책 정보·줄거리, 미션 제목, 러너 퀴즈, 선택 모험 장면, 글쓰기 활동이 모두 이 파일에 있습니다.

## 디자인

Candyland(tweakcn) 팔레트를 바탕으로 한 "스티커북" 스타일입니다.

- 잉크 외곽선 + 오프셋 그림자 유틸리티: `src/app/globals.css`의 `.sticker*`
- 손그림 아이콘 세트: `src/components/candy-icons.tsx` (lucide 미사용)
- 제목 서체: Jua (`font-heading`)
- 장면 삽화: `src/components/illustrations/scene.tsx`

## 기술

Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui
