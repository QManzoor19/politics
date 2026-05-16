"""Generate politics app icons (192, 512, 180) and an SVG fallback.

Design: classical Greek temple silhouette (4 columns, base, entablature, pediment)
in turquoise on a deep teal gradient — matches the app's theme.

Layout is "maskable-safe": all content sits inside the inner 80% of the canvas
so Android's circular/squircle/squarish mask crops won't clip the glyph.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Palette (matches app's :root)
BG_TOP    = (10, 42, 32)      # #0a2a20
BG_MID    = (15, 58, 42)      # #0f3a2a
BG_BOT    = (26, 84, 64)      # #1a5440
TURQUOISE = (45, 212, 191)    # #2dd4bf (primary)
CYAN      = (103, 232, 249)   # #67e8f9 (accent)
INK       = (228, 240, 238)   # #e4f0ee (highlight)


def radial_gradient(size, inner_color, outer_color, center=(0.5, 0.4)):
    """Cheap radial-gradient bg: linear vertical blend + glow blob."""
    w, h = size, size
    img = Image.new('RGB', (w, h), outer_color)
    # Vertical linear blend: BG_TOP -> BG_BOT
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        # Interpolate top -> mid (0..0.5) -> bot (0.5..1)
        if t < 0.5:
            tt = t / 0.5
            c = tuple(int(BG_TOP[i] + (BG_MID[i] - BG_TOP[i]) * tt) for i in range(3))
        else:
            tt = (t - 0.5) / 0.5
            c = tuple(int(BG_MID[i] + (BG_BOT[i] - BG_MID[i]) * tt) for i in range(3))
        for x in range(w):
            px[x, y] = c
    # Add a turquoise glow blob behind the temple
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = int(w * center[0]), int(h * center[1])
    r = int(w * 0.42)
    gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(45, 212, 191, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=w // 14))
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    return img


def draw_temple(img, color=TURQUOISE):
    """Draw a Greek-temple icon centered in the maskable-safe inner 80%."""
    w, h = img.size
    draw = ImageDraw.Draw(img, 'RGBA')

    # Safe zone: inner 80% (Android maskable requirement)
    inset = w * 0.10
    safe_w = w - 2 * inset
    safe_h = h - 2 * inset
    x0 = inset
    y0 = inset

    # Temple geometry inside safe zone
    # Pediment (triangle roof) - top 28%
    # Entablature (horizontal beam) - 8%
    # Columns + capitals - 50%
    # Stylobate (base steps) - 14%

    pediment_h = safe_h * 0.26
    entab_h    = safe_h * 0.08
    base_h     = safe_h * 0.12
    col_h      = safe_h - pediment_h - entab_h - base_h

    # Pediment: filled turquoise triangle, slightly inset from safe edges
    apex_x = x0 + safe_w / 2
    apex_y = y0 + safe_h * 0.02
    left_x = x0 + safe_w * 0.04
    right_x = x0 + safe_w - safe_w * 0.04
    base_y = y0 + pediment_h
    draw.polygon([(apex_x, apex_y), (left_x, base_y), (right_x, base_y)], fill=color)

    # Entablature: horizontal bar under pediment
    entab_y0 = base_y
    entab_y1 = entab_y0 + entab_h
    entab_inset = safe_w * 0.02
    draw.rectangle((x0 + entab_inset, entab_y0, x0 + safe_w - entab_inset, entab_y1), fill=color)

    # Columns: 4 fluted columns evenly spaced
    col_y0 = entab_y1 + safe_h * 0.02
    col_y1 = col_y0 + col_h
    n_cols = 4
    col_w = safe_w * 0.10
    span = safe_w - 2 * (safe_w * 0.08)
    gap = (span - col_w * n_cols) / (n_cols - 1)
    cx_start = x0 + safe_w * 0.08
    for i in range(n_cols):
        cx = cx_start + i * (col_w + gap)
        # Capital (slightly wider top)
        cap_w = col_w * 1.25
        cap_h = col_h * 0.08
        draw.rectangle((cx - (cap_w - col_w) / 2, col_y0, cx + col_w + (cap_w - col_w) / 2, col_y0 + cap_h), fill=color)
        # Shaft
        draw.rectangle((cx, col_y0 + cap_h, cx + col_w, col_y1 - cap_h), fill=color)
        # Base of column
        draw.rectangle((cx - (cap_w - col_w) / 2, col_y1 - cap_h, cx + col_w + (cap_w - col_w) / 2, col_y1), fill=color)

    # Stylobate: stepped base
    step_y0 = col_y1 + safe_h * 0.015
    step_y1 = y0 + safe_h
    # Two steps
    step1_inset = 0
    step2_inset = safe_w * 0.04
    mid_y = step_y0 + (step_y1 - step_y0) * 0.5
    draw.rectangle((x0 + step1_inset, step_y0, x0 + safe_w - step1_inset, mid_y), fill=color)
    draw.rectangle((x0 + step2_inset, mid_y + safe_h * 0.005, x0 + safe_w - step2_inset, step_y1), fill=color)


def build(size, out_path):
    img = radial_gradient(size, BG_MID, BG_TOP)
    draw_temple(img, color=TURQUOISE)
    img.save(out_path, 'PNG', optimize=True)
    print(f"  wrote {out_path}  ({size}x{size})")


def build_svg(out_path, size=512):
    """Vector version for icon.svg."""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="{size}" height="{size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a2a20"/>
      <stop offset="55%" stop-color="#0f3a2a"/>
      <stop offset="100%" stop-color="#1a5440"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg)"/>
  <rect width="100" height="100" fill="url(#glow)"/>
  <!-- Temple, sized within inner 80% (safe zone for maskable) -->
  <g fill="#2dd4bf">
    <!-- Pediment -->
    <polygon points="50,12 14,33 86,33"/>
    <!-- Entablature -->
    <rect x="13" y="33" width="74" height="7"/>
    <!-- Columns (4) -->
    <g>
      <rect x="16" y="42" width="11" height="3.5"/>
      <rect x="17.4" y="45.5" width="8.2" height="29"/>
      <rect x="16" y="74.5" width="11" height="3.5"/>
    </g>
    <g>
      <rect x="33" y="42" width="11" height="3.5"/>
      <rect x="34.4" y="45.5" width="8.2" height="29"/>
      <rect x="33" y="74.5" width="11" height="3.5"/>
    </g>
    <g>
      <rect x="56" y="42" width="11" height="3.5"/>
      <rect x="57.4" y="45.5" width="8.2" height="29"/>
      <rect x="56" y="74.5" width="11" height="3.5"/>
    </g>
    <g>
      <rect x="73" y="42" width="11" height="3.5"/>
      <rect x="74.4" y="45.5" width="8.2" height="29"/>
      <rect x="73" y="74.5" width="11" height="3.5"/>
    </g>
    <!-- Stylobate (two steps) -->
    <rect x="10" y="79" width="80" height="4.5"/>
    <rect x="14" y="84" width="72" height="4.5"/>
  </g>
</svg>
'''
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"  wrote {out_path}")


if __name__ == '__main__':
    print(f"Output dir: {OUT_DIR}")
    build(192, os.path.join(OUT_DIR, 'icon-192.png'))
    build(512, os.path.join(OUT_DIR, 'icon-512.png'))
    build(180, os.path.join(OUT_DIR, 'apple-touch-icon.png'))
    build_svg(os.path.join(OUT_DIR, 'icon.svg'))
    print("done.")
