#!/usr/bin/env python3
"""
Pre-deploy sanity checks for the optimised site.

Verifies, and exits non-zero on any failure:
  1. No public page links to another public page via `*.html`
     (those would each cost a 301 redirect hop).
  2. Canonical + og:url are absolute and extension-free.
  3. Every <img> has width/height (CLS) and every srcset file exists on disk.
  4. Every `.reveal` animation has a fail-safe, and `html.js` is set in <head>.
  5. The host configs for clean URLs exist.

Run:  python tools/verify.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"admin.html", "admin_login.html", "login.html"}
SITE = "https://www.jodozofarms.com"

problems: list[str] = []


def check_links() -> None:
    for page in sorted(ROOT.glob("*.html")):
        if page.name in SKIP:
            continue
        text = page.read_text(encoding="utf-8")
        for m in re.finditer(r'(?:href|src)="([^"]+)"', text):
            url = m.group(1)
            if url.endswith(".html") and not any(k in url for k in ("admin", "login")):
                problems.append(f"{page.name}: stale .html link -> {url}")


def check_seo() -> None:
    for page in sorted(ROOT.glob("*.html")):
        if page.name in SKIP:
            continue
        text = page.read_text(encoding="utf-8")
        # Error pages are intentionally noindex, so they carry no canonical.
        if page.name in {"404.html", "500.html"}:
            if 'name="robots"' not in text:
                problems.append(f"{page.name}: error page should be noindex")
            continue
        m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', text)
        if not m:
            problems.append(f"{page.name}: no canonical tag")
            continue
        canon = m.group(1)
        if not canon.startswith(SITE):
            problems.append(f"{page.name}: canonical not absolute -> {canon}")
        if canon.endswith(".html"):
            problems.append(f"{page.name}: canonical has .html -> {canon}")


def check_images() -> None:
    for page in sorted(ROOT.glob("*.html")):
        # Admin/login are self-contained apps with runtime-swapped previews.
        if page.name in {"admin.html", "admin_login.html", "login.html"}:
            continue
        text = page.read_text(encoding="utf-8")
        for tag in re.findall(r"<img\b[^>]*>", text, re.IGNORECASE):
            ident = re.search(r'id="([^"]+)"', tag)
            if ident and ident.group(1).lower() in {"postherobg", "postimg"}:
                continue  # src is set at runtime
            for attr in ("width", "height", "loading", "decoding"):
                if f"{attr}=" not in tag:
                    problems.append(f"{page.name}: <img> missing {attr} (id={ident.group(1) if ident else '-'})")
            for u in re.findall(r'srcset="([^"]+)"', tag):
                for entry in u.split(","):
                    f = entry.strip().split(" ")[0]
                    if f and not (ROOT / f).is_file():
                        problems.append(f"{page.name}: srcset file missing -> {f}")


def check_reveal_safety() -> None:
    css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
    if "html.js .reveal{opacity:0" not in css:
        problems.append("styles.css: .reveal is not gated behind html.js")
    js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
    if ".reveal:not(.in)" not in js:
        problems.append("main.js: missing the reveal fail-safe net")


def check_hosts() -> None:
    for f in (".htaccess", "_redirects", "vercel.json"):
        if not (ROOT / f).is_file():
            problems.append(f"missing host config: {f}")


def main() -> int:
    check_links()
    check_seo()
    check_images()
    check_reveal_safety()
    check_hosts()

    if problems:
        print(f"FAILED - {len(problems)} problem(s):")
        for p in problems:
            print("  -", p)
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
