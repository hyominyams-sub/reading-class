#!/usr/bin/env bash
# 루미·뚱이 캐릭터 시트 3종(기본 모델시트 / 게임용 픽셀 스프라이트 / 그림책 스타일)을 nano_banana_2 로 생성한다.
#   - scripts/ref/mascot-ref.png 를 레퍼런스로 넘겨 캐릭터 디자인을 고정한다.
#   - 결과: scripts/ref/sheets/<key>.png
# 사용: ./scripts/gen-char-sheets.sh [키…]  (인자 없으면 전체)
#   키: sheet-rumi sheet-ddungi pixel-rumi pixel-ddungi book-duo
#
# 픽셀 시트를 게임용 균일 격자(96px 셀 · run6/jump2/double2/slide2/hit2)로 패킹하려면
# 생성 뒤 scripts/pack-sprites-cc.py 를 돌린다. --drop 은 생성물마다 달라지므로
# 먼저 --list 로 프레임 번호를 확인하고 여분(중복 런 프레임·먼지·별 조각)을 빼준다.
#   python3 scripts/pack-sprites-cc.py scripts/ref/sheets/pixel-rumi.png --glue 8 --list
#   python3 scripts/pack-sprites-cc.py scripts/ref/sheets/pixel-rumi.png --glue 8 --drop 6,11,13 \
#       --out scripts/ref/sheets/pixel-rumi-packed.png --manifest scripts/ref/sheets/pixel-rumi-packed.json
#   python3 scripts/pack-sprites-cc.py scripts/ref/sheets/pixel-ddungi.png --glue 8 --drop 8,9,15 \
#       --out scripts/ref/sheets/pixel-ddungi-packed.png --manifest scripts/ref/sheets/pixel-ddungi-packed.json
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$PATH"

OUT=scripts/out
DEST=scripts/ref/sheets
REF=scripts/ref/mascot-ref.png
mkdir -p "$OUT" "$DEST"

KEYS=("$@")
if [ ${#KEYS[@]} -eq 0 ]; then
  KEYS=(sheet-rumi sheet-ddungi pixel-rumi pixel-ddungi book-duo)
fi

for key in "${KEYS[@]}"; do
  SRC="scripts/prompts/chars/$key.md"
  [ -f "$SRC" ] || { echo "프롬프트 없음: $key"; continue; }

  case "$key" in
    sheet-*) ASPECT=2:3; STYLE="$(cat scripts/prompts/_sticker-style.md)" ;;
    pixel-*) ASPECT=3:2; STYLE="" ;;
    *)       ASPECT=3:2; STYLE="" ;;
  esac

  PROMPT="$(cat "$SRC")

$(cat scripts/prompts/_mascots.md)
${STYLE:+
$STYLE}"

  echo "▶ $key 생성 중… (aspect $ASPECT)"
  if ! higgsfield generate create nano_banana_2 \
        --prompt "$PROMPT" --image "$REF" \
        --aspect_ratio "$ASPECT" --resolution 2k \
        --wait --wait-timeout 10m --json > "$OUT/$key.json" 2>"$OUT/$key.err"; then
    echo "  ✗ 실패: $(tail -3 "$OUT/$key.err")"; continue
  fi

  URL="$(python3 - "$OUT/$key.json" <<'PY'
import json, re, sys
results, any_url = [], []
def is_img(x):
    return isinstance(x, str) and re.match(r"^https?://", x) and re.search(r"\.(png|jpg|jpeg|webp)(\?|$)", x, re.I)
def walk(x):
    if isinstance(x, dict):
        for k, v in x.items():
            if k == "result_url" and is_img(v): results.append(v)
            walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
    elif is_img(x):
        any_url.append(x)
walk(json.load(open(sys.argv[1])))
print(results[0] if results else (any_url[0] if any_url else ""))
PY
)"
  if [ -z "$URL" ]; then echo "  ✗ 결과 URL 없음 ($OUT/$key.json)"; continue; fi
  curl -sL -o "$DEST/$key.png" "$URL" && echo "  ✓ $DEST/$key.png"
done
