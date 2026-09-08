#!/usr/bin/env python3
"""
이미지 모델이 만든 스프라이트 시트(격자로 배치된 프레임들)를 게임용 균일 시트 + 매니페스트로 변환한다.

사용 예:
  python3 scripts/pack-sprites.py scripts/out/rumi-sheet-raw.png \
      --rows run:6,jump:2,double:2,slide:2,hit:2 --cell 96 \
      --out public/images/runner/rumi.png --manifest public/images/runner/rumi.json

- 투명 배경이면 알파를, 단색 배경이면 네 모서리 색을 배경으로 보고 크로마키 처리한다.
- 행/열은 빈 띠(배경만 있는 줄)를 기준으로 나눈다. 프레임 수가 기대와 다르면 경고만 내고 감지된 수를 쓴다.
- 모든 프레임은 같은 배율로 줄이고, 셀의 아래 가운데(발끝)에 맞춘다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

import numpy as np
from PIL import Image

DEFAULT_FPS = {"run": 12, "jump": 6, "double": 10, "slide": 8, "hit": 4}


def parse_rows(spec: str) -> list[tuple[str, int]]:
    rows = []
    for part in spec.split(","):
        name, count = part.split(":")
        rows.append((name.strip(), int(count)))
    return rows


def content_mask(img: Image.Image, tol: int) -> tuple[np.ndarray, np.ndarray]:
    arr = np.array(img.convert("RGBA"))
    alpha = arr[..., 3]
    if alpha.min() < 250:  # 진짜 투명 배경
        return alpha > 16, arr
    rgb = arr[..., :3].astype(int)
    corners = np.array([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]])
    bg = np.median(corners, axis=0)
    dist = np.abs(rgb - bg).sum(axis=2)
    mask = dist > tol
    arr = arr.copy()
    arr[..., 3] = np.where(mask, 255, 0).astype(np.uint8)
    return mask, arr


def bands(profile: np.ndarray, min_gap: int, min_size: int) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    inside = False
    start = 0
    for i, v in enumerate(profile):
        if v and not inside:
            inside, start = True, i
        elif not v and inside:
            inside = False
            out.append((start, i))
    if inside:
        out.append((start, len(profile)))
    merged: list[tuple[int, int]] = []
    for b in out:
        if merged and b[0] - merged[-1][1] <= min_gap:
            merged[-1] = (merged[-1][0], b[1])
        else:
            merged.append(b)
    return [b for b in merged if b[1] - b[0] >= min_size]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--rows", required=True, help="예: run:6,jump:2,double:2,slide:2,hit:2")
    ap.add_argument("--cell", type=int, default=96)
    ap.add_argument("--fill", type=float, default=0.94, help="셀 높이 대비 캐릭터 최대 높이 비율")
    ap.add_argument("--scale", type=float, default=0.9, help="게임 내 표시 배율(매니페스트)")
    ap.add_argument("--tol", type=int, default=60, help="크로마키 허용 오차")
    ap.add_argument("--out", required=True)
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--image-url", default=None, help="매니페스트에 적을 이미지 경로 (기본: /images/runner/<파일명>)")
    args = ap.parse_args()

    expected = parse_rows(args.rows)
    src = Image.open(args.source)
    mask, arr = content_mask(src, args.tol)
    h, w = mask.shape

    row_bands = bands(mask.any(axis=1), min_gap=max(6, h // 150), min_size=max(8, h // 60))
    if len(row_bands) != len(expected):
        print(f"[warn] 행 {len(expected)}개를 기대했지만 {len(row_bands)}개를 감지했어요.", file=sys.stderr)

    frames: list[tuple[str, list[np.ndarray]]] = []
    for r, (y0, y1) in enumerate(row_bands[: len(expected)]):
        name, count = expected[r]
        sub = mask[y0:y1]
        col_bands = bands(sub.any(axis=0), min_gap=max(8, w // 120), min_size=max(8, w // 80))
        if len(col_bands) != count:
            print(f"[warn] {name}: 프레임 {count}개를 기대했지만 {len(col_bands)}개를 감지했어요.", file=sys.stderr)
        crops = []
        for x0, x1 in col_bands:
            cell = arr[y0:y1, x0:x1]
            cm = mask[y0:y1, x0:x1]
            ys, xs = np.where(cm)
            cell = cell[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]
            crops.append(cell)
        frames.append((name, crops))

    all_h = max(c.shape[0] for _, cs in frames for c in cs)
    all_w = max(c.shape[1] for _, cs in frames for c in cs)
    scale = min(args.cell * args.fill / all_h, args.cell * 0.98 / all_w)

    cols = max(len(cs) for _, cs in frames)
    sheet = Image.new("RGBA", (cols * args.cell, len(frames) * args.cell), (0, 0, 0, 0))
    states = {}
    for r, (name, crops) in enumerate(frames):
        for ci, crop in enumerate(crops):
            im = Image.fromarray(crop, "RGBA")
            nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            resample = Image.NEAREST if abs(scale - round(scale)) < 1e-6 else Image.LANCZOS
            im = im.resize((nw, nh), resample)
            x = ci * args.cell + (args.cell - nw) // 2
            y = r * args.cell + (args.cell - nh)
            sheet.alpha_composite(im, (x, y))
        states[name] = {"sy": r * args.cell, "w": args.cell, "h": args.cell, "count": len(crops), "fps": DEFAULT_FPS.get(name, 8)}

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    sheet.save(args.out)
    image_url = args.image_url or f"/images/runner/{os.path.basename(args.out)}"
    manifest = {"image": image_url, "scale": args.scale, "source": os.path.basename(args.source), "states": states}
    with open(args.manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"sheet: {args.out} ({sheet.width}x{sheet.height}), frames: " + ", ".join(f"{n}={len(cs)}" for n, cs in frames))
    print(f"manifest: {args.manifest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
