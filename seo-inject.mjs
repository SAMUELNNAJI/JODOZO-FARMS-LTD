/* ============================================================
   JODOZO FARMS LTD — SEO injector
   One-time (re-runnable, idempotent) tool that adds to every
   public page: canonical, Open Graph, Twitter cards, theme-color,
   and to index.html a static Organization + WebSite JSON-LD, and
   to post.html an Article JSON-LD placeholder. Also generates
   sitemap.xml and robots.txt from the same page list.
   Run:  node seo-inject.mjs
   NOTE: set SITE_URL to the real production domain before deploying.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const SITE_URL = 'https://www.jodozofarms.com';   // <-- production domain (no trailing slash)
const SITE_NAME = 'Jodozo Farms Ltd';
const DEFAULT_OG_IMAGE = 'images/hero-1.jpg';
const SKIP = ['admin.html', 'login.html', 'admin_login.html', '404.html', '500.html', 'seo-inject.mjs'];
const OG_IMAGE_OVERRIDES = { 'news.html': 'images/news-1.jpg', 'projects.html': 'images/proj-maize.jpg' };

/* ---------- helpers ---------- */
function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function extract(re, html) {
  const m = html.match(re);
  return m ? m[1] : '';
}
function pageTitle(html) { return decodeEntities(extract(/<title>([\s\S]*?)<\/title>/i, html)).trim(); }
function pageDesc(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([\s\S]*?)">/i);
  return m ? decodeEntities(m[1]).trim() : '';
}
/* Clean URLs: the site is served at /about, not /about.html. Files on disk
   keep the .html extension, but every generated URL drops it. */
function cleanSlug(file) { return file.replace(/\.html$/i, ''); }
function canonicalFor(file) { return file === 'index.html' ? SITE_URL + '/' : SITE_URL + '/' + cleanSlug(file); }

/* ---------- page list ---------- */
const pages = readdirSync('.')
  .filter(f => f.endsWith('.html') && !SKIP.includes(f))
  .sort();

let injected = 0, skipped = 0;

for (const file of pages) {
  let html = readFileSync(file, 'utf8');
  const EOL = html.includes('\r\n') ? '\r\n' : '\n';

  /* Idempotency: never inject twice */
  if (html.includes('property="og:title"')) { skipped++; continue; }

  const title = pageTitle(html);
  const desc = pageDesc(html);
  if (!title || !desc) { console.warn('  ! skipped (no title/description):', file); skipped++; continue; }

  const url = canonicalFor(file);
  const img = SITE_URL + '/' + (OG_IMAGE_OVERRIDES[file] || DEFAULT_OG_IMAGE);
  const ogType = file === 'post.html' ? 'article' : 'website';
  const T = escapeAttr(title), D = escapeAttr(desc);

  const block = [
    '<meta name="theme-color" content="#0d3b21">',
    '<link rel="canonical" href="' + url + '">',
    '<meta property="og:site_name" content="' + SITE_NAME + '">',
    '<meta property="og:type" content="' + ogType + '">',
    '<meta property="og:title" content="' + T + '">',
    '<meta property="og:description" content="' + D + '">',
    '<meta property="og:url" content="' + url + '">',
    '<meta property="og:image" content="' + img + '">',
    '<meta property="og:image:alt" content="' + T + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + T + '">',
    '<meta name="twitter:description" content="' + D + '">',
    '<meta name="twitter:image" content="' + img + '">'
  ].join(EOL);

  /* Insert right after the existing meta description line */
  const descLine = html.match(/<meta\s+name="description"\s+content="[\s\S]*?">/i);
  if (!descLine) { console.warn('  ! skipped (no description tag):', file); skipped++; continue; }
  html = html.replace(descLine[0], descLine[0] + EOL + block);
  html = finishPage(file, html, EOL);

  writeFileSync(file, html);
  injected++;
  console.log('  + injected:', file);
}

finishFeeds(pages, EOL_DEFAULT());

function EOL_DEFAULT() { return '\r\n'; }

/* ---------- per-page JSON-LD additions ---------- */
function finishPage(file, html, EOL) {
  /* index.html — static Organization + WebSite structured data */
  if (file === 'index.html') {
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization', '@id': SITE_URL + '/#organization',
          name: SITE_NAME, url: SITE_URL + '/',
          logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.png' },
          description: 'An integrated agriculture, agro-processing and agro-allied enterprise in Kaduna, Nigeria.',
          address: { '@type': 'PostalAddress', addressLocality: 'Kaduna', addressRegion: 'Kaduna State', addressCountry: 'NG' }
        },
        {
          '@type': 'WebSite', '@id': SITE_URL + '/#website',
          url: SITE_URL + '/', name: SITE_NAME,
          publisher: { '@id': SITE_URL + '/#organization' }, inLanguage: 'en'
        }
      ]
    };
    const ldTag = EOL + '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>';
    html = html.replace('</head>', ldTag + EOL + '</head>');
  }

  /* post.html — Article JSON-LD placeholder, filled dynamically by js/post.js */
  if (file === 'post.html') {
    const ldTag = EOL + '<script type="application/ld+json" id="postJsonLd">{"@context":"https://schema.org","@type":"Article"}</script>';
    html = html.replace('</head>', ldTag + EOL + '</head>');
  }
  return html;
}

/* ---------- sitemap.xml + robots.txt ---------- */
function finishFeeds(pages, EOL) {
  const today = new Date().toISOString().slice(0, 10);
  const sitemapPages = pages.filter(f => f !== 'post.html'); // dynamic detail pages can't be listed
  const mainPages = ['about.html', 'agribusiness.html', 'agro-processing.html', 'services.html', 'projects.html', 'news.html', 'contact.html', 'partnerships.html'];
  const urls = sitemapPages.map(f => {
    const isHome = f === 'index.html';
    const priority = isHome ? '1.0' : mainPages.includes(f) ? '0.8' : '0.7';
    return '  <url>' + EOL +
      '    <loc>' + canonicalFor(f) + '</loc>' + EOL +
      '    <lastmod>' + today + '</lastmod>' + EOL +
      '    <changefreq>monthly</changefreq>' + EOL +
      '    <priority>' + priority + '</priority>' + EOL +
      '  </url>';
  }).join(EOL);
  writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>' + EOL +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + EOL + urls + EOL + '</urlset>' + EOL);
  console.log('  + sitemap.xml written (' + sitemapPages.length + ' pages)');

  writeFileSync('robots.txt',
    'User-agent: *' + EOL +
    'Allow: /' + EOL +
    'Disallow: /admin.html' + EOL +
    'Disallow: /login.html' + EOL + EOL +
    'Sitemap: ' + SITE_URL + '/sitemap.xml' + EOL);
  console.log('  + robots.txt written');

  console.log('Done. Site URL: ' + SITE_URL);
}

