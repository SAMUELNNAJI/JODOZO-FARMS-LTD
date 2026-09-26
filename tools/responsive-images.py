#!/usr/bin/env python3
"""
Rewrite <img> tags across the site to be responsive + non-blocking.

For every `<img src="images/foo.jpg">` this tool:
  * reads the real pixel dimensions (so width/height are correct, killing CLS)
  * builds a WebP <source srcset> plus a JPEG <img srcset> from the files
    produced by optimize-images.py
  * picks a `sizes` hint from the element's CSS context (hero vs card vs grid)
  * sets loading/decoding/fetchpriority correctly:
      - above-the-fold hero / page-hero banner  -> loading=eager + high priority
      - everything else                        -> loading=lazy + async decode

Idempotent: tags that already carry a `srcset` are left untouched.
Run:  python tools/responsive-images.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"

# Candidate widths, in the order they should appear in a srcset.
WIDTHS = (480, 768, 1200, 1600, 2000)

# context -> `sizes`. Matched against the DIRECT PARENT's class plus the
# image's own class. Ordered most-specific first; the first regex that hits wins.
SIZES_RULES = [
    (re.compile(r"hero-slide"), "100vw"),
    (re.compile(r"bgimg"), "100vw"),
    (re.compile(r"partner-img"), "100vw"),
    (re.compile(r"cols-4"), "(max-width:640px) 92vw, (max-width:1080px) 46vw, 24vw"),
    (re.compile(r"cols-3"), "(max-width:640px) 92vw, (max-width:900px) 46vw, 31vw"),
    (re.compile(r"cols-2"), "(max-width:640px) 92vw, 46vw"),
    (re.compile(r"split-img-stack"), "(max-width:900px) 92vw, 44vw"),
    (re.compile(r"split-img"), "(max-width:900px) 92vw, 46vw"),
    (re.compile(r"svc-img|trio-img|news-img|proj-img|about-img"),
     "(max-width:640px) 92vw, (max-width:900px) 46vw, 31vw"),
]

# Images whose `src` is swapped at runtime by JS. Wrapping these in <picture>
# would make the static <source> win over the new src, so they are left alone.
SKIP_IDS = {"postherobg", "postimg", "pfpreview", "prpreview"}

# Files that are JS-driven apps - no static image rewriting.
SKIP_FILES = {"admin.html", "admin_login.html", "login.html"}

DEFAULT_SIZES = "(max-width:900px) 92vw, 46vw"

IMG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE | re.DOTALL)

# basename -> (variants, full_width, full_height)
_info_cache: dict[str, tuple[list[tuple[int, str, str]], int, int]] = {}


def get_attr(tag: str, name: str) -> str | None:
    m = re.search(rf'\s{name}\s*=\s*"([^"]*)"', tag, re.IGNORECASE)
    return m.group(1) if m else None


def set_attr(tag: str, name: str, value: str) -> str:
    if re.search(rf'\s{name}\s*=\s*"', tag, re.IGNORECASE):
        return re.sub(
            rf'(\s{name}\s*=\s*")[^"]*(")',
            lambda m: m.group(1) + value + m.group(2),
            tag, count=1, flags=re.IGNORECASE,
        )
    if tag.rstrip().endswith("/>"):
        return tag.rstrip()[:-2].rstrip() + f' {name}="{value}"/>'
    return tag.rstrip()[:-1].rstrip() + f' {name}="{value}">'


def remove_attr(tag: str, name: str) -> str:
    return re.sub(rf'\s{name}\s*=\s*"[^"]*"', "", tag, flags=re.IGNORECASE)



def build_variants(stem: str) -> tuple[list[tuple[int, str, str]], int, int]:
    """Return (variants, full_width, full_height) for an image stem.

    variants is a list of (display_width, webp_path, jpg_path) sorted ascending.
    """
    if stem in _info_cache:
        return _info_cache[stem]

    src_path = None
    for ext in (".jpg", ".jpeg", ".png"):
        cand = IMAGES / f"{stem}{ext}"
        if cand.is_file():
            src_path = cand
            break
    if src_path is None:
        _info_cache[stem] = ([], 0, 0)
        return _info_cache[stem]

    with Image.open(src_path) as im:
        full_w, full_h = im.size

    variants: list[tuple[int, str, str]] = []
    for w in WIDTHS:
        if w > full_w:
            continue
        webp = IMAGES / f"{stem}-{w}.webp"
        if not webp.is_file():
            continue
        # JPEG fallback at the same width, else the single optimised source.
        jpg = IMAGES / f"{stem}-{w}.jpg"
        if not jpg.is_file():
            jpg = src_path
        variants.append((w, f"images/{webp.name}", f"images/{jpg.name}"))

    if not variants:
        variants.append(
            (full_w, f"images/{src_path.with_suffix('.webp').name}",
             f"images/{src_path.name}")
        )

    _info_cache[stem] = (variants, full_w, full_h)
    return _info_cache[stem]


OPENING_TAG_RE = re.compile(
    r"<(div|section|a|article|li|figure)\b([^>]*)>", re.IGNORECASE
)
CLASS_ATTR_RE = re.compile(r'class\s*=\s*"([^"]*)"', re.IGNORECASE)


def parent_classes(context: str, pos: int) -> str:
    """Classes of the nearest still-open container elements before `pos`.

    Walks backwards through opening tags and keeps the ones that have not yet
    been closed, so an ancestor grid (cols-3) is seen without being confused by
    unrelated markup far above the image.
    """
    before = context[:pos]
    stack: list[str] = []
    for m in re.finditer(r"<(/?)(div|section|a|article|li|figure)\b[^>]*>", before, re.IGNORECASE):
        closing = m.group(1) == "/"
        cm = CLASS_ATTR_RE.search(m.group(0))
        cls = cm.group(1) if cm else ""
        if closing:
            if stack and stack[-1] == cls:
                stack.pop()
            elif cls in stack:
                while stack and stack.pop() != cls:
                    pass
        else:
            stack.append(cls)
    return " ".join(stack)


def pick_sizes(tag: str, context: str, pos: int) -> str:
    hay = parent_classes(context, pos) + " " + tag.lower()
    for pattern, sizes in SIZES_RULES:
        if pattern.search(hay):
            return sizes
    return DEFAULT_SIZES


def is_eager(tag: str, context: str, pos: int) -> bool:
    """True for above-the-fold art: the home hero slider and page-hero banners."""
    hay = parent_classes(context, pos) + " " + tag.lower()
    if "partner-img" in hay:
        return False
    return bool(re.search(r"hero-slide|bgimg", hay))


def process_tag(tag: str, context: str, pos: int) -> str:
    src = get_attr(tag, "src")
    if not src or not src.lower().startswith("images/"):
        return tag

    img_id = (get_attr(tag, "id") or "").lower()
    if img_id in SKIP_IDS:
        return tag

    stem = Path(src).stem
    variants, full_w, full_h = build_variants(stem)
    if not variants or full_w == 0:
        return tag

    sizes = pick_sizes(tag, context, pos)
    webp_set = ", ".join(f"{p} {w}w" for w, p, _ in variants)
    # The JPEG fallback is a single optimised original, so advertise its TRUE
    # width once. Listing one file at several widths would be a lie and would
    # make the browser pick a "small" candidate that is really full-size.
    jpg_set = f"{variants[0][2]} {full_w}w"

    loading = "eager" if is_eager(tag, context, pos) else "lazy"

    out = tag
    out = set_attr(out, "sizes", sizes)
    out = set_attr(out, "srcset", jpg_set)
    out = set_attr(out, "width", str(full_w))
    out = set_attr(out, "height", str(full_h))
    out = set_attr(out, "loading", loading)
    out = set_attr(out, "decoding", "async")
    if loading == "eager":
        out = set_attr(out, "fetchpriority", "high")
    else:
        out = remove_attr(out, "fetchpriority")

    return (
        f'<picture><source type="image/webp" srcset="{webp_set}" sizes="{sizes}">'
        f"{out}</picture>"
    )


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text

    out_parts: list[str] = []
    idx = 0
    count = 0
    for m in IMG_RE.finditer(text):
        tag = m.group(0)
        out_parts.append(text[idx:m.start()])
        src = (get_attr(tag, "src") or "").lower()
        if "srcset=" not in tag.lower() and src.startswith("images/"):
            out_parts.append(process_tag(tag, text, m.start()))
            count += 1
        else:
            out_parts.append(tag)
        idx = m.end()
    out_parts.append(text[idx:])

    new_text = "".join(out_parts)
    if new_text != original:
        path.write_text(new_text, encoding="utf-8")
    return count


def main() -> int:
    total = 0
    for page in sorted(ROOT.glob("*.html")):
        if page.name in SKIP_FILES:
            continue
        n = process_file(page)
        if n:
            print(f"  {page.name:<28} {n:>3} image(s) made responsive")
            total += n
    print(f"\nTotal <img> tags upgraded: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
