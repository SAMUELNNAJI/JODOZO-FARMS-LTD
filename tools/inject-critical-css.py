#!/usr/bin/env python3
"""
Inject the critical inline head snippet into every public page.

Two jobs, both about making the page usable *before* the site finishes
loading (and if scripts never run at all):

 1. `document.documentElement.classList.add('js')` runs in <head>, before any
    paint. CSS only hides `.reveal` elements when `html.js` is present, so a
    browser with JS off still sees all content.
 2. Font loading is made non-blocking. The Google Fonts stylesheet is swapped
    to `media="print" onload="this.media='all'"`, so text renders immediately
    in the system-font fallback and re-flows once the webfont arrives, instead
    of blocking first paint on a third-party request.

Idempotent. Run:  python tools/inject-critical-css.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Admin/login pages are self-contained apps; leave them alone.
SKIP_FILES = {"admin.html", "admin_login.html", "login.html"}

HEAD_SNIPPET = (
    '<script>document.documentElement.classList.add("js");'
    'window.jfFonts=document.fonts;</script>'
)

# Google Fonts <link> made non-render-blocking.
FONT_LINK_RE = re.compile(
    r'<link\s+href="(https://fonts\.googleapis\.com/css2\?[^"]+)"\s+rel="stylesheet"\s*>',
    re.IGNORECASE,
)


def make_non_blocking(m: re.Match) -> str:
    href = m.group(1)
    return (
        f'<link rel="preload" as="style" href="{href}">'
        f'<link rel="stylesheet" href="{href}" media="print" '
        f"onload=\"this.media='all';this.onload=null\">"
        f'<noscript><link rel="stylesheet" href="{href}"></noscript>'
    )


def process(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    # 1. Non-blocking fonts.
    text = FONT_LINK_RE.sub(make_non_blocking, text)

    # 2. Early `js` class, injected right before </head> if not already there.
    if 'classList.add("js")' not in text and "</head>" in text:
        text = text.replace("</head>", f"{HEAD_SNIPPET}\n</head>", 1)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for page in sorted(ROOT.glob("*.html")):
        if page.name in SKIP_FILES:
            continue
        if process(page):
            print(f"  {page.name}")
            changed += 1
    print(f"\nPages updated: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
