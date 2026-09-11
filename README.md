# reading-class

교실에서 QR을 찍고 세 가지 독서 미션을 푸는 초등 독서 수업용 웹 앱입니다.
태블릿 한 대에 한 명씩 이름을 입력하고, 진행 상황은 교실 현황판에 실시간으로 모입니다.

학생 홈에는 미션으로 바로 들어가는 버튼이 없습니다. 홈의 **QR 코드 찍기**로 교실에 붙은
미션 QR을 찍어야 그 게임이 열립니다(미션 카드는 안내판 역할만 합니다). 선생님은 오른쪽 위
**QR 없이 들어가기**에 관리자 암호를 넣어 QR 없이 열 수 있고, QR 인쇄·교사용 화면도 그 안에
있습니다. 암호는 `src/lib/admin.ts`에서 바꿉니다 — 브라우저에서 검사하는 교실용 잠금이라
개인정보를 지키는 용도로는 쓰지 않습니다.

## 미션

| | 미션 | 활동 |
|---|---|---|
| 1 | 뚱이와 마음을 잇는 말 | 장대공원의 두 친구를 생각하며 고르는 2~3분 선택 모험 |
| 2 | 루미와 이야기 되짚기 | 2~3분 픽셀 러너 + 이야기 퀴즈 |
| 3 | 책 속 보물, 나의 보물 | 책 속 보물과 나의 보물을 쓰는 2~3분 글쓰기 |

## 화면

- `/` 학생 홈 (이름 입력 → QR 찍기)
- `/mission/1` · `/mission/2` · `/mission/3` 미션별 주소 — 교실에 붙이는 QR이 가리키는 곳
- `/board` 우리 반 현황판 (3초마다 자동 새로고침)
- `/qr` 교실에 붙일 QR 인쇄 시트
- `/teacher` 교사용 기록 관리

## 실행

```bash
npm install
npm run dev
```

태블릿에서 접속하려면 `/qr`에서 안내하는 **같은 와이파이의 네트워크 주소**(`http://10.x.x.x:3000`)를 사용하세요.
다만 앱 안의 QR 스캐너는 브라우저 규칙상 https(배포본)나 localhost에서만 카메라를 켤 수 있습니다. http 주소로
쓰는 교실에서는 태블릿 기본 카메라 앱으로 QR을 찍거나, 오른쪽 위 **QR 없이 들어가기**로 열어 주세요.
학생 기록은 `data/store.json`에 저장되며 git에는 올라가지 않습니다.

## 배포 (Vercel)

배포본은 파일을 쓸 수 없으므로 학생 기록이 **Google 시트**로 간다. 시트에 붙인 Apps Script
웹 앱(`scripts/sheets-api.gs`)이 작은 JSON API 역할을 하고, 앱 서버만 그 API를 부른다.
환경 변수가 없으면 등록 화면에 "데이터베이스가 아직 연결되지 않았어요"가 뜬다.

1. 시트에서 [확장 프로그램 > Apps Script]를 열고 `scripts/sheets-api.gs`를 붙여넣는다.
2. [프로젝트 설정(⚙️) > 스크립트 속성]에 `API_TOKEN`을 아무도 모르는 문자열로 넣는다.
   코드가 아니라 속성에 두므로 스크립트를 다시 붙여넣어도 지워지지 않는다(이 저장소는 공개다).
3. [배포 > 새 배포 > 웹 앱] — 실행 계정 **나**, 액세스 권한 **모든 사용자** — 배포하고 권한을 승인한다.
4. Vercel 환경 변수에 넣는다 (`.env.example` 참고).
   - `SHEETS_API_URL` — 3번에서 나온 `.../exec` 주소
   - `SHEETS_API_TOKEN` — 2번의 문자열
5. 다시 배포한다.

액세스를 '모든 사용자'로 두는 것은 로그인하지 않은 앱 서버가 불러야 하기 때문이고, 토큰이 맞지
않는 요청은 스크립트가 전부 거절한다. **시트 자체의 공유는 '제한됨'으로 잠가 둔다** — 학생 이름과
일기 원문이 쌓이는데 스크립트는 시트 주인 권한으로 돌기 때문에 잠가도 앱은 잘 돌아간다.

시트에는 사람이 읽는 칸(이름·점수·일기)과 앱이 읽는 `기록(JSON)` 칸이 함께 쌓인다. 이름은 손으로
고쳐도 앱이 그대로 따라간다.

`/board`가 3초마다 목록을 부르므로 서버가 읽기 응답을 5초간 재사용해 Apps Script 호출을 줄인다.
저장소는 `DATA_BACKEND`로 못 박을 수 있다(`local`·`sheets`). 비워 두면 시트 값이 모두
있을 때 시트, 아니면 파일로 동작하므로 교실용 `npm run dev`는 설정 없이 그대로 쓰면 된다.

## 수업 내용과 자산

세 게임의 제목·문항·장면·글쓰기 안내는 [`src/content/book.ts`](/Users/user/task/reading-class/src/content/book.ts)에 있습니다.
콘텐츠 호환 표식은 [`src/content/lesson-version.ts`](/Users/user/task/reading-class/src/content/lesson-version.ts), 결과 타입과 현재 버전 집계는
[`src/lib/types.ts`](/Users/user/task/reading-class/src/lib/types.ts), 장면 자산 연결 여부는
[`src/content/scene-assets.ts`](/Users/user/task/reading-class/src/content/scene-assets.ts)에서 관리합니다.

새 장면 래스터 이미지는 원문과 참고 자료를 확인하기 전까지 보류합니다. 이미지 제작이 승인되면
[`docs/game-image-prompts.md`](/Users/user/task/reading-class/docs/game-image-prompts.md)의 프롬프트와 `imagegen` 작업 흐름을 사용합니다.
현재 제공된 요약만으로는 실제 대사, 갈등 원인, 고문서 문구·세부 내용, 보물의 정체를 확정할 수 없습니다.

## 디자인

Candyland(tweakcn) 팔레트를 바탕으로 한 "스티커북" 스타일입니다.

- 잉크 외곽선 + 오프셋 그림자 유틸리티: `src/app/globals.css`의 `.sticker*`
- 손그림 아이콘 세트: `src/components/candy-icons.tsx` (lucide 미사용)
- 제목 서체: Jua (`font-heading`)
- 장면 삽화: `src/components/illustrations/scene.tsx`

## 기술

Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui
