/* ============================================================
   JODOZO FARMS LTD — Admin dashboard logic
   Login, overview stats, posts CRUD, featured projects CRUD
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function esc(s) { return JF.esc(s); }
  function toast(msg, kind) {
    var wrap = $('#toastWrap');
    if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || 'ok');
    t.innerHTML = '<b>' + (kind === 'err' ? 'Error' : 'Saved') + '</b><span>' + esc(msg) + '</span>';
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 400); }, 3200);
  }

  /* ---------- Route guard — sign-in lives on its own page (login.html) ---------- */
  var appView = $('#appView');
  var LOGIN_PAGE = 'login.html';
  function redirectToLogin() { window.location.replace(LOGIN_PAGE); }
  function showApp() {
    if (appView) appView.hidden = false;
    document.body.classList.add('app-mode');
    renderAll();
    setTimeout(function () { toast('Welcome back, Admin.'); }, 450);
  }
  /* Block direct access to the dashboard without a session */
  if (!JF.isLogged()) { redirectToLogin(); }

  /* ---------- View switching ---------- */
  function switchView(name) {
    $$('.side-nav button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === name); });
    $$('.view').forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
    var titles = { overview: 'Overview', posts: 'News &amp; Blog Posts', projects: 'Featured Projects' };
    var t = $('#viewTitle');
    if (t) t.textContent = (titles[name] || 'Overview').replace('&amp;', '&');
    var s = $('#viewSub');
    if (s) s.textContent = name === 'posts' ? 'Add, edit and remove blog posts — they appear on the News page and homepage instantly.'
      : name === 'projects' ? 'Manage the featured project portfolio shown on the homepage and Projects page.'
      : 'A live snapshot of everything published on the Jodozo Farms website.';
    if (window.gsap) gsap.fromTo('.view.active .anim', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .55, stagger: .06, ease: 'power3.out' });
  }
  document.addEventListener('click', function (e) {
    var nav = e.target.closest('.side-nav button');
    if (nav) { switchView(nav.getAttribute('data-view')); return; }
    var jump = e.target.closest('[data-jump]');
    if (jump) { switchView(jump.getAttribute('data-jump')); }
  });

  /* ---------- Overview ---------- */
  function statCard(label, val, sub, cls) {
    return '<div class="stat-card glass anim"><span class="sc-label">' + label + '</span><b class="' + cls + '">' + val + '</b><span class="sc-sub">' + sub + '</span></div>';
  }
  function renderOverview() {
    var posts = JF.getPosts(), projects = JF.getProjects();
    var ongoing = projects.filter(function (p) { return p.status === 'ongoing'; }).length;
    var done = projects.filter(function (p) { return p.status === 'completed'; }).length;
    var planned = projects.filter(function (p) { return p.status === 'planned'; }).length;
    var grid = $('#statGrid');
    if (grid) {
      grid.innerHTML =
        statCard('Total Posts', posts.length, 'Published articles', 'grad-a') +
        statCard('Featured Projects', projects.length, 'In the portfolio', 'grad-b') +
        statCard('Ongoing', ongoing, 'Active on site', 'grad-c') +
        statCard('Completed / Planned', done + ' / ' + planned, 'Portfolio status', 'grad-d');
    }
    var order = ['tips', 'company', 'insights', 'events'], cats = {};
    posts.forEach(function (p) { var k = p.cat || 'company'; cats[k] = (cats[k] || 0) + 1; });
    var max = Math.max.apply(null, order.map(function (k) { return cats[k] || 0; }).concat([1]));
    var chart = $('#catChart');
    if (chart) {
      chart.innerHTML = order.map(function (k) {
        var v = cats[k] || 0;
        return '<div class="bar-row"><span>' + k.charAt(0).toUpperCase() + k.slice(1) + '</span><div class="bar"><i style="width:' + Math.round(v / max * 100) + '%"></i></div><b>' + v + '</b></div>';
      }).join('');
    }
    var rec = $('#recentList');
    if (rec) {
      rec.innerHTML = posts.slice(0, 4).map(function (p) {
        return '<a class="rec" href="#" data-jump="posts"><img src="' + esc(p.img) + '" alt=""><div><b>' + esc(p.title) + '</b><span>Post &middot; ' + esc(p.tag) + ' &middot; ' + esc(p.date) + '</span></div></a>';
      }).join('') + projects.slice(0, 3).map(function (p) {
        return '<a class="rec" href="#" data-jump="projects"><img src="' + esc(p.img) + '" alt=""><div><b>' + esc(p.title) + '</b><span>Project &middot; ' + esc(p.chip) + ' &middot; ' + esc(p.status) + '</span></div></a>';
      }).join('');
    }
  }

  /* ---------- Image upload (stores compressed image as data, upload from your device) ---------- */
  var pendingUploads = {};
  var MAX_DIM = 1200, JPEG_Q = 0.82;

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var url = (window.URL || window.webkitURL).createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          (window.URL || window.webkitURL).revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', JPEG_Q));
        } catch (err) { reject(err); }
      };
      img.onerror = function () { reject(new Error('Could not read that image.')); };
      img.src = url;
    });
  }

  function wireUpload(inputId, previewId, noteId, key) {
    var input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      var note = document.getElementById(noteId);
      if (!file) { pendingUploads[key] = null; return; }
      if (!/^image\//.test(file.type)) {
        if (note) note.textContent = 'That file is not an image — please choose a photo.';
        pendingUploads[key] = null;
        return;
      }
      var prev = document.getElementById(previewId);
      if (prev) prev.src = (window.URL || window.webkitURL).createObjectURL(file);
      if (note) note.textContent = 'Compressing "' + file.name + '"...';
      compressImage(file).then(function (dataUrl) {
        pendingUploads[key] = dataUrl;
        if (prev) prev.src = dataUrl;
        if (note) note.textContent = 'Ready: ' + file.name + ' (compressed, saved with the post).';
      }).catch(function () {
        pendingUploads[key] = null;
        if (note) note.textContent = 'That image could not be read. Please try another photo.';
      });
    });
  }

  /* ---------- Safe storage (localStorage has limited space) ---------- */
  function saveGuarded(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    } catch (e) {
      toast('Storage is full — try a shorter body or a smaller photo.', 'err');
      return false;
    }
  }

  /* ---------- Posts ---------- */
  function renderPosts() {
    var list = $('#postList');
    if (!list) return;
    var q = ($('#postSearch') ? $('#postSearch').value : '').toLowerCase();
    var posts = JF.getPosts().filter(function (p) {
      return !q || (p.title + ' ' + p.tag + ' ' + p.cat).toLowerCase().indexOf(q) > -1;
    });
    if (!posts.length) { list.innerHTML = '<p class="empty">No posts found. Add your first post using the form.</p>'; return; }
    list.innerHTML = posts.map(function (p) {
      return '<article class="row glass anim">' +
        '<img src="' + esc(p.img) + '" alt="">' +
        '<div class="row-main"><b>' + esc(p.title) + '</b>' +
        '<span class="meta"><em>' + esc(p.cat) + '</em>' + esc(p.tag) + ' &middot; ' + esc(p.date) + '</span></div>' +
        '<div class="row-actions"><button class="btn-ghost2" data-edit-post="' + p.id + '">Edit</button>' +
        '<button class="btn-ghost2 btn-danger" data-del-post="' + p.id + '">Delete</button></div></article>';
    }).join('');
  }
  /* ---------- Image library selects ---------- */
  function fillSelect(sel, current) {
    if (!sel) return;
    sel.innerHTML = JF.IMAGES.map(function (f) {
      return '<option value="' + f + '"' + (f === current ? ' selected' : '') + '>' + f + '</option>';
    }).join('');
  }
  function currentPostImage(fallback) {
    if (pendingUploads.post) return pendingUploads.post;
    if (fallback && fallback.indexOf('data:image') === 0) return fallback;
    var sel = $('#pfImg');
    if (sel && sel.value) return 'images/' + sel.value;
    return fallback || 'images/news-1.jpg';
  }
  function savePost(e) {
    e.preventDefault();
    var id = $('#pfId').value, list = JF.getPosts();
    var prev = id ? list.filter(function (p) { return p.id === id; })[0] : null;
    var obj = {
      id: id || JF.uid(),
      title: $('#pfTitle').value.trim(),
      tag: $('#pfTag').value.trim() || 'Company News',
      cat: $('#pfCat').value,
      date: $('#pfDate').value.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      img: currentPostImage(prev ? prev.img : null),
      body: $('#pfBody').value.trim()
    };
    if (!obj.title) { toast('Post title is required.', 'err'); return; }
    var next = list;
    if (id) { next = list.map(function (p) { return p.id === id ? obj : p; }); }
    else { list.unshift(obj); }
    if (!saveGuarded('jf_posts', next)) return;
    resetPostForm(); renderPosts(); renderOverview();
    switchView('posts');
    toast(id ? 'Post updated successfully.' : 'Post published to the website.');
  }
  function resetPostForm() {
    var f = $('#postForm'); if (!f) return;
    f.reset(); $('#pfId').value = '';
    pendingUploads.post = null;
    fillSelect($('#pfImg'), 'news-1.jpg');
    $('#pfBody').value = '';
    var prev = $('#pfPreview'); if (prev) prev.src = 'images/news-1.jpg';
    var note = $('#pfUploadNote'); if (note) note.textContent = 'No file chosen yet. Files are auto-compressed on save. You can also pick from the library below.';
    $('#pfSubmit').innerHTML = 'Publish Post';
    $('#postFormTitle').textContent = 'Add New Post';
  }
  function editPost(id) {
    var p = JF.getPosts().filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    $('#pfId').value = p.id; $('#pfTitle').value = p.title; $('#pfTag').value = p.tag;
    $('#pfCat').value = p.cat; $('#pfDate').value = p.date;
    $('#pfBody').value = p.body || '';
    pendingUploads.post = null;
    var up = $('#pfUpload'); if (up) up.value = '';
    if (p.img && p.img.indexOf('data:image') === 0) { fillSelect($('#pfImg'), 'news-1.jpg'); }
    else { fillSelect($('#pfImg'), p.img.replace('images/', '')); }
    var prev = $('#pfPreview'); if (prev) prev.src = p.img;
    var note = $('#pfUploadNote');
    if (note) note.textContent = (p.img && p.img.indexOf('data:image') === 0)
      ? 'Custom uploaded photo attached — choose a new file to replace it.'
      : 'Using the site image shown. Upload a new photo to replace it.';
    $('#pfSubmit').innerHTML = 'Update Post';
    $('#postFormTitle').textContent = 'Edit Post';
    switchView('posts');
    $('#postForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function deletePost(id) {
    if (!confirm('Delete this post permanently?')) return;
    JF.savePosts(JF.getPosts().filter(function (p) { return p.id !== id; }));
    renderPosts(); renderOverview(); toast('Post deleted.', 'err');
  }

  /* ---------- Featured Projects ---------- */
  function renderProjects() {
    var list = $('#projList');
    if (!list) return;
    var q = ($('#projSearch') ? $('#projSearch').value : '').toLowerCase();
    var projects = JF.getProjects().filter(function (p) {
      return !q || (p.title + ' ' + p.chip + ' ' + p.cat + ' ' + p.status).toLowerCase().indexOf(q) > -1;
    });
    if (!projects.length) { list.innerHTML = '<p class="empty">No projects found. Add your first featured project.</p>'; return; }
    list.innerHTML = projects.map(function (p) {
      return '<article class="row glass anim">' +
        '<img src="' + esc(p.img) + '" alt="">' +
        '<div class="row-main"><b>' + esc(p.title) + '</b>' +
        '<span class="meta"><em>' + esc(p.chip) + '</em>' + esc(p.loc) + ' &middot; ' + esc(p.status) + '</span></div>' +
        '<div class="row-actions"><button class="btn-ghost2" data-edit-proj="' + p.id + '">Edit</button>' +
        '<button class="btn-ghost2 btn-danger" data-del-proj="' + p.id + '">Delete</button></div></article>';
    }).join('');
  }
  function currentProjectImage(fallback) {
    if (pendingUploads.project) return pendingUploads.project;
    if (fallback && fallback.indexOf('data:image') === 0) return fallback;
    var sel = $('#prImg');
    if (sel && sel.value) return 'images/' + sel.value;
    return fallback || 'images/proj-maize.jpg';
  }
  function saveProject(e) {
    e.preventDefault();
    var id = $('#prId').value, list = JF.getProjects();
    var prev = id ? list.filter(function (p) { return p.id === id; })[0] : null;
    var obj = {
      id: id || JF.uid(),
      title: $('#prTitle').value.trim(),
      chip: $('#prChip').value.trim() || 'Project',
      cat: $('#prCat').value,
      loc: $('#prLoc').value.trim() || 'Kaduna State, Nigeria',
      status: $('#prStatus').value,
      img: currentProjectImage(prev ? prev.img : null)
    };
    if (!obj.title) { toast('Project title is required.', 'err'); return; }
    var next = list;
    if (id) { next = list.map(function (p) { return p.id === id ? obj : p; }); }
    else { list.unshift(obj); }
    if (!saveGuarded('jf_projects', next)) return;
    resetProjectForm(); renderProjects(); renderOverview();
    switchView('projects');
    toast(id ? 'Project updated successfully.' : 'Featured project added to the site.');
  }
  function resetProjectForm() {
    var f = $('#projForm'); if (!f) return;
    f.reset(); $('#prId').value = '';
    pendingUploads.project = null;
    fillSelect($('#prImg'), 'proj-maize.jpg');
    var prev = $('#prPreview'); if (prev) prev.src = 'images/proj-maize.jpg';
    var note = $('#prUploadNote'); if (note) note.textContent = 'No file chosen yet. Files are auto-compressed on save. Or pick a site photo below.';
    $('#prSubmit').innerHTML = 'Add Featured Project';
    $('#projFormTitle').textContent = 'Add Featured Project';
  }
  function editProject(id) {
    var p = JF.getProjects().filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    $('#prId').value = p.id; $('#prTitle').value = p.title; $('#prChip').value = p.chip;
    $('#prCat').value = p.cat; $('#prLoc').value = p.loc; $('#prStatus').value = p.status;
    pendingUploads.project = null;
    var up = $('#prUpload'); if (up) up.value = '';
    if (p.img && p.img.indexOf('data:image') === 0) { fillSelect($('#prImg'), 'proj-maize.jpg'); }
    else { fillSelect($('#prImg'), p.img.replace('images/', '')); }
    var prev = $('#prPreview'); if (prev) prev.src = p.img;
    var note = $('#prUploadNote');
    if (note) note.textContent = (p.img && p.img.indexOf('data:image') === 0)
      ? 'Custom uploaded photo attached — choose a new file to replace it.'
      : 'Using the site image shown. Upload a new photo to replace it.';
    $('#prSubmit').innerHTML = 'Update Project';
    $('#projFormTitle').textContent = 'Edit Project';
    switchView('projects');
    $('#projForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function deleteProject(id) {
    if (!confirm('Delete this featured project permanently?')) return;
    JF.saveProjects(JF.getProjects().filter(function (p) { return p.id !== id; }));
    renderProjects(); renderOverview(); toast('Project deleted.', 'err');
  }

  /* ---------- Event delegation ---------- */
  document.addEventListener('click', function (e) {
    var ep = e.target.closest('[data-edit-post]'); if (ep) { editPost(ep.getAttribute('data-edit-post')); return; }
    var dp = e.target.closest('[data-del-post]'); if (dp) { deletePost(dp.getAttribute('data-del-post')); return; }
    var ej = e.target.closest('[data-edit-proj]'); if (ej) { editProject(ej.getAttribute('data-edit-proj')); return; }
    var dj = e.target.closest('[data-del-proj]'); if (dj) { deleteProject(dj.getAttribute('data-del-proj')); return; }
  });

  function renderAll() { renderOverview(); renderPosts(); renderProjects(); }

  /* ---------- Init ---------- */
  function init() {
    var postForm = $('#postForm'); if (postForm) postForm.addEventListener('submit', savePost);
    var projForm = $('#projForm'); if (projForm) projForm.addEventListener('submit', saveProject);
    var cp = $('#pfCancel'); if (cp) cp.addEventListener('click', resetPostForm);
    var cj = $('#prCancel'); if (cj) cj.addEventListener('click', resetProjectForm);

    var i1 = $('#pfImg');
    if (i1) { fillSelect(i1, 'news-1.jpg'); i1.addEventListener('change', function () { if (!pendingUploads.post) { $('#pfPreview').src = 'images/' + i1.value; } }); }
    var i2 = $('#prImg');
    if (i2) { fillSelect(i2, 'proj-maize.jpg'); i2.addEventListener('change', function () { if (!pendingUploads.project) { $('#prPreview').src = 'images/' + i2.value; } }); }
    wireUpload('pfUpload', 'pfPreview', 'pfUploadNote', 'post');
    wireUpload('prUpload', 'prPreview', 'prUploadNote', 'project');

    var s1 = $('#postSearch'); if (s1) s1.addEventListener('input', renderPosts);
    var s2 = $('#projSearch'); if (s2) s2.addEventListener('input', renderProjects);
    var out = $('#logoutBtn');
    if (out) out.addEventListener('click', function () {
      JF.logout();
      window.location.href = LOGIN_PAGE;
    });

    if (JF.isLogged()) { showApp(); } else { redirectToLogin(); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();