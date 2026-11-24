"""Generate Gate 31 PWA icons (light neumorphic theme)."""
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
    img = Image.new("RGBA", (size, size), (240, 244, 248, 255))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=(240, 244, 248, 255))
    s = size / 512
    for x, y0, y1, col in [(150, 152, 234, (55, 71, 79)), (204, 118, 234, (41, 182, 246)), (258, 138, 234, (41, 182, 246))]:
        d.rounded_rectangle([x*s, y0*s, (x+34)*s, y1*s], radius=17*s, fill=col)
    f = font(int(150 * s))
    label = "31"
    box = d.textbbox((0, 0), label, font=f)
    d.text(((size - (box[2] - box[0])) / 2, 300*s), label, font=f, fill=(41, 182, 246, 255))
    img.save(OUT / f"icon-{size}.png")

make(192)
make(512)
print("icons written to", OUT)
