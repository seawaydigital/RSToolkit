"""Generate the toolkit's favicon, touch icon, and social card.

Run:  python scripts/generate-icons.py

Requires Pillow (pip install Pillow). Pillow is NOT a project dependency —
this is a one-off generator, not part of the build. Output goes to public/.

The mark deliberately matches the topbar logo: Blaze "RS" on a rounded
Cobalt ground. Colors are the design-system tokens from global.css; if the
palette changes there, change it here too.
"""

import os

from PIL import Image, ImageDraw, ImageFont

# Design tokens — keep in sync with src/styles/global.css
COBALT = (6, 23, 39, 255)      # --bg-primary #061727
BLAZE = (255, 194, 14, 255)    # --accent    #FFC20E

# A bold grotesque stands in for Archivo, which isn't installed system-wide.
# At favicon sizes the difference is invisible. Falls back across platforms.
FONT_CANDIDATES = [
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")

# 8x supersample, then downsample with LANCZOS — keeps the glyph edges clean
# at 16px, where naive rendering turns to mush.
SUPERSAMPLE = 8


def _font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(
        "No bold font found. Add one to FONT_CANDIDATES for your platform."
    )


def _centered_text(draw, text, font, box_size):
    """Center by the glyph's actual ink bounds, not its font metrics."""
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (box_size - (bbox[2] - bbox[0])) / 2 - bbox[0]
    y = (box_size - (bbox[3] - bbox[1])) / 2 - bbox[1]
    return x, y


def square_mark(size):
    """Rounded Cobalt square with Blaze 'RS'."""
    s = size * SUPERSAMPLE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.18), fill=COBALT)
    font = _font(int(s * 0.52))
    draw.text(_centered_text(draw, "RS", font, s), "RS", font=font, fill=BLAZE)
    return img.resize((size, size), Image.LANCZOS)


def social_card():
    """1200x630 Open Graph card."""
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), COBALT)
    draw = ImageDraw.Draw(img)

    mark = square_mark(140)
    img.paste(mark, (90, 150), mark)

    title_font = _font(78)
    sub_font = _font(36)
    draw.text((90, 330), "Research Security Toolkit", font=title_font, fill=BLAZE)
    draw.text(
        (90, 430),
        "Canadian research security, without the guesswork.",
        font=sub_font,
        fill=(255, 255, 255, 255),
    )
    return img.convert("RGB")


def main():
    out = os.path.abspath(PUBLIC)
    os.makedirs(out, exist_ok=True)

    square_mark(180).save(os.path.join(out, "apple-touch-icon.png"))
    # Multi-size ICO so 16px tab rendering doesn't downscale a 48px bitmap.
    square_mark(48).save(
        os.path.join(out, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)]
    )
    social_card().save(os.path.join(out, "og-image.png"))

    print("Wrote apple-touch-icon.png, favicon.ico, og-image.png to", out)


if __name__ == "__main__":
    main()
