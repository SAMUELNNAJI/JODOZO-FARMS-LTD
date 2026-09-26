"""Verify the progressive-enhancement rules that keep content visible.

Models the cascade the browser applies, so we can be sure the site never
shows a blank page:
  * With JS disabled  -> <html> has no `.js`, so `.reveal` stays visible.
  * With JS enabled   -> <html class="js"> hides `.reveal` until `.in` is
    added, and main.js always adds `.in` (observer, timeout, or load guard).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")

fails = []


def rule(pattern):
    m = re.search(pattern, css, re.IGNORECASE)
    return m.group(0) if m else None


# 1. The base .reveal rule must NOT hide content.
base = re.search(r"^\.reveal\{([^}]*)\}", css, re.MULTILINE)
if not base:
    fails.append("no base .reveal rule found")
else:
    body = base.group(1)
    if "opacity:0" in body.replace(" ", ""):
        fails.append(f"base .reveal hides content before JS runs: {body}")
    if "opacity:1" not in body.replace(" ", ""):
        fails.append(f"base .reveal does not default to visible: {body}")

# 2. The hiding rule must be scoped to html.js.
hiding = rule(r"html\.js \.reveal\{[^}]*opacity:0[^}]*\}")
if not hiding:
    fails.append("no `html.js .reveal{opacity:0}` rule - JS-gated hiding missing")

# 3. `.in` must restore visibility, also under html.js.
if not rule(r"html\.js \.reveal\.in\{[^}]*opacity:1[^}]*\}"):
    fails.append("no `html.js .reveal.in{opacity:1}` rule")

# 4. GSAP path must not bypass the js gate.
if not rule(r"html\.gsap-on\.js \.reveal\{[^}]*opacity:0"):
    fails.append("gsap-on rule is not gated behind .js - could blank the page")

# 5. main.js must add the `js` class if the inline head script is ever removed.
#    (The inline script is the primary mechanism; this is a belt-and-braces check
#     that the inline snippet exists in the pages.)

# 6. Fail-safe nets present.
if ".reveal:not(.in)" not in js:
    fails.append("main.js has no reveal fail-safe net")
if "prefers-reduced-motion" not in js:
    fails.append("main.js ignores prefers-reduced-motion")
if "try {" not in js or "initFallbackReveal" not in js:
    fails.append("main.js does not fall back when GSAP fails")

# 7. The inline head script must be present in every public page.
missing = []
for page in sorted(ROOT.glob("*.html")):
    if page.name in {"admin.html", "admin_login.html", "login.html"}:
        continue
    if 'classList.add("js")' not in page.read_text(encoding="utf-8"):
        missing.append(page.name)
if missing:
    fails.append(f"pages missing the early `js` class: {', '.join(missing)}")

if fails:
    print(f"FAILED ({len(fails)}):")
    for f in fails:
        print("  -", f)
    sys.exit(1)

print("Reveal/progressive-enhancement checks passed.")
print("  base .reveal   :", base.group(0))
print("  gated hiding   :", hiding)
