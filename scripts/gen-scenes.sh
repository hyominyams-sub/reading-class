#!/usr/bin/env bash
# 힉스필드 nano_banana_2 로 장면 삽화 10종을 생성한다.
#   - scripts/ref/cast-sheet.png 를 레퍼런스로 넘겨 인물 디자인을 고정한다.
#   - 결과: public/images/scenes/<key>.png (21:9, 1k)
# 사용: ./scripts/gen-scenes.sh [장면키…]   (인자 없으면 전체)
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$PATH"

OUT=scripts/out
DEST=public/images/scenes
REF=scripts/ref/cast-sheet.png
mkdir -p "$OUT" "$DEST"

SCENES=("$@")
if [ ${#SCENES[@]} -eq 0 ]; then
  SCENES=(classroom lunch umbrella art rumor rain ending diary-night book runner)
fi

COMPOSITION='COMPOSITION: a wide 21:9 banner illustration. Place every character and the main action inside the middle 60% of the frame — the left and right edges get cropped on small screens. Leave calm empty space at the edges. Full-bleed scene: characters are painted directly into the scene, NOT cut-out stickers, so do NOT draw white outlines or die-cut borders around the characters.'

for key in "${SCENES[@]}"; do
  [ -f "scripts/prompts/scenes/$key.md" ] || { echo "프롬프트 없음: $key"; continue; }
  PROMPT="$(cat "scripts/prompts/scenes/$key.md")

$COMPOSITION

$(cat scripts/prompts/_cast.md)
Match the character designs in the reference image exactly.

$(cat scripts/prompts/_style.md)"

  echo "▶ $key 생성 중…"
  if ! higgsfield generate create nano_banana_2 \
        --prompt "$PROMPT" --image "$REF" \
        --aspect_ratio 21:9 --resolution 1k \
        --wait --wait-timeout 8m --json > "$OUT/$key.json" 2>"$OUT/$key.err"; then
    echo "  ✗ 실패: $(tail -2 "$OUT/$key.err")"; continue
  fi

  URL="$(python3 - "$OUT/$key.json" <<'PY'
import json, re, sys
found = []
def walk(x):
    if isinstance(x, dict):
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
    elif isinstance(x, str) and re.match(r"^https?://", x) and re.search(r"\.(png|jpg|jpeg|webp)(\?|$)", x, re.I):
        found.append(x)
walk(json.load(open(sys.argv[1])))
print(found[0] if found else "")
PY
)"
  if [ -z "$URL" ]; then echo "  ✗ 결과 URL 없음 ($OUT/$key.json)"; continue; fi
  curl -sL -o "$DEST/$key.png" "$URL" && echo "  ✓ $DEST/$key.png"
done
