#!/usr/bin/env python3
"""Generate InsurOS PWA/TWA icons from the vector mark (public/icons/insuros-mark.svg).

The mark is pure geometry (no fonts), so this script redraws the exact same
shapes with Pillow:  python3 scripts/generate-icons.py
Outputs (apps/admin/public/icons): icon-192.png, icon-512.png, maskable-512.png,
apple-touch-icon.png (180), and the SVG itself.
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "apps" / "admin" / "public" / "icons"
INK = (27, 42, 65, 255)       # #1b2a41
SEAL = (15, 110, 86, 255)     # #0f6e56
PAPER = (246, 243, 236, 255)  # #f6f3ec
GOLD = (201, 162, 39, 255)    # #c9a227

# Shield in a 512 box, centred on (256, 256).
def bezier(p0, p1, p2, p3, n=48):
    pts = []
    for i in range(n + 1):
        t = i / n
        a = (1 - t) ** 3; b = 3 * (1 - t) ** 2 * t; c = 3 * (1 - t) * t ** 2; d = t ** 3
        pts.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return pts

def shield(scale=1.0):
    raw = [(256, 112), (364, 152), (364, 256)]
    raw += bezier((364, 256), (364, 326), (318, 374), (256, 404))[1:]
    raw += bezier((256, 404), (194, 374), (148, 326), (148, 256))[1:]
    raw += [(148, 152)]
    return [(256 + (x - 256) * scale, 258 + (y - 258) * scale) for x, y in raw]

BARS = [  # (x0, y0, x1, y1, colour) — ledger lines inside the shield
    (200, 206, 312, 228, PAPER),
    (200, 250, 312, 272, PAPER),
    (214, 300, 298, 318, GOLD),
]

def draw(size, *, maskable, scale):
    S = 4  # supersample for anti-aliasing
    W = 512 * S
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, W, W], fill=INK)
    else:
        d.rounded_rectangle([0, 0, W - 1, W - 1], radius=112 * S, fill=INK)
    pts = [(x * S, y * S) for x, y in shield(scale)]
    d.polygon(pts, fill=SEAL)
    d.line(pts + [pts[0]], fill=PAPER, width=int(12 * S * scale), joint="curve")
    for x0, y0, x1, y1, col in BARS:
        cx, cy = 256, 258
        box = [(cx + (x0 - cx) * scale) * S, (cy + (y0 - cy) * scale) * S,
               (cx + (x1 - cx) * scale) * S, (cy + (y1 - cy) * scale) * S]
        d.rounded_rectangle(box, radius=int(10 * S * scale), fill=col)
    return img.resize((size, size), Image.LANCZOS)

SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="InsurOS">
  <rect width="512" height="512" rx="112" fill="#1b2a41"/>
  <path d="M256 112 L364 152 V256 C364 326 318 374 256 404 C194 374 148 326 148 256 V152 Z"
        fill="#0f6e56" stroke="#f6f3ec" stroke-width="12" stroke-linejoin="round"/>
  <rect x="200" y="206" width="112" height="22" rx="10" fill="#f6f3ec"/>
  <rect x="200" y="250" width="112" height="22" rx="10" fill="#f6f3ec"/>
  <rect x="214" y="300" width="84" height="18" rx="9" fill="#c9a227"/>
</svg>
"""

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "insuros-mark.svg").write_text(SVG)
    draw(192, maskable=False, scale=1.0).save(OUT / "icon-192.png", optimize=True)
    draw(512, maskable=False, scale=1.0).save(OUT / "icon-512.png", optimize=True)
    # Maskable: full-bleed background, mark inside the 80% safe zone.
    draw(512, maskable=True, scale=0.82).save(OUT / "maskable-512.png", optimize=True)
    draw(180, maskable=True, scale=0.9).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    print("icons written to", OUT)
