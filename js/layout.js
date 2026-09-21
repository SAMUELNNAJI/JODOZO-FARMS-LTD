/* ============================================================
   JODOZO FARMS LTD — Shared layout (header / footer / floats)
   Injected on every page. Behaviours live in main.js
   ============================================================ */
const HEADER_HTML = `
<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="Jodozo Farms Ltd — Home">
      <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 6.6 8.4 3 4 3c0 4.4 3.6 8 8 8z"/><path d="M12 13c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z"/></svg></span>
      <span class="brand-text"><strong>JODOZO</strong><span>FARMS LTD</span></span>
    </a>
    <nav class="main-nav" id="mainNav" aria-label="Main navigation">
      <ul class="nav-list">
        <li class="has-drop">
          <a href="about.html" data-nav="about">About <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></a>
          <div class="drop">
            <a href="about.html#profile">Company Profile</a>
            <a href="about.html#vision">Vision &amp; Mission</a>
            <a href="about.html#values">Our Core Values</a>
            <a href="about.html#objectives">Our Objectives</a>
            <a href="about.html#why">Why Jodozo Farms</a>
          </div>
        </li>
        <li class="has-drop">
          <a href="agribusiness.html" data-nav="agribusiness">Agribusiness <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></a>
          <div class="drop wide">
            <a href="crop-production.html">Crop Production</a>
            <a href="livestock-farming.html">Livestock Farming</a>
            <a href="poultry-farming.html">Poultry Farming</a>
            <a href="dairy-farming.html">Dairy Farming</a>
            <a href="fisheries.html">Fisheries</a>
            <a href="beekeeping.html">Beekeeping</a>
            <a href="fruit-farming.html">Fruit Farming</a>
            <a href="cereal-farming.html">Cereal Farming</a>
            <a href="plantations.html">Plantation Agriculture</a>
          </div>
        </li>
        <li><a href="agro-processing.html" data-nav="agro-processing">Agro-Processing</a></li>
        <li class="has-drop">
          <a href="services.html" data-nav="services">Services <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></a>
          <div class="drop wide">
            <a href="mechanised-farming.html">Mechanised Farming</a>
            <a href="farm-academy.html">Jodozo Farm Academy</a>
            <a href="services.html#empowerment">Farmer Empowerment</a>
            <a href="consultancy.html">Agricultural Consultancy</a>
            <a href="equipment.html">Equipment &amp; Machinery</a>
            <a href="water-irrigation.html">Water &amp; Irrigation</a>
            <a href="agricultural-inputs.html">Agricultural Inputs</a>
            <a href="trade-distribution.html">Trade &amp; Distribution</a>
          </div>
        </li>
        <li><a href="projects.html" data-nav="projects">Projects</a></li>
        <li class="has-drop">
          <a href="partnerships.html" data-nav="partnerships">Partnerships <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></a>
          <div class="drop">
            <a href="partnerships.html#investors">Investment Opportunities</a>
            <a href="partnerships.html#outgrowers">Farmers &amp; Outgrowers</a>
            <a href="partnerships.html#suppliers">Suppliers</a>
            <a href="partnerships.html#distributors">Distributors</a>
          </div>
        </li>
        <li><a href="news.html" data-nav="news">News</a></li>
        <li><a href="contact.html" data-nav="contact">Contact</a></li>
      </ul>
    </nav>
    <div class="header-cta">
      <a class="btn btn-primary btn-sm" href="contact.html?form=quote">Get a Quote</a>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container">
    <div class="foot-grid">
      <div class="f-brand">
        <a class="brand" href="index.html" aria-label="Jodozo Farms Ltd — Home">
          <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 6.6 8.4 3 4 3c0 4.4 3.6 8 8 8z"/><path d="M12 13c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z"/></svg></span>
          <span class="brand-text"><strong>JODOZO</strong><span>FARMS LTD</span></span>
        </a>
        <p>Growing Agriculture. Processing Opportunities. Building Sustainable Communities — from our farms to your table.</p>
        <div class="socials">
          <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5h2.5V5.5H14A3.5 3.5 0 0 0 10.5 9v2H8v3h2.5v6h3v-6H16l.5-3h-3V9a1 1 0 0 1 .5-.5z"/></svg></a>
          <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.4 8.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM4.9 10h3v9.5h-3zM10 10h2.8v1.3a3.1 3.1 0 0 1 2.7-1.5c2.4 0 3.6 1.5 3.6 4.2v5.5h-3v-5c0-1.3-.5-2.1-1.6-2.1s-1.6.8-1.6 2.1v5H10z"/></svg></a>
          <a href="#" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h4l4 5.5L17.5 4H20l-6 7.5L20.5 20h-4l-4.3-6L8 20H5.5l6-7.5z"/></svg></a>
        </div>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul class="f-links">
          <li><a href="about.html">About Jodozo</a></li>
          <li><a href="agribusiness.html">Our Agribusiness</a></li>
          <li><a href="projects.html">Projects</a></li>
          <li><a href="news.html">News &amp; Resources</a></li>
          <li><a href="contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4>Our Services</h4>
        <ul class="f-links">
          <li><a href="agribusiness.html">Farming</a></li>
          <li><a href="agro-processing.html">Agro-Processing</a></li>
          <li><a href="agricultural-inputs.html">Agricultural Inputs</a></li>
          <li><a href="mechanised-farming.html">Mechanised Farming</a></li>
          <li><a href="equipment.html">Equipment &amp; Machinery</a></li>
          <li><a href="water-irrigation.html">Water &amp; Irrigation</a></li>
          <li><a href="farm-academy.html">Farm Academy</a></li>
        </ul>
      </div>
      <div>
        <h4>Business</h4>
        <ul class="f-links">
          <li><a href="partnerships.html">Partner With Us</a></li>
          <li><a href="partnerships.html#distributors">Become a Distributor</a></li>
          <li><a href="partnerships.html#outgrowers">Outgrower Programme</a></li>
          <li><a href="contact.html?form=quote">Request a Quote</a></li>
          <li><a href="partnerships.html#investors">Investment Opportunities</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul class="f-contact">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg><span>Km 4, Jodozo Road, Kaduna Expressway, Nigeria</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/></svg><a href="tel:+2348234526487">+234 823 452 6487</a></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l2-4.9a8.4 8.4 0 1 1 16-4.6z"/></svg><a href="https://wa.me/2348234526487">WhatsApp: +234 823 452 6487</a></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><a href="mailto:info@jodozofarms.com">info@jodozofarms.com</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; <span id="year">2026</span> Jodozo Farms Ltd. All rights reserved.<a class="admin-key" href="admin.html" tabindex="-1" aria-hidden="true" title="">.</a></span>
      <span class="tags">Sustainable Farming &nbsp;|&nbsp; Food Security &nbsp;|&nbsp; Community Development</span>
    </div>
  </div>
</footer>`;

const FLOAT_HTML = `
<a class="wa-float" href="https://wa.me/2348234526487" target="_blank" rel="noopener" aria-label="Chat with Jodozo Farms on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.25-.13-1.48-.73-1.7-.81-.23-.09-.4-.13-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.34.08-.17.04-.31-.02-.44-.06-.13-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.4.52.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29z"/></svg>
</a>
<button class="to-top" id="toTop" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button>`;

/* ---------- Inject layout ---------- */
(function () {
  var ph = document.getElementById('site-header');
  if (ph) ph.outerHTML = HEADER_HTML;
  var pf = document.getElementById('site-footer');
  if (pf) pf.outerHTML = FOOTER_HTML;
  document.body.insertAdjacentHTML('beforeend', FLOAT_HTML);

  /* Active navigation state */
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!file || file.indexOf('.html') === -1) file = 'index.html';
  var map = {
    'index.html': 'home', 'about.html': 'about',
    'agribusiness.html': 'agribusiness', 'crop-production.html': 'agribusiness',
    'livestock-farming.html': 'agribusiness', 'poultry-farming.html': 'agribusiness',
    'dairy-farming.html': 'agribusiness', 'fisheries.html': 'agribusiness',
    'beekeeping.html': 'agribusiness', 'fruit-farming.html': 'agribusiness',
    'cereal-farming.html': 'agribusiness', 'plantations.html': 'agribusiness',
    'agro-processing.html': 'agro-processing',
    'services.html': 'services', 'mechanised-farming.html': 'services',
    'farm-academy.html': 'services', 'consultancy.html': 'services',
    'equipment.html': 'services', 'water-irrigation.html': 'services',
    'agricultural-inputs.html': 'services', 'trade-distribution.html': 'services',
    'projects.html': 'projects', 'partnerships.html': 'partnerships',
    'news.html': 'news', 'contact.html': 'contact'
  };
  var key = map[file];
  if (key) {
    var link = document.querySelector('.nav-list a[data-nav="' + key + '"]');
    if (link) link.classList.add('active');
  }
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Hidden admin access — Ctrl + Shift + A, or the invisible footer dot */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      window.location.href = 'admin.html';
    }
  });
})();

