/* ============================================================
   JODOZO FARMS LTD — Data store + public renderers
   Posts & Featured Projects are stored in localStorage and
   rendered with JavaScript. Seeded from the original content.
   ============================================================ */
var JF = (function () {
  'use strict';
  var PKEY = 'jf_posts', SKEY = 'jf_projects', AKEY = 'jf_admin_session';

  /* ---------- Seed data (matches the original site content) ---------- */
  var SEED_POSTS = [
    { id: 'p1', title: '5 Tips for Higher Crop Yields This Season', tag: 'Farming Tips', cat: 'tips', date: 'Aug 20, 2025', img: 'images/news-1.jpg',
      body: 'Across our Kaduna fields, the difference between an average harvest and a great one usually comes down to five decisions made before the rains settle.\n\nStart with certified seed suited to your soil, plant early within the first good rains, and give every stand enough space to breathe. Feed the crop on time — a split application of fertilizer beats one heavy dose — and scout your fields every week so pests and weeds never get ahead of you.\n\nThese are the same practices we teach at the Jodozo Farm Academy, and our outgrowers using them have reported visibly fuller cobs, season after season.' },
    { id: 'p2', title: 'Jodozo Farms Partners with Local Farmers', tag: 'Partnership', cat: 'company', date: 'Aug 15, 2025', img: 'images/news-2.jpg',
      body: 'We are proud to welcome a new wave of smallholder farmers into the Jodozo outgrower family across Kaduna State.\n\nUnder the partnership, each farmer receives certified inputs on flexible terms, free hands-on training at the Jodozo Farm Academy, and — most importantly — a guaranteed buyer for their harvest at transparent, market-linked prices.\n\nWhen farmers know their market before they plant, they invest with confidence. That is how rural incomes grow, and how we secure the raw materials our processing lines need.' },
    { id: 'p3', title: 'New Processing Plant Set to Boost Local Economy', tag: 'Agribusiness', cat: 'insights', date: 'Aug 10, 2025', img: 'images/news-3.jpg',
      body: 'Our new crop processing plant is now fully operational — and it changes the economics of farming for everyone around it.\n\nInstead of selling raw harvests at giveaway prices, farmers in our network can now have their maize, cassava and soybeans milled, dried and packaged right here in Kaduna. Less post-harvest loss, more value captured locally, and new jobs for youths in processing and logistics.\n\nThe plant also anchors our export pipeline: graded, properly packaged Nigerian produce ready for regional and international buyers.' },
    { id: 'p4', title: 'Farm Academy Opens Applications for Q4 Cohort', tag: 'Academy', cat: 'events', date: 'Aug 05, 2025', img: 'images/proj-academy.jpg',
      body: 'Applications are now open for the next cohort of the Jodozo Farm Academy — our practical, hands-on training school for rural and youth farmers.\n\nCourses cover crop production, mechanised farming, livestock and poultry management, agro-processing and agribusiness finance. Every lesson happens on a working farm, not in a classroom, and graduates leave with a starter plan plus linkage to inputs and guaranteed markets.\n\nOver 1,200 farmers have trained with us so far, and 70% of participants are women and young people. Come and learn on a real working farm.' },
    { id: 'p5', title: 'Why Dry-Season Farming Is the Future of Nigerian Agriculture', tag: 'Irrigation', cat: 'insights', date: 'Jul 28, 2025', img: 'images/news-4.jpg',
      body: 'Nigeria farms one season a year and imports food for the other eleven months. That equation changes the moment farmers can farm the dry season.\n\nWith our dams, boreholes and drip systems, Jodozo farms 365 days a year — and dry-season harvests consistently earn premium prices because supply is scarce. A hectare under drip irrigation can outperform three rainfed hectares.\n\nFrom farm ponds to centre pivots, our water and irrigation team designs systems that pay for themselves. The future of Nigerian agriculture is not more land; it is more water per land.' },
    { id: 'p6', title: 'Biosecurity Basics Every Poultry Farmer Should Know', tag: 'Farming Tips', cat: 'tips', date: 'Jul 20, 2025', img: 'images/news-5.jpg',
      body: 'Disease — not feed — is the biggest killer of profit on Nigerian poultry farms. The good news: most outbreaks are preventable with simple biosecurity discipline.\n\nControl who and what enters your pens: a footbath at every door, dedicated boots and overalls, and a strict quarantine for every new bird. Keep wild birds away from feed and water, vaccinate on schedule, and never share equipment between farms without disinfecting.\n\nOur layer and hatchery complex runs these protocols daily. Farmers who adopt them see mortality fall and margins rise — healthy birds simply pay better.' }
  ];
  var SEED_PROJECTS = [
    { id: 'pr1', title: 'Maize Estate Project', chip: 'Crop Farms', cat: 'crops', loc: 'Kaduna State, Nigeria', status: 'ongoing', img: 'images/proj-maize.jpg' },
    { id: 'pr2', title: 'Cattle Ranch & Feedlot', chip: 'Livestock', cat: 'livestock', loc: 'Kaduna State, Nigeria', status: 'ongoing', img: 'images/proj-cattle.jpg' },
    { id: 'pr3', title: 'Catfish & Tilapia Ponds', chip: 'Fisheries', cat: 'fisheries', loc: 'Kaduna State, Nigeria', status: 'ongoing', img: 'images/proj-fish.jpg' },
    { id: 'pr4', title: 'Crop Processing Plant', chip: 'Agro-Processing', cat: 'processing', loc: 'Kaduna State, Nigeria', status: 'completed', img: 'images/proj-processing.jpg' },
    { id: 'pr5', title: 'Layer & Hatchery Complex', chip: 'Poultry', cat: 'poultry', loc: 'Kaduna State, Nigeria', status: 'ongoing', img: 'images/proj-poultry.jpg' },
    { id: 'pr6', title: 'Mango Plantation Development', chip: 'Plantations', cat: 'plantations', loc: 'Kaduna State, Nigeria', status: 'planned', img: 'images/proj-plantation.jpg' },
    { id: 'pr7', title: 'Farm Irrigation Scheme', chip: 'Water & Irrigation', cat: 'water', loc: 'Kaduna State, Nigeria', status: 'ongoing', img: 'images/svc-water.jpg' },
    { id: 'pr8', title: 'Packaged Water Facility', chip: 'Water Projects', cat: 'water', loc: 'Kaduna State, Nigeria', status: 'completed', img: 'images/water-bottle.jpg' },
    { id: 'pr9', title: 'Rural Farmers Empowerment Programme', chip: 'Rural Development', cat: 'rural', loc: 'Communities Across Kaduna', status: 'ongoing', img: 'images/proj-academy.jpg' }
  ];

  /* Seed version — bump to push fresh seed data to browsers that already stored an older set */
  var SEEDV = 'jf_seed_v', V = '4';
  try {
    if (localStorage.getItem(SEEDV) !== V) {
      localStorage.setItem('jf_posts', JSON.stringify(SEED_POSTS));
      localStorage.setItem('jf_projects', JSON.stringify(SEED_PROJECTS));
      localStorage.setItem(SEEDV, V);
    }
  } catch (e) {}

  var IMAGE_LIBRARY = ['proj-maize.jpg','proj-cattle.jpg','proj-fish.jpg','proj-processing.jpg','proj-poultry.jpg','proj-plantation.jpg','proj-academy.jpg','svc-water.jpg','water-bottle.jpg','news-1.jpg','news-2.jpg','news-3.jpg','news-4.jpg','news-5.jpg','svc-crop.jpg','svc-livestock.jpg','svc-poultry.jpg','svc-fisheries.jpg','svc-processing.jpg','svc-mechanised.jpg','svc-equipment.jpg','feat-inputs.jpg','feat-equipment.jpg','feat-water.jpg','hero-1.jpg','hero-2.jpg','hero-3.jpg','hero-4.jpg','dairy.jpg','fruits.jpg','bee.jpg','cereal.jpg','greenhouse.jpg','market.jpg','export.jpg','consult.jpg','seeds.jpg','partner-main.jpg','partner-alt.jpg','academy-2.jpg'];

  function read(key, seed) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) { var v = JSON.parse(raw); if (v && v.length !== undefined) return v; }
    } catch (e) {}
    localStorage.setItem(key, JSON.stringify(seed));
    return seed.slice();
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  return {
    ADMIN_EMAIL: 'Admin@gmail.com',
    ADMIN_PASS: 'Admin@1122',
    IMAGES: IMAGE_LIBRARY,
    getPosts: function () { return read(PKEY, SEED_POSTS); },
    savePosts: function (list) { write(PKEY, list); },
    getProjects: function () { return read(SKEY, SEED_PROJECTS); },
    saveProjects: function (list) { write(SKEY, list); },
    uid: function () { return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    login: function (email, pass) {
      if (email.toLowerCase() === this.ADMIN_EMAIL.toLowerCase() && pass === this.ADMIN_PASS) {
        localStorage.setItem(AKEY, '1'); return true;
      }
      return false;
    },
    isLogged: function () { return localStorage.getItem(AKEY) === '1'; },
    logout: function () { localStorage.removeItem(AKEY); },

    /* ---------- Public page renderers ---------- */
    esc: function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; },
    renderPosts: function (mount, limit) {
      if (!mount) return;
      var posts = this.getPosts();
      if (limit) posts = posts.slice(0, limit);
      var self = this;
      mount.innerHTML = '';
      posts.forEach(function (p, i) {
        var a = document.createElement('a');
        a.className = 'news-card reveal' + (i % 3 ? ' d' + (i % 3) : '');
        a.href = '/post.html?id=' + encodeURIComponent(p.id); a.setAttribute('data-cat', p.cat || 'company');
        a.innerHTML =
          '<div class="news-img"><img src="' + self.esc(p.img) + '" alt="' + self.esc(p.title) + '" loading="lazy"><span class="chip">' + self.esc(p.tag) + '</span></div>' +
          '<div class="news-body"><div class="news-meta"><span class="news-tag">' + self.esc(p.tag) + '</span><span>' + self.esc(p.date) + '</span></div>' +
          '<h3>' + self.esc(p.title) + '</h3>' +
          '<span class="news-link">Read Article <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span></div>';
        mount.appendChild(a);
      });
    },
    renderProjects: function (mount, limit) {
      if (!mount) return;
      var projects = this.getProjects();
      if (limit) projects = projects.slice(0, limit);
      var self = this;
      var pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
      mount.innerHTML = '';
      projects.forEach(function (p, i) {
        var a = document.createElement('a');
        a.className = 'proj-card reveal' + (i % 3 ? ' d' + (i % 3) : '');
        a.href = '/projects.html'; a.setAttribute('data-cat', p.cat || 'crops');
        a.innerHTML =
          '<div class="proj-img"><img src="' + self.esc(p.img) + '" alt="' + self.esc(p.title) + '" loading="lazy"><span class="chip">' + self.esc(p.chip) + '</span></div>' +
          '<div class="proj-body"><h3>' + self.esc(p.title) + '</h3>' +
          '<span class="proj-loc">' + pin + self.esc(p.loc) + '</span><br>' +
          '<span class="status ' + self.esc(p.status) + '">' + (p.status === 'ongoing' ? 'Ongoing' : p.status === 'completed' ? 'Completed' : 'Planned') + '</span></div>';
        mount.appendChild(a);
      });
    }
  };
})();

/* Auto-render any mount points present on the current page (defer scripts run after DOM parse) */
(function () {
  document.querySelectorAll('[data-render="posts"]').forEach(function (m) { JF.renderPosts(m, m.getAttribute('data-limit') ? parseInt(m.getAttribute('data-limit'), 10) : null); });
  document.querySelectorAll('[data-render="projects"]').forEach(function (m) { JF.renderProjects(m, m.getAttribute('data-limit') ? parseInt(m.getAttribute('data-limit'), 10) : null); });
})();
