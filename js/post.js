/* ============================================================
   JODOZO FARMS LTD — Post detail page
   Reads ?id= from the URL and paints the matching post.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return JF.esc(s); }
  function get(id) { return document.getElementById(id); }

  var SITE_URL = 'https://www.jodozofarms.com'; /* keep in sync with seo-inject.mjs */

  function setMeta(attr, key, content) {
    var m = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (m) m.setAttribute('content', content);
  }
  function absImg(src) { return String(src).indexOf('http') === 0 ? src : SITE_URL + '/' + src; }

  /* Keep title / description / Open Graph / canonical / Article JSON-LD in sync with the painted post */
  function updateSeo(post) {
    var desc = (post.body || '').replace(/\s+/g, ' ').trim() || post.title;
    if (desc.length > 155) desc = desc.slice(0, 152).replace(/\s+\S*$/, '') + '...';
    var url = SITE_URL + '/post.html?id=' + encodeURIComponent(post.id);
    var img = absImg(post.img);
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', post.title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', post.title);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
    var canon = document.head.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', url);
    var ld = get('postJsonLd');
    if (ld) ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: post.title,
      image: [img],
      datePublished: post.date, dateModified: post.date,
      author: { '@type': 'Organization', name: 'Jodozo Farms Ltd' },
      publisher: { '@type': 'Organization', name: 'Jodozo Farms Ltd', logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.png' } },
      description: desc,
      mainEntityOfPage: url
    });
  }

  function fill(post, posts) {
    document.title = post.title + ' — Jodozo Farms Ltd';
    updateSeo(post);
    get('postHeroBg').src = post.img;
    get('postHeroBg').alt = post.title;
    get('postHeroChip').textContent = post.tag || 'Article';
    get('postHeroTitle').textContent = post.title;
    get('postHeroDate').textContent = (post.tag || 'Article') + '  •  ' + post.date;
    var im = get('postImg');
    im.src = post.img; im.alt = post.title;
    var raw = (post.body || '').trim() || 'Full story coming soon. Our team is preparing the complete article for this post.';
    var parts = raw.split(/\n\s*\n/).filter(function (p) { return p.trim(); });
    get('postBody').innerHTML = parts.map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
    var rel = get('postRelated');
    var others = posts.filter(function (p) { return p.id !== post.id; }).slice(0, 3);
    if (others.length) {
      rel.innerHTML = others.map(function (p) {
        return '<a class="rel-card" href="/post.html?id=' + encodeURIComponent(p.id) + '">' +
          '<img src="' + esc(p.img) + '" alt="">' +
          '<div><b>' + esc(p.title) + '</b><span style="font-size:12px;color:var(--muted)">' + esc(p.date) + '</span></div></a>';
      }).join('');
    } else {
      rel.innerHTML = '<p style="font-size:13.5px;color:var(--muted)">More stories are on the way.</p>';
    }
  }

  function paint() {
    var posts = JF.getPosts();
    if (!posts.length) return;
    var q = '';
    try { q = new URLSearchParams(window.location.search || '').get('id'); } catch (e) {}
    var post = null;
    for (var i = 0; i < posts.length; i++) { if (posts[i].id === q) { post = posts[i]; break; } }
    if (!post) {
      try {
        var h = window.location.hash || '';
        if (h.indexOf('post-') === 1) {
          var hid = h.slice(6);
          for (var j = 0; j < posts.length; j++) { if (posts[j].id === hid) { post = posts[j]; break; } }
        }
      } catch (e) {}
    }
    fill(post || posts[0], posts);
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', paint); } else { paint(); }
})();