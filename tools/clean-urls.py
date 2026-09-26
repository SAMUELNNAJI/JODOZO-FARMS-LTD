#!/usr/bin/env python3
"""
Switch every internal link from `page.html` to the clean `page` form.

Why: with the host configs in place (.htaccess, _redirects, vercel.json)
`/about.html` 301-redirects to `/about`, so keeping `.html` in the markup
would make every internal click pay for an extra redirect round-trip.

Rewrites, in HTML pages and in the JS that builds links:
  * href="about.html"            -> href="/about"      (index.html -> "/")
  * href="about.html#profile"    -> href="/about#profile"
  * href="post.html?id=x"        -> href="/post?id=x"   (query kept)
  * canonical/og:url  .../about.html -> .../about
  * sitemap.xml <loc> entries

`admin.html` / `login.html` keep their extensions - they are private tools
excluded from the sitemap, and clean URLs there add no value.

Idempotent. Run:  python tools/clean-urls.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Files whose links we rewrite.
HTML_GLOBS = ("*.html",)
JS_GLOBS = ("js/*.js",)

# Never touched.
KEEP_EXT = {"admin.html", "admin_login.html", "login.html"}

# Matches href="foo.html", src="foo.html", 'foo.html' in JS, <loc>...</loc>
LINK_RE = re.compile(r'((?:href|src)\s*=\s*")([^"#?]+\.html)((?:#[^"]*)?)(")', re.IGNORECASE)
URL_RE = re.compile(r'(https?://(?:www\.)?jodozofarms\.com/)([^"\'<>\s]*?)\.html\b', re.IGNORECASE)
LOC_RE = re.compile(r"(<loc>\s*)(https?://[^<]+?)\.html(\s*</loc>)", re.IGNORECASE)
JS_PATH_RE = re.compile(r"(?<![\w/.-])([a-z0-9][a-z0-9-]*)\.html(?![\w-])", re.IGNORECASE)


def clean_target(target: str) -> str | None:
    """Map 'about.html' -> '/about'. Returns None if nothing to change."""
    name = target.rsplit("/", 1)[-1]
    if name in KEEP_EXT or not name.lower().endswith(".html"):
        return None
    stem = name[: -len(".html")]
    if stem == "index":
        return "/"
    return "/" + stem


def fix_html(text: str) -> str:
    def repl(m: re.Match) -> str:
        target = m.group(2)
        base = target.rsplit("/", 1)[-1]
        if base in KEEP_EXT:
            return m.group(0)
        new = clean_target(target)
        if new is None:
            return m.group(0)
        return f'{m.group(1)}{new}{m.group(3)}{m.group(4)}'

    text = LINK_RE.sub(repl, text)
    # Absolute SEO URLs (canonical, og:url, twitter, JSON-LD, sitemap).
    text = URL_RE.sub(lambda m: m.group(1) + (clean_target(m.group(2)) or m.group(2)).lstrip("/"), text)
    text = LOC_RE.sub(
        lambda m: m.group(1) + m.group(2) + (clean_target(m.group(2)) or m.group(2)).lstrip("/") + m.group(3),
        text,
    )
    return text


def fix_js(text: str) -> str:
    def repl(m: re.Match) -> str:
        stem = m.group(1)
        if stem in {"admin", "login", "admin_login"}:
            return m.group(0)
        return f"/{stem}"

    return JS_PATH_RE.sub(repl, text)


def main() -> int:
    changed = []
    for pattern in HTML_GLOBS:
        for page in sorted(ROOT.glob(pattern)):
            if page.name in KEEP_EXT:
                continue
            text = page.read_text(encoding="utf-8")
            new = fix_html(text)
            if new != text:
                page.write_text(new, encoding="utf-8")
                changed.append(page.name)

    for pattern in JS_GLOBS:
        for js in sorted(ROOT.glob(pattern)):
            text = js.read_text(encoding="utf-8")
            new = fix_js(text)
            if new != text:
                js.write_text(new, encoding="utf-8")
                changed.append(str(js.relative_to(ROOT)))

    sitemap = ROOT / "sitemap.xml"
    if sitemap.is_file():
        text = sitemap.read_text(encoding="utf-8")
        new = fix_html(text)
        if new != text:
            sitemap.write_text(new, encoding="utf-8")
            changed.append("sitemap.xml")

    for name in changed:
        print(f"  {name}")
    print(f"\nFiles updated: {len(changed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
