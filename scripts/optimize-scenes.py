#!/usr/bin/env python3
"""장면 PNG를 팔레트(PNG8)로 양자화해 저장 용량을 줄인다.

평면 벡터 삽화라 색 수가 적어 256색으로도 눈에 띄는 손실이 없다.
사용: python3 scripts/optimize-scenes.py [파일…]  (인자 없으면 전체)
"""
import sys, glob, os
from PIL import Image

files = sys.argv[1:] or sorted(glob.glob("public/images/scenes/*.png"))
before = after = 0
for f in files:
    b = os.path.getsize(f)
    im = Image.open(f).convert("RGB")
    im.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.NONE).save(f, optimize=True)
    a = os.path.getsize(f)
    before += b; after += a
    print(f"  {os.path.basename(f):16} {b/1024:7.0f}KB → {a/1024:6.0f}KB  ({a/b:.0%})")
print(f"합계 {before/1024/1024:.1f}MB → {after/1024/1024:.1f}MB")
