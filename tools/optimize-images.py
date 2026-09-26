#!/usr/bin/env python3
"""
Image optimizer for the Jodozo Farms static site.

Reads every source image in ./images, and writes responsive derivative sets
beside them:

    images/hero-1.jpg            (source, optimised in place as a fallback)
    images/hero-1-640.webp
    images/hero-1-1280.webp
    images/hero-1-1920.webp

Sources are never deleted, so the original .jpg links keep working.
Run:  python tools/optimize-images.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  python -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"

# Widths rendered per image. Hero/banner art is served larger than thumbnails.
WIDTHS = (480, 768, 1200, 1600, 2000)
MAX_WIDTH = 2000

JPEG_QUALITY = 78
WEBP_QUALITY = 76
WEBP_METHOD = 6

# Images under this size (bytes) are left alone - not worth the request.
SKIP_BELOW = 20_000

SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}


def human(n: int) -> str:
    return f"{n / 1024:,.0f} KB"


def optimise_source(path: Path) -> int:
    """Re-encode the original file losslessly-ish so it stays small.

    Returns bytes saved. Skipped for PNGs with transparency.
    """
    before = path.stat().st_size
    with Image.open(path) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, round(h * MAX_WIDTH / w)), Image.LANCZOS)
        tmp = path.with_suffix(".tmp.jpg")
        im.save(tmp, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    tmp.replace(path)
    return before - path.stat().st_size


def target_widths(src_width: int) -> list[int]:
    """Widths worth rendering for a source of `src_width` pixels.

    Never upscales: widths larger than the source are dropped, and at least
    one variant is always emitted so every image has a WebP fallback.
    """
    usable = [w for w in WIDTHS if w <= src_width]
    if not usable:
        usable = [src_width]
    return usable


def emit_derivatives(path: Path) -> int:
    """Write the WebP width variants. Returns total bytes written."""
    written = 0
    with Image.open(path) as src:
        src.load()
        base = path.stem
        for target_w in target_widths(src.width):
            if target_w == src.width:
                im = src
            else:
                im = src.resize(
                    (target_w, round(src.height * target_w / src.width)),
                    Image.LANCZOS,
                )
            out = IMAGES / f"{base}-{target_w}.webp"
            im.save(out, "WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
            written += out.stat().st_size
    return written


def main() -> int:
    if not IMAGES.is_dir():
        sys.exit(f"No images directory at {IMAGES}")

    files = sorted(
        p for p in IMAGES.iterdir()
        if p.is_file()
        and p.suffix.lower() in SUPPORTED
        and p.stat().st_size >= SKIP_BELOW
    )

    before_total = sum(p.stat().st_size for p in files)
    for p in files:
        original = p.stat().st_size
        saved = 0
        if p.suffix.lower() in {".jpg", ".jpeg"}:
            saved = optimise_source(p)
        size = p.stat().st_size
        print(f"  {p.name:<24} {human(original):>10} -> {human(size):>10}"
              f"  ({'-' if saved >= 0 else '+'}{human(abs(saved))})")
        try:
            emit_derivatives(p)
        except Exception as exc:  # keep going, one bad file shouldn't abort
            print(f"    ! derivatives failed: {exc}", file=sys.stderr)

    after_total = sum(p.stat().st_size for p in files)
    print(
        f"\nOriginals: {human(before_total)} -> {human(after_total)}"
        f"  (saved {human(before_total - after_total)})"
    )
    print(f"Responsive .webp variants written to {IMAGES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
