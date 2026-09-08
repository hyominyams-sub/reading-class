#!/usr/bin/env bash
# 힉스필드(Higgsfield) CLI로 루미 스프라이트 시트를 생성하고 게임용 시트로 변환한다.
#   1) higgsfield auth login 이 되어 있어야 한다 (계정 토큰은 ~/.config/higgsfield/credentials.json)
#   2) scripts/ref/rumi-ref.png 에 마스코트 원본(PNG)이 있으면 레퍼런스로 함께 보낸다.
#   3) 결과: public/images/runner/rumi.png + rumi.json (게임이 바로 읽음)
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$PATH"

OUT=scripts/out
mkdir -p "$OUT"
MODEL="${MODEL:-gpt_image_2}"

command -v higgsfield >/dev/null || { echo "higgsfield CLI가 없어요. https://github.com/higgsfield-ai/cli 참고"; exit 1; }
higgsfield account status || { echo "힉스필드에 연결할 수 없어요 (네트워크 차단 또는 로그인 필요: higgsfield auth login)"; exit 1; }

REF_ARGS=()
if [ -f scripts/ref/rumi-ref.png ]; then
  REF_ARGS=(--image scripts/ref/rumi-ref.png)
  echo "레퍼런스 이미지 사용: scripts/ref/rumi-ref.png"
fi

PROMPT="$(cat scripts/prompts/rumi-sheet.md)"

run_generate() {
  higgsfield generate create "$MODEL" --prompt "$PROMPT" "${REF_ARGS[@]}" \
    --aspect_ratio 3:2 --resolution 2k --quality high "$@" --wait --wait-timeout 15m --json
}

echo "이미지 생성 중 ($MODEL)…"
if ! JOB="$(run_generate --background transparent 2>"$OUT/gen.err")"; then
  if grep -qi "unknown param" "$OUT/gen.err"; then
    echo "--background 미지원 → 배경 옵션 없이 재시도"
    JOB="$(run_generate)"
  else
    cat "$OUT/gen.err"; exit 1
  fi
fi
echo "$JOB" > "$OUT/rumi-job.json"

URL="$(python3 - "$OUT/rumi-job.json" <<'PY'
import json, re, sys
data = json.load(open(sys.argv[1]))
found = []
def walk(x):
    if isinstance(x, dict):
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
    elif isinstance(x, str) and re.match(r"^https?://", x) and re.search(r"\.(png|jpg|jpeg|webp)(\?|$)", x, re.I):
        found.append(x)
walk(data)
print(found[0] if found else "")
PY
)"
[ -n "$URL" ] || { echo "결과 URL을 찾지 못했어요. $OUT/rumi-job.json 확인"; exit 1; }

curl -L -o "$OUT/rumi-sheet-raw.png" "$URL"
python3 scripts/pack-sprites.py "$OUT/rumi-sheet-raw.png" \
  --rows run:6,jump:2,double:2,slide:2,hit:2 --cell 96 \
  --out public/images/runner/rumi.png --manifest public/images/runner/rumi.json
echo "완료. 게임을 새로고침하면 새 스프라이트가 적용돼요."
