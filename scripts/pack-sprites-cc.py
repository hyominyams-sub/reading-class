#!/usr/bin/env python3
"""
이미지 모델이 만든 스프라이트 시트를 '연결요소' 기준으로 뜯어 게임용 균일 시트로 패킹한다.
빈 띠(band) 방식과 달리 행 간격이 들쭉날쭉하거나 프레임이 좌우로 흩어져 있어도 동작한다.

사용 예:
  python3 scripts/pack-sprites-cc.py scripts/ref/sheets/pixel-rumi.png \
      --rows run:6,jump:2,double:2,slide:2,hit:2 --cell 96 --drop 6 \
      --out out.png --manifest out.json

  --list            감지 결과만 출력하고 끝낸다 (--drop 인덱스를 고를 때 사용)
  --drop a,b,…      읽기 순서(위→아래, 좌→우) 전역 인덱스에서 뺄 프레임
"""
from __future__ import annotations

import argparse
import json
import sys

import numpy as np
from PIL import Image

DEFAULT_FPS = {"run": 12, "jump": 6, "double": 10, "slide": 8, "hit": 4}


def parse_rows(spec: str) -> list[tuple[str, int]]:
    out = []
    for part in spec.split(","):
        name, count = part.split(":")
        out.append((name.strip(), int(count)))
    return out


def content_mask(img: Image.Image, tol: int) -> tuple[np.ndarray, np.ndarray]:
    arr = np.array(img.convert("RGBA"))
    alpha = arr[..., 3]
    if alpha.min() < 250:
        return alpha > 16, arr
    rgb = arr[..., :3].astype(int)
    corners = np.array([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]])
    bg = np.median(corners, axis=0)
    mask = np.abs(rgb - bg).sum(axis=2) > tol
    if bg[0] > 140 and bg[2] > 140 and bg[1] < 110:
        # 마젠타 크로마키: 안티에일리어싱으로 남는 자주색 테두리까지 걷어낸다
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        mask &= ~((r > 120) & (b > 120) & (g < r - 50) & (g < b - 50))
    arr = arr.copy()
    arr[..., 3] = np.where(mask, 255, 0).astype(np.uint8)
    return mask, arr


def _dilate(mask: np.ndarray, r: int) -> np.ndarray:
    """4-이웃 팽창을 r번. scipy 없이 numpy 시프트만 쓴다."""
    out = mask
    for _ in range(r):
        nxt = out.copy()
        nxt[1:, :] |= out[:-1, :]
        nxt[:-1, :] |= out[1:, :]
        nxt[:, 1:] |= out[:, :-1]
        nxt[:, :-1] |= out[:, 1:]
        out = nxt
    return out


def _label(mask: np.ndarray) -> tuple[np.ndarray, int]:
    """스캔라인 union-find 로 8-이웃 연결요소 라벨링."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    parent = [0]

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[max(ra, rb)] = min(ra, rb)

    nxt = 1
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        prev = lab[y - 1] if y else None
        for x in np.flatnonzero(row):
            neigh = []
            if x and lab[y, x - 1]:
                neigh.append(lab[y, x - 1])
            if prev is not None:
                for dx in (-1, 0, 1):
                    xx = x + dx
                    if 0 <= xx < w and prev[xx]:
                        neigh.append(prev[xx])
            if neigh:
                m = min(neigh)
                lab[y, x] = m
                for n in neigh:
                    union(m, n)
            else:
                lab[y, x] = nxt
                parent.append(nxt)
                nxt += 1

    roots = np.array([find(i) for i in range(nxt)], np.int32)
    lab = roots[lab]
    return lab, nxt


def find_sprites(mask: np.ndarray, glue: int, min_area: int,
                 shrink: int = 4) -> list[tuple[int, int, int, int]]:
    """가까운 조각(먼지·별 등)을 붙이기 위해 축소·팽창한 뒤 연결요소를 찾는다."""
    h, w = mask.shape
    small = mask[: h // shrink * shrink, : w // shrink * shrink]
    small = small.reshape(h // shrink, shrink, w // shrink, shrink).any(axis=(1, 3))
    lab, _ = _label(_dilate(small, max(1, glue // shrink)))

    boxes = []
    for v in np.unique(lab):
        if v == 0:
            continue
        ys, xs = np.where(lab == v)
        y0, y1 = ys.min() * shrink, min(h, (ys.max() + 1) * shrink)
        x0, x1 = xs.min() * shrink, min(w, (xs.max() + 1) * shrink)
        sub = mask[y0:y1, x0:x1]
        if sub.sum() < min_area:
            continue
        yy, xx = np.where(sub)  # 팽창 전 실제 픽셀로 다시 조인다
        boxes.append((x0 + xx.min(), y0 + yy.min(), x0 + xx.max() + 1, y0 + yy.max() + 1))
    return boxes


def to_rows(boxes: list[tuple[int, int, int, int]]) -> list[list[tuple[int, int, int, int]]]:
    if not boxes:
        return []
    heights = sorted(b[3] - b[1] for b in boxes)
    tol = heights[len(heights) // 2] * 0.6
    rows: list[list] = []
    for b in sorted(boxes, key=lambda b: (b[1] + b[3]) / 2):
        cy = (b[1] + b[3]) / 2
        if rows and abs(cy - np.mean([(x[1] + x[3]) / 2 for x in rows[-1]])) <= tol:
            rows[-1].append(b)
        else:
            rows.append([b])
    return [sorted(r, key=lambda b: b[0]) for r in rows]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--rows", default="run:6,jump:2,double:2,slide:2,hit:2")
    ap.add_argument("--cell", type=int, default=96)
    ap.add_argument("--scale", type=float, default=0.9)
    ap.add_argument("--tol", type=int, default=60)
    ap.add_argument("--glue", type=int, default=25)
    ap.add_argument("--min-area", type=int, default=400)
    ap.add_argument("--drop", default="")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--manifest")
    a = ap.parse_args()

    img = Image.open(a.src)
    mask, arr = content_mask(img, a.tol)
    rows = to_rows(find_sprites(mask, a.glue, a.min_area))

    flat: list[tuple[int, int, int, int]] = []
    for ri, r in enumerate(rows):
        for b in r:
            flat.append(b)
    if a.list:
        i = 0
        for ri, r in enumerate(rows):
            print(f"row {ri}: {len(r)} frames")
            for b in r:
                print(f"  [{i:2d}] x={b[0]:5d} y={b[1]:5d} w={b[2]-b[0]:4d} h={b[3]-b[1]:4d}")
                i += 1
        return 0

    drop = {int(x) for x in a.drop.split(",") if x.strip()}
    frames = [b for i, b in enumerate(flat) if i not in drop]

    spec = parse_rows(a.rows)
    need = sum(c for _, c in spec)
    if len(frames) != need:
        print(f"[warn] 프레임 {need}개가 필요한데 {len(frames)}개가 남았어요. "
              f"--list 로 확인하고 --drop 을 조정하세요.", file=sys.stderr)
        if len(frames) < need:
            return 1
        frames = frames[:need]

    src = Image.fromarray(arr, "RGBA")
    crops = [src.crop(b) for b in frames]
    box = max(int(a.cell * a.scale), 1)
    ratio = min(box / max(c.width for c in crops), box / max(c.height for c in crops))

    cols = max(c for _, c in spec)
    sheet = Image.new("RGBA", (cols * a.cell, len(spec) * a.cell), (0, 0, 0, 0))
    states, k = {}, 0
    for ri, (name, count) in enumerate(spec):
        for ci in range(count):
            c = crops[k]; k += 1
            w, h = max(1, round(c.width * ratio)), max(1, round(c.height * ratio))
            r = c.resize((w, h), Image.NEAREST)
            sheet.alpha_composite(r, (ci * a.cell + (a.cell - w) // 2,
                                      ri * a.cell + a.cell - h))
        states[name] = {"sy": ri * a.cell, "w": a.cell, "h": a.cell,
                        "count": count, "fps": DEFAULT_FPS.get(name, 8)}

    sheet.save(a.out)
    json.dump({"image": "/" + a.out.split("public/", 1)[-1] if "public/" in a.out else a.out,
               "scale": 0.9, "source": "nano_banana_2", "states": states},
              open(a.manifest, "w"), ensure_ascii=False, indent=2)
    print(f"sheet: {a.out} ({sheet.width}x{sheet.height}), "
          f"frames: {', '.join(f'{n}={c}' for n, c in spec)}")
    print(f"manifest: {a.manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
