# JODOZO FARMS LTD — Corporate Website

An integrated agriculture, agro-processing and agro-allied enterprise website, built from the company's registered objects and the approved homepage design mockup.

**Positioning:** *JODOZO FARMS LTD — An Integrated Agriculture, Agro-Processing and Agro-Allied Enterprise.*

## Quick Start

No build step required — it's a pure static site.

1. Open `index.html` in any modern browser, **or**
2. Serve locally: `python -m http.server 8000` → http://localhost:8000 (or use the VS Code Live Server extension)

> Note: the shared header/footer are injected by `js/layout.js`, so serving over HTTP (or opening files directly in a browser with JS enabled) both work fine.

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
- **Forms** currently simulate submission in the browser. To make them live, connect `form[data-form]` in `contact.html` / `news.html` to your backend, Formspree, Netlify Forms or a mailto handler.
- **Images** live in `/images` (sourced from Unsplash). Replace with real company photography when available — keep the same file names to avoid code changes.
- **Map** on the Contact page is a Google Maps embed; update the `iframe src` with the exact farm coordinates.

## Design System

- Fonts: Poppins (headings) + Inter (body) via Google Fonts
- Colours: forest-green palette (`--g950 #082615` … `--g500 #22c55e`), soft off-white sections
- All styling in `css/styles.css` (cards, buttons, hero, value chain, partner band, forms, tabs, responsive breakpoints at 1080/900/640px)

## Deployment

Upload everything to any static host (Netlify, Vercel, GitHub Pages, cPanel). No server-side requirements.
