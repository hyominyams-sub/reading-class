#!/usr/bin/env python3
"""
루미(흑두루미) 픽셀아트 스프라이트 시트를 코드로 생성한다.
Higgsfield로 만든 시트(scripts/gen-rumi-sprites.sh)가 준비되기 전까지 쓰는 대체 시트.

출력:
  public/images/runner/rumi.png   (96x96 셀, 행 = run/jump/double/slide/hit)
  public/images/runner/rumi.json  (게임이 읽는 매니페스트)
"""
from __future__ import annotations

import json
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PNG = os.path.join(ROOT, "public", "images", "runner", "rumi.png")
OUT_JSON = os.path.join(ROOT, "public", "images", "runner", "rumi.json")

CELL = 32   # 논리 픽셀
SCALE = 3   # 96px 셀

C = {
    "white": (255, 255, 255, 255),
    "black": (28, 28, 34, 255),
    "purple": (96, 78, 168, 255),
    "yellow": (244, 203, 74, 255),
    "beak": (246, 166, 46, 255),
    "cheek": (244, 138, 152, 255),
    "eye": (20, 20, 26, 255),
    "star": (255, 209, 102, 255),
    "dust": (190, 208, 240, 255),
    "stripe": (255, 224, 102, 255),
}


def blank() -> Image.Image:
    return Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))


def px(d: ImageDraw.ImageDraw, pts, color):
    for p in pts:
        if 0 <= p[0] < CELL and 0 <= p[1] < CELL:
            d.point(p, fill=color)


def rumi(
    d: ImageDraw.ImageDraw,
    *,
    body=(15, 17),
    body_r=(7, 5),
    head=(21, 6),
    wing="level",
    legs=(((13, 22), (13, 30)), ((17, 22), (17, 30))),
    feet=True,
    eyes="open",
    neck="up",
    tail=True,
    patch=True,
):
    bx, by = body
    rx, ry = body_r
    hx, hy = head

    if tail:
        d.polygon([(bx - rx - 2, by - 2), (bx - rx + 1, by - 4), (bx - rx + 1, by + 1)], fill=C["black"])

    for a, b in legs:
        d.line([a, b], fill=C["yellow"], width=1)
        if feet:
            d.line([b, (b[0] + 2, b[1])], fill=C["yellow"], width=1)

    d.ellipse([bx - rx, by - ry, bx + rx, by + ry], fill=C["black"])
    if patch:
        d.ellipse([bx + rx - 5, by - 3, bx + rx, by + 3], fill=C["white"])

    if wing == "level":
        d.ellipse([bx - 5, by - 3, bx + 3, by + 3], fill=C["purple"])
        d.line([(bx - 4, by + 1), (bx + 2, by + 1)], fill=C["stripe"], width=1)
    elif wing == "up":
        d.polygon([(bx - 6, by - 1), (bx - 2, by - 9), (bx + 3, by - 3), (bx + 2, by + 1)], fill=C["purple"])
        d.line([(bx - 4, by - 5), (bx + 1, by - 1)], fill=C["stripe"], width=1)
    elif wing == "down":
        d.polygon([(bx - 6, by + 1), (bx - 3, by + 8), (bx + 3, by + 3), (bx + 2, by - 1)], fill=C["purple"])
        d.line([(bx - 4, by + 5), (bx + 1, by + 1)], fill=C["stripe"], width=1)
    elif wing == "back":
        d.ellipse([bx - 7, by - 4, bx + 1, by + 1], fill=C["purple"])
        d.line([(bx - 6, by - 1), (bx - 1, by - 1)], fill=C["stripe"], width=1)

    if neck == "up":
        d.line([(bx + rx - 2, by - ry + 1), (hx - 1, hy + 4)], fill=C["white"], width=3)
    elif neck == "forward":
        d.line([(bx + rx - 1, by - ry + 1), (hx - 4, hy + 2)], fill=C["white"], width=3)

    d.ellipse([hx - 5, hy - 5, hx + 5, hy + 5], fill=C["white"])
    d.chord([hx - 5, hy - 5, hx + 5, hy + 5], 200, 340, fill=C["black"])   # 머리 위 검은 깃
    px(d, [(hx - 1, hy - 6), (hx - 2, hy - 7), (hx - 3, hy - 7)], C["black"])  # 뻗친 머리털

    if eyes == "open":
        px(d, [(hx + 2, hy - 1), (hx + 2, hy)], C["eye"])
    elif eyes == "happy":
        px(d, [(hx + 1, hy - 1), (hx + 2, hy - 2), (hx + 3, hy - 1)], C["eye"])
    else:  # x
        px(d, [(hx + 1, hy - 2), (hx + 3, hy), (hx + 1, hy), (hx + 3, hy - 2), (hx + 2, hy - 1)], C["eye"])

    px(d, [(hx + 1, hy + 2), (hx + 2, hy + 2)], C["cheek"])
    d.polygon([(hx + 5, hy - 1), (hx + 9, hy + 1), (hx + 5, hy + 3)], fill=C["beak"])


def frame_run(i: int) -> Image.Image:
    img = blank()
    d = ImageDraw.Draw(img)
    cycle = [(-3, 3, 0), (-1, 1, -1), (1, -1, -1), (3, -3, 0), (1, -1, -1), (-1, 1, -1)]
    left, right, bob = cycle[i]
    legs = (((13, 22 + bob), (13 + left, 30)), ((17, 22 + bob), (17 + right, 30)))
    rumi(d, body=(15, 17 + bob), head=(21, 6 + bob), legs=legs, wing="level")
    if i in (0, 3):
        px(d, [(6, 30), (4, 31), (7, 31)], C["dust"])
    return img


def frame_jump(i: int) -> Image.Image:
    img = blank()
    d = ImageDraw.Draw(img)
    if i == 0:
        rumi(d, body=(15, 16), head=(21, 5), wing="up", legs=(((13, 21), (10, 27)), ((17, 21), (14, 27))), feet=False)
    else:
        rumi(d, body=(15, 17), head=(21, 6), wing="level", legs=(((13, 22), (12, 28)), ((17, 22), (16, 28))), feet=False)
    return img


def frame_double(i: int) -> Image.Image:
    img = blank()
    d = ImageDraw.Draw(img)
    rumi(d, body=(15, 16), head=(21, 5), wing="up" if i == 0 else "down",
         legs=(((13, 21), (9, 26)), ((17, 21), (13, 26))), feet=False, eyes="happy")
    lines = [(3, 14), (4, 14), (5, 14), (2, 18), (3, 18), (4, 18)] if i == 0 else [(3, 12), (4, 12), (2, 16), (3, 16), (4, 16), (5, 16)]
    px(d, lines, C["dust"])
    star = [(26, 2), (27, 1), (28, 2), (27, 3)] if i == 0 else [(28, 12), (29, 11), (30, 12), (29, 13)]
    px(d, star, C["star"])
    return img


def frame_slide(i: int) -> Image.Image:
    img = blank()
    d = ImageDraw.Draw(img)
    rumi(d, body=(15, 26), body_r=(9, 4), head=(26, 22), wing="back", neck="forward",
         legs=(((8, 27), (3, 29)), ((9, 28), (4, 31))), feet=False)
    px(d, [(2, 30), (0, 31), (1, 29)] if i == 0 else [(1, 30), (3, 31), (0, 28)], C["dust"])
    return img


def frame_hit(i: int) -> Image.Image:
    img = blank()
    d = ImageDraw.Draw(img)
    rumi(d, body=(15, 24), body_r=(8, 5), head=(20, 13), wing="down",
         legs=(((12, 28), (16, 31)), ((15, 28), (20, 31))), feet=False, eyes="x")
    stars = [(11, 5), (24, 3), (18, 1)] if i == 0 else [(13, 3), (26, 5), (20, 2)]
    for sx, sy in stars:
        px(d, [(sx, sy), (sx - 1, sy), (sx + 1, sy), (sx, sy - 1), (sx, sy + 1)], C["star"])
    return img


ROWS = [
    ("run", [frame_run(i) for i in range(6)], 12),
    ("jump", [frame_jump(i) for i in range(2)], 6),
    ("double", [frame_double(i) for i in range(2)], 10),
    ("slide", [frame_slide(i) for i in range(2)], 8),
    ("hit", [frame_hit(i) for i in range(2)], 4),
]


def main(preview_path: str | None = None) -> None:
    cell = CELL * SCALE
    cols = max(len(frames) for _, frames, _ in ROWS)
    sheet = Image.new("RGBA", (cols * cell, len(ROWS) * cell), (0, 0, 0, 0))
    states = {}
    for r, (name, frames, fps) in enumerate(ROWS):
        for col, frame in enumerate(frames):
            sheet.paste(frame.resize((cell, cell), Image.NEAREST), (col * cell, r * cell))
        states[name] = {"sy": r * cell, "w": cell, "h": cell, "count": len(frames), "fps": fps}

    os.makedirs(os.path.dirname(OUT_PNG), exist_ok=True)
    sheet.save(OUT_PNG)
    manifest = {"image": "/images/runner/rumi.png", "scale": 0.9, "source": "fallback-script", "states": states}
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"sheet: {OUT_PNG} ({sheet.width}x{sheet.height})")
    print(f"manifest: {OUT_JSON}")

    if preview_path:
        bg = Image.new("RGBA", sheet.size, (135, 206, 235, 255))
        bg.alpha_composite(sheet)
        bg.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(preview_path)
        print(f"preview: {preview_path}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
