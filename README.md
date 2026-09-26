# JODOZO FARMS LTD — Corporate Website

An integrated agriculture, agro-processing and agro-allied enterprise website, built from the company's registered objects and the approved homepage design mockup.

**Positioning:** *JODOZO FARMS LTD — An Integrated Agriculture, Agro-Processing and Agro-Allied Enterprise.*

## Quick Start

No build step required — it's a pure static site.

1. Open `index.html` in any modern browser, **or**
2. Serve locally: `python -m http.server 8000` → http://localhost:8000 (or use the VS Code Live Server extension)

> Note: the shared header/footer are injected by `js/layout.js`, so serving over HTTP (or opening files directly in a browser with JS enabled) both work fine.
>
> **URLs:** internal links use the real filename form (`/about.html`, `/services.html`). This is deliberate - see "URL strategy" below. It resolves on every host, including a bare `python -m http.server`.

## Site Structure (matches the approved architecture)

```
HOME                index.html
ABOUT US            about.html  (Profile, Vision/Mission, Values, Objectives, Why Jodozo)
OUR AGRIBUSINESS    agribusiness.html  (hub)
  Crop Production   crop-production.html
  Livestock         livestock-farming.html
  Poultry           poultry-farming.html
  Dairy             dairy-farming.html
  Fisheries         fisheries.html
  Beekeeping        beekeeping.html
  Fruit Farming     fruit-farming.html
  Cereal Farming    cereal-farming.html
  Plantations       plantations.html
AGRO-PROCESSING     agro-processing.html  (8-step value chain: Farm→…→Consumer)
AGRICULTURAL INPUTS agricultural-inputs.html  (incl. #feeds anchor)
SERVICES            services.html  (incl. #empowerment anchor)
  Mechanised Farming mechanised-farming.html
  Jodozo Farm Academy farm-academy.html
  Consultancy       consultancy.html
EQUIPMENT & MACHINERY equipment.html
WATER & IRRIGATION  water-irrigation.html
TRADE & DISTRIBUTION trade-distribution.html
PROJECTS            projects.html  (filterable portfolio)
INVEST / PARTNER    partnerships.html  (#investors #outgrowers #suppliers #distributors)
NEWS & RESOURCES    news.html  (category filter + newsletter signup)
CONTACT             contact.html  (Enquiry / Quote / Distributor / Partner tabs + map)
```

## Main Navigation (top bar)

`HOME | ABOUT▾ | AGRIBUSINESS▾ | AGRO-PROCESSING | SERVICES▾ | PROJECTS | PARTNERSHIPS▾ | NEWS | CONTACT` + **Get a Quote** button.

## Key Features

- **Homepage** mirrors the approved mockup: hero slider (4 slides, Ken Burns effect, dots), 8 core-service cards, dark-green value-chain panel (Farm Produce → Process → Preserve → Package → Distribute → Market), Who We Are, feature trio, featured projects, Partner band (Investors / Farmers & Outgrowers / Suppliers / Distributors), News cards, and the 4-column footer.
- **Shared layout** — header (with dropdowns), footer and floating WhatsApp / back-to-top buttons are injected once from `js/layout.js`; active-menu state auto-highlights per page.
- **Behaviours** in `js/main.js`: hero slider, mobile slide-in nav with accordion dropdowns, scroll-reveal animations, animated stat counters, project/news category filtering, contact form tabs (deep-linkable via `?form=enquiry|quote|distributor|partner`), and client-side form validation with success states.
- **Forms** are live: `form[data-form]` in `contact.html` / `news.html` POST to FormSubmit.co, which delivers the message to **jodozofarmslimited@gmail.com**. A hidden honeypot field blocks bots, and if the request fails the visitor's mail composer opens as a fallback so no enquiry is lost. To change the receiving inbox, edit `ADMIN_EMAIL` in `js/main.js`.
- **Images** live in `/images` — real **Nigerian agriculture photography** (maize threshing in Makarfi, Kaduna; ploughing in Kwara; poultry at Barnawa; Fulani cattle; catfish ponds; cassava and palm-oil processing; Nigerian markets; irrigation; Lagos port and more), each chosen to match its card or section, sourced from Wikimedia Commons with the full licence/author guide in `/images/CREDITS.md`. Replace with Jodozo's own farm photography when available — keep the same file names to avoid code changes.
- **Map** on the Contact page is a Google Maps embed; update the `iframe src` with the exact farm coordinates.

## Admin Dashboard & Sign In

Access is split across two pages:

| Page | Purpose |
|---|---|
| **`login.html`** | Public-facing sign-in screen. On successful verification it **redirects to `admin.html`**. If a session already exists it skips straight through. |
| **`admin.html`** | The dashboard itself. It is **guarded** — opening it without a session instantly redirects you back to `login.html`. Logging out returns you to `login.html`. |

The login link is intentionally **invisible** on the public site. Reach the sign-in page by either:

- pressing **`Ctrl + Shift + A`** on any page, or
- clicking the invisible 1px dot right after the copyright text in the footer.

**Credentials:** `Admin@gmail.com` / `Admin@1122`

### What you can manage once signed in

- **Overview** — stat cards (posts, projects, ongoing, completed/planned), a posts-by-category bar chart and recent activity feed.
- **Posts & Blog** — publish, edit, search and delete news posts. Each post has a title, tag label, category, date, **full body content** (blank-line-separated paragraphs) and a cover photo that you **upload from your own Nigeria farm photos** (auto-compressed and stored with the post) — or pick from the site library as a fallback. Every post automatically opens its own **detail page** (`post.html?id=...`) with a hero, drop-cap article body and a "More from Jodozo" sidebar.
- **Featured Projects** — add, edit and delete portfolio projects with card chip label, category, location, status (Ongoing / Completed / Planned) and a **photo you upload from your device** (auto-compressed) — or a site-library image. A storage-full guard prevents silent data loss.

Every change saves instantly to `localStorage` and the public pages re-render from it — the homepage blog strip (`data-limit="3"`), the homepage Featured Projects strip (`data-limit="4"`), `news.html` and `projects.html` all read the same store.

**How rendering works**

- `js/store.js` holds the data layer, the seed content (the original 6 posts + 9 projects), the session helpers (`JF.login`, `JF.isLogged`, `JF.logout`) and the render functions (`JF.renderPosts`, `JF.renderProjects`).
- `js/auth.js` powers the sign-in page (validation, error shake, redirect to the dashboard).
- `js/admin.js` powers the dashboard (route guard, CRUD, toasts).
- Pages only contain a mount point, e.g. `<div class="grid cols-3" data-render="posts"></div>` or `<div class="grid cols-4" data-render="projects" data-limit="4"></div>` — JavaScript fills them in.
- The seed is versioned (`jf_seed_v`); bump `V` in `store.js` to push fresh seed data to browsers holding older data.

> **Security note:** this is a front-end demo dashboard — credentials are checked in the browser and content is stored per-browser. For production, move authentication and storage to a server (e.g. a Node/Express + database API, or Firebase/Supabase) and keep the same UI.

## Design System

- Fonts: Poppins (headings) + Inter (body) via Google Fonts
- Colours: forest-green palette (`--g950 #082615` … `--g500 #22c55e`), soft off-white sections
- All styling in `css/styles.css` (cards, buttons, hero, value chain, partner band, forms, tabs, responsive breakpoints at 1080/900/640px)

## SEO

Every public page ships with a full on-page SEO head — unique `<title>` + `<meta name="description">`, canonical URL, Open Graph (Facebook/WhatsApp/LinkedIn), Twitter cards, `theme-color`, and JSON-LD structured data (`Organization` + `WebSite` on the homepage, dynamic `Article` schema on `post.html`).

- **`robots.txt`** allows all crawlers, blocks `admin.html` / `login.html`, and points to the sitemap.
- **`sitemap.xml`** lists all 25 public pages (dynamic `post.html?id=…` detail pages are excluded — single-page app routes can't be enumerated statically).
- **`seo-inject.mjs`** is the generator: it reads each page's existing title/description and injects the head tags, then writes `sitemap.xml` + `robots.txt`. It is idempotent — run `node seo-inject.mjs` any time you add a new page.
- **`SITE_URL`** (currently `https://www.jodozofarms.com` — a placeholder) must be set to your real production domain in **both** `seo-inject.mjs` and `js/post.js`, then re-run the injector and redeploy.
- Admin pages (`admin.html`, `login.html`) are `noindex, nofollow` and excluded from the sitemap and robots rules.

## Custom Error Pages

Branded error pages matching the site design live at the root:

| File | Used for |
|---|---|
| **`404.html`** | Page not found — dark hero with quick links back to popular pages. |
| **`500.html`** | Server error. |

Host coverage:

- **GitHub Pages / Netlify / Vercel** — serve the root `404.html` (and `500.html` on Netlify) automatically, no config needed.
- **Apache / cPanel** — the included **`.htaccess`** wires `ErrorDocument 404 /404.html` and `ErrorDocument 500 /500.html`.
- Both pages are `noindex, nofollow` and excluded from `sitemap.xml` (via the skip list in `seo-inject.mjs`).

## Deployment

Upload everything to any static host (Netlify, Vercel, GitHub Pages, cPanel). No server-side requirements.

## Performance & URL strategy

The site was tuned for first-paint speed. These are repeatable scripts in `tools/`
(they need `Pillow`: `python -m pip install Pillow`).

| Script | What it does |
|---|---|
| `optimize-images.py` | Re-encodes every source JPEG (progressive, quality 78, capped at 2000px) and writes WebP variants at 480/768/1200/1600/2000px. |
| `responsive-images.py` | Rewrites each `<img>` into a `<picture>` with a WebP `<source srcset>`, adds `sizes`, real `width`/`height` (kills layout shift) and `loading`/`decoding`/`fetchpriority`. |
| `inject-critical-css.py` | Adds the early `html.js` class and makes the Google Fonts link non-render-blocking. |
| `clean-urls.py` | **Disabled.** Used to rewrite links to extension-free URLs, which 404s on this host. It now exits with an explanation instead of changing anything. |
| `verify.py` | Pre-deploy checks: absolute canonicals, every image has dimensions, reveal fail-safes present, host configs exist. |
| `check-render.py` | Proves the page can never render blank (progressive-enhancement rules). |
| `weight-report.py` | Prints first-paint and full-page weight per viewport vs. the old originals. |

Run order after changing markup: `optimize-images` -> `responsive-images` ->
`inject-critical-css` -> `verify`.

**URL strategy — why links keep `.html`.** The site previously used extension-free
links (`/about`) and relied on `.htaccess` / `_redirects` / `vercel.json` to rewrite
them. The live host reports `Server: LiteSpeed` (shared cPanel): it ignores
`vercel.json` and `_redirects` entirely and does not apply the `mod_rewrite` rules,
so **every clean URL returned 404 while only the homepage appeared to work.**

Every internal link, `canonical`, `og:url` and `sitemap.xml` entry now uses the
real filename form. This resolves correctly on LiteSpeed/cPanel, Vercel, Netlify,
GitHub Pages *and* a plain local file server, so it is host-agnostic. The clean-URL
rules in `.htaccess` are commented out and documented, and `tools/clean-urls.py`
is disabled, so neither can silently reintroduce 404s.

**Share images.** All non-blog pages use `images/og-default.jpg` (a 1200x630
brand card built from the logo, 40 KB) for Facebook / WhatsApp / X / LinkedIn
previews. Blog articles on `post.html` keep their own photo, which `js/post.js`
swaps in at runtime from the post's image. Set via `DEFAULT_OG_IMAGE` in
`seo-inject.mjs`.

**Images.** Every photo is served as WebP at the smallest sensible width. The
homepage hero stacks four slides but only the first is `eager`/`high`; the rest
are `lazy`/`low` so they never compete with the LCP image. Measured cold-load
savings: homepage first paint **7,180 KB -> 341 KB**; an inner page
**4,029 KB -> 1,038 KB**. Originals are kept so any un-updated link still works.

**Never a blank page.** `.reveal` elements are *visible by default* and are only
hidden once the inline `<head>` script sets `html.js`. If JS is off, blocked,
slow or throws, the content still shows. `main.js` adds three further safety
nets (IntersectionObserver timeout, GSAP `try/catch` fallback, and a `load`
handler), and `prefers-reduced-motion` skips the animations entirely. Fonts load
asynchronously so text paints immediately in a system fallback.
