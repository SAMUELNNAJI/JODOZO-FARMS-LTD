"""Report what a first-time visitor actually downloads, before vs after.

Simulates a cold visit at a given viewport: the HTML, the CSS/JS it pulls in,
and only the image each <picture> would actually fetch at that width.

Usage:  python tools/weight-report.py [page.html]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKUP = ROOT / ".git" / "image-backup"


def kb(n):
    return n / 1024


def pick(srcset, target_w):
    """Best candidate in a srcset for target_w, or None."""
    if not srcset:
        return None
    best, best_w = None, -1
    for entry in srcset.split(","):
        bits = entry.strip().split()
        if not bits:
            continue
        path = bits[0]
        w = int(bits[1][:-1]) if len(bits) > 1 and bits[1].endswith("w") else 0
        if w >= target_w and w > best_w:
            best, best_w = path, w
    return best


def iter_images(html):
    """Yield (source_srcset, img_tag) per <picture>, in document order.

    Parsing the whole <picture> block avoids the lookbehind-window bug where a
    card image could pick up the previous card's <source>.
    """
    for m in re.finditer(r"<picture>(.*?)</picture>", html, re.IGNORECASE | re.DOTALL):
        block = m.group(1)
        src = re.search(r'<source[^>]*type="image/webp"[^>]*srcset="([^"]+)"', block)
        img = re.search(r"<img\b[^>]*>", block, re.IGNORECASE)
        if img:
            yield (src.group(1) if src else None), img.group(0)


def chosen_image(source_srcset, tag, target_w):
    """The file a browser would fetch for this <picture>/<img> at target_w."""
    cand = pick(source_srcset, target_w)
    if cand and (ROOT / cand).is_file():
        return cand

    m = re.search(r'srcset="([^"]+)"', tag)
    cand = pick(m.group(1), target_w) if m else None
    if cand and (ROOT / cand).is_file():
        return cand

    m = re.search(r'src="([^"]+)"', tag)
    if m and (ROOT / m.group(1)).is_file():
        return m.group(1)
    return None


def current_weight(page: Path, target_w: int, lazy_only: bool = False) -> int:
    """Bytes downloaded at `target_w`.

    lazy_only=True skips images that are `loading="lazy"` - i.e. what the first
    paint costs, before the user scrolls.
    """
    html = page.read_text(encoding="utf-8")
    total = 0
    seen = set()

    for attr in re.findall(r'(?:href|src)="([^"]+)"', html):
        if attr.startswith(("http", "mailto", "#", "/")) or not attr:
            continue
        f = ROOT / attr
        if f.is_file() and f.suffix in {".css", ".js"}:
            total += f.stat().st_size

    for source_srcset, tag in iter_images(html):
        if lazy_only and 'loading="lazy"' in tag:
            continue
        chosen = chosen_image(source_srcset, tag, target_w)
        if not chosen or chosen in seen:
            continue
        seen.add(chosen)
        f = ROOT / chosen
        if f.is_file():
            total += f.stat().st_size
    return total


def baseline_weight(page: Path, lazy_only: bool = False) -> int:
    """What the page cost before: each distinct ORIGINAL full-size JPEG."""
    html = page.read_text(encoding="utf-8")
    total = 0
    seen = set()
    for source_srcset, tag in iter_images(html):
        if lazy_only and 'loading="lazy"' in tag:
            continue
        m = re.search(r'src="([^"]+)"', tag)
        if not m:
            continue
        name = m.group(1).split("/")[-1]
        if name in seen:
            continue
        seen.add(name)
        orig = BACKUP / name
        if orig.is_file():
            total += orig.stat().st_size
    return total


def report(page: Path, label: str, lazy_only: bool) -> None:
    before = baseline_weight(page, lazy_only)
    print(f"{label}")
    print(f"{'viewport':>9} | {'now':>10} | {'before':>10} | {'saved':>8}")
    print("-" * 45)
    for vp, w in (("mobile", 480), ("tablet", 768), ("desktop", 1600)):
        now = current_weight(page, w, lazy_only)
        pct = ((before - now) / before * 100) if before else 0
        print(f"{vp:>9} | {kb(now):>7.0f} KB | {kb(before):>7.0f} KB | {pct:>7.0f}%")
    print()


def main() -> int:
    name = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    page = ROOT / name
    print(f"{name}\n")
    report(page, "First paint (above-the-fold images only):", True)
    report(page, "Full page (after scrolling everything into view):", False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
