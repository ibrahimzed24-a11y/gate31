"""Generate PWA icons for Gate 31 (no external image tooling required)."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

def font(size):
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def make(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = (int(124 * (1 - t) + 0 * t),
                        int(92 * (1 - t) + 229 * t),
                        int(255 * (1 - t) + 255 * t), 255)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
    bg = Image.new("RGBA", (size, size), (10, 10, 15, 255))
    bg.paste(img, (0, 0), mask)
    d = ImageDraw.Draw(bg)
    f = font(int(size * 0.42))
    label = "31"
    box = d.textbbox((0, 0), label, font=f)
    d.text(((size - (box[2] - box[0])) / 2, (size - (box[3] - box[1])) / 2 - box[1]),
           label, font=f, fill=(255, 255, 255, 255))
    bg.save(OUT / f"icon-{size}.png")

make(192)
make(512)
print("icons written to", OUT)
