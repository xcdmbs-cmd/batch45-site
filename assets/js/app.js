/* ============================================================
   B45 — CHEMICAL ENGINEERING · BATCH 45 | University of Gezira
   Shared application script (header/footer, auth gate, helpers)
   ============================================================ */
(function () {
  'use strict';

  const B45 = window.B45 = {
    config: null,
    authed: false,
    _resolved: false,
    _queue: []
  };

  /* ---------------- helpers ---------------- */
  B45.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  B45.loadJSON = async function (path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + path);
    return res.json();
  };

  B45.fmtDate = function (iso) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) { return iso || ''; }
  };

  B45.fmtShort = function (iso) {
    try {
      const d = new Date(iso);
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      return { d: d.getDate(), m: months[d.getMonth()], y: d.getFullYear() };
    } catch (e) { return { d: '', m: '', y: '' }; }
  };

  B45.fmtTime = function (t) { return t ? String(t).replace(/-/g, ':') : ''; };

  B45.badgeClass = function (cat) {
    const map = {
      'إعلان': 'badge--gold', 'أكاديمي': 'badge--navy', 'فعالية': 'badge--ok',
      'هام': 'badge--danger', 'عاجل': 'badge--danger', 'نقاش': 'badge--muted',
      'امتحان': 'badge--danger', 'واجب': 'badge--navy', 'مشروع': 'badge--ok',
      'مختبر': 'badge--gold', 'مرجع': 'badge--navy'
    };
    return map[cat] || 'badge--muted';
  };

  B45.ready = function (cb) {
    if (B45._resolved) { try { cb(); } catch (e) { console.error(e); } }
    else B45._queue.push(cb);
  };

  B45._resolve = function () {
    if (B45._resolved) return;
    B45._resolved = true;
    const q = B45._queue; B45._queue = [];
    q.forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } });
  };

  B45.el = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  B45.qs = function (s, root) { return (root || document).querySelector(s); };
  B45.qsa = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  /* ---------------- modal ---------------- */
  B45.openModal = function (opts) {
    closeModal();
    const overlay = B45.el(
      '<div class="modal-overlay" id="b45-modal" role="dialog" aria-modal="true">' +
      '<div class="modal">' +
      '<div class="modal-head"><div><h3></h3><div class="meta"></div></div>' +
      '<button class="modal-close" aria-label="إغلاق">✕</button></div>' +
      '<div class="modal-body"></div>' +
      '</div></div>'
    );
    overlay.querySelector('h3').textContent = opts.title || '';
    overlay.querySelector('.meta').innerHTML = opts.meta || '';
    overlay.querySelector('.modal-body').innerHTML = opts.html || '';
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('show'); });
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', escClose);
    function escClose(e) { if (e.key === 'Escape') closeModal(); }
    overlay._esc = escClose;
  };
  function closeModal() {
    const m = document.getElementById('b45-modal');
    if (m) { if (m._esc) document.removeEventListener('keydown', m._esc); m.remove(); }
    document.body.style.overflow = '';
  }
  B45.closeModal = closeModal;

  /* ---------------- crest ---------------- */
  const CREST =
    '<svg class="crest" viewBox="0 0 64 64" role="img" aria-label="شعار الدفعة 45">' +
    '<defs><linearGradient id="b45gold" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#F2DC8F"/><stop offset=".55" stop-color="#E1C25B"/><stop offset="1" stop-color="#B98F1D"/>' +
    '</linearGradient></defs>' +
    '<path d="M32 3.5 55 11.6v16.6c0 14.6-9.8 25.6-23 32.3-13.2-6.7-23-17.7-23-32.3V11.6Z" fill="#0B1F3A" stroke="url(#b45gold)" stroke-width="2.2"/>' +
    '<path d="M32 8.2 50.6 14.5v13.7c0 12-8 21.2-18.6 27.2C21.4 49.4 13.4 40.2 13.4 28.2V14.5Z" fill="none" stroke="rgba(225,194,91,.35)" stroke-width="1"/>' +
    '<path d="M27.6 17.5h8.8v5.3l5.4 11.6a3.6 3.6 0 0 1-3.3 5.1H25.5a3.6 3.6 0 0 1-3.3-5.1l5.4-11.6Z" fill="none" stroke="url(#b45gold)" stroke-width="1.9" stroke-linejoin="round"/>' +
    '<path d="M25.9 30.6h12.2" stroke="url(#b45gold)" stroke-width="1.5"/>' +
    '<circle cx="29.4" cy="34.6" r="1.1" fill="#E1C25B"/><circle cx="34.8" cy="37.4" r=".9" fill="#E1C25B"/>' +
    '<ellipse cx="32" cy="45.6" rx="11.4" ry="3.9" fill="none" stroke="rgba(225,194,91,.5)" stroke-width=".9" transform="rotate(-16 32 45.6)"/>' +
    '<text x="32" y="52.4" text-anchor="middle" font-family="Georgia,serif" font-size="7.4" font-weight="bold" fill="url(#b45gold)">45</text>' +
    '</svg>';

  /* ---------------- navigation model ---------------- */
  const NAV = [
    { key: 'home', label: 'الرئيسية', href: 'index.html' },
    { key: 'news', label: 'الأخبار', href: 'news.html' },
    { key: 'library', label: 'المكتبة', href: 'library.html' },
    { key: 'schedule', label: 'الجدول الدراسي', href: 'schedule.html' },
    { key: 'exams', label: 'بنك الأسئلة', href: 'exams.html' },
    { key: 'events', label: 'الفعاليات', href: 'events.html' },
    { key: 'forum', label: 'المنتدى', href: 'forum.html' },
    { key: 'members', label: 'الأعضاء', href: 'members.html' },
    { key: 'about', label: 'عن الدفعة', href: 'about.html' }
  ];

  function navItemsHtml() {
    const active = document.body.getAttribute('data-page') || 'home';
    return NAV.map(function (n) {
      return '<a class="nav-link' + (n.key === active ? ' active' : '') + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');
  }

  /* ---------------- renderers ---------------- */
  function renderTopbar() {
    const c = B45.config;
    const host = document.getElementById('site-topbar');
    if (!host) return;
    host.innerHTML =
      '<div class="topbar"><div class="container topbar-inner">' +
      '<div><b>' + B45.esc(c.universityAr) + '</b> — ' + B45.esc(c.universityEn) +
      ' · ' + B45.esc(c.facultyAr) + '</div>' +
      '<div class="topbar-links">' +
      '<span><span class="dot"></span> بوابة الدفعة ' + B45.esc(c.batchNo || '45') + '</span>' +
      '<span>' + B45.esc(c.termAr || '') + '</span>' +
      '<button type="button" id="b45-logout">تسجيل الخروج</button>' +
      '</div></div></div>';
    const lo = document.getElementById('b45-logout');
    if (lo) lo.addEventListener('click', function () {
      sessionStorage.removeItem('b45-auth');
      location.reload();
    });
  }

  function renderHeader() {
    const c = B45.config;
    const host = document.getElementById('site-header');
    if (!host) return;
    host.innerHTML =
      '<header class="site-header"><div class="container header-inner">' +
      '<a class="brand" href="index.html">' + CREST +
      '<span class="brand-text">' +
      '<span class="brand-ar">' + B45.esc(c.siteNameAr) + '</span>' +
      '<span class="brand-en">' + B45.esc(c.siteNameEn) + '</span>' +
      '<span class="brand-sub">' + B45.esc(c.facultyAr) + '</span>' +
      '</span></a>' +
      '<button class="nav-toggle" id="b45-nav-toggle" aria-label="فتح القائمة">☰ <span>القائمة</span></button>' +
      '<nav class="main-nav" id="b45-nav">' + navItemsHtml() +
      '<a class="btn btn-gold btn-sm" href="about.html#contact" style="margin-inline-start:.4rem">انضم إلينا</a></nav>' +
      '</div></header>';

    const nav = document.getElementById('b45-nav');
    const toggle = document.getElementById('b45-nav-toggle');
    const backdrop = B45.el('<div class="nav-backdrop" id="b45-backdrop"></div>');
    document.body.appendChild(backdrop);
    function closeNav() { nav.classList.remove('open'); backdrop.classList.remove('show'); }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      backdrop.classList.toggle('show', nav.classList.contains('open'));
    });
    backdrop.addEventListener('click', closeNav);
    B45.qsa('.nav-link', nav).forEach(function (a) { a.addEventListener('click', closeNav); });

    // shrink shadow on scroll
    const header = host.querySelector('.site-header');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function renderAnnounce() {
    const msg = B45.config.announcementBar;
    if (!msg) return;
    const host = document.getElementById('site-header');
    if (!host) return;
    host.insertAdjacentHTML('afterend',
      '<div class="announce"><div class="container announce-inner">' +
      '<span class="tag">تنبيه</span><span>' + B45.esc(msg) + '</span></div></div>');
  }

  function renderFooter() {
    const c = B45.config;
    const host = document.getElementById('site-footer');
    if (!host) return;
    const links = NAV.slice(0, 6).map(function (n) {
      return '<li><a href="' + n.href + '">' + n.label + '</a></li>';
    }).join('');
    const res = [
      ['المكتبة', 'library.html'], ['بنك الأسئلة', 'exams.html'],
      ['الجدول الدراسي', 'schedule.html'], ['المنتدى', 'forum.html'], ['دليل الأعضاء', 'members.html']
    ].map(function (r) { return '<li><a href="' + r[1] + '">' + r[0] + '</a></li>'; }).join('');
    const tel = c.contact && c.contact.telegram ? '<li><a href="' + B45.esc(c.contact.telegram) + '" target="_blank" rel="noopener">تليجرام</a></li>' : '';
    const wa = c.contact && c.contact.whatsapp ? '<li><a href="' + B45.esc(c.contact.whatsapp) + '" target="_blank" rel="noopener">واتساب</a></li>' : '';
    const mail = c.contact && c.contact.email ? '<li><a href="mailto:' + B45.esc(c.contact.email) + '">' + B45.esc(c.contact.email) + '</a></li>' : '';
    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-inner">' +
      '<div><div class="footer-crest">' + CREST + '<div><b>' + B45.esc(c.siteNameAr) + '</b><span>' + B45.esc(c.siteNameEn) + '</span></div></div>' +
      '<p class="footer-about">' + B45.esc(c.footerAbout || '') + '</p>' +
      '<p class="footer-about" style="color:#8194AC">' + B45.esc(c.universityAr) + ' — ' + B45.esc(c.facultyAr) + '</p></div>' +
      '<div><h4 class="footer-title">روابط سريعة</h4><ul class="footer-links">' + links + '</ul></div>' +
      '<div><h4 class="footer-title">الأقسام</h4><ul class="footer-links">' + res + '</ul></div>' +
      '<div><h4 class="footer-title">تواصل معنا</h4><ul class="footer-links">' + tel + wa + mail +
      '<li><a href="about.html#contact">صفحة التواصل</a></li></ul></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' — ' + B45.esc(c.siteNameAr) + ' · جميع الحقوق محفوظة</span>' +
      '<span>' + B45.esc(c.footerNote || 'صُنع بشغف لخدمة زملائنا') + '</span></div>' +
      '</div></footer>';
  }

  /* ---------------- auth gate ---------------- */
  function renderAuthGate() {
    const c = B45.config;
    const overlay = B45.el(
      '<div class="auth-overlay show" id="b45-auth">' +
      '<div class="auth-card">' + CREST +
      '<div class="auth-univ">' + B45.esc(c.universityEn) + '</div>' +
      '<h1 class="auth-title">' + B45.esc(c.siteNameAr) + '</h1>' +
      '<div class="auth-en">' + B45.esc(c.siteNameEn) + '</div>' +
      '<p class="auth-sub">هذه البوابة مخصّصة لطلاب الدفعة فقط. أدخل كلمة مرور الدفعة للمتابعة.</p>' +
      '<form class="auth-form" id="b45-auth-form">' +
      '<input class="auth-input" id="b45-pass" type="password" placeholder="كلمة المرور" autocomplete="current-password" required>' +
      '<div class="auth-error" id="b45-auth-err"></div>' +
      '<button class="auth-btn" type="submit">دخول البوابة</button>' +
      '</form>' +
      '<div class="auth-links"><a href="' + B45.esc(c.universityUrl || 'https://uofg.edu.sd') + '" target="_blank" rel="noopener">جامعة الجزيرة</a><a href="about.html">عن الدفعة</a></div>' +
      '<p class="auth-note">🔒 كلمة المرور تُدار من ملف <code>data/config.json</code>. هذه الحماية مناسبة للمرحلة الأولى ويمكن ترقيتها لاحقًا إلى حسابات أعضاء حقيقية.</p>' +
      '</div></div>'
    );
    document.body.appendChild(overlay);
    document.body.classList.add('locked');
    const form = overlay.querySelector('#b45-auth-form');
    const input = overlay.querySelector('#b45-pass');
    const err = overlay.querySelector('#b45-auth-err');
    setTimeout(function () { input.focus(); }, 120);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const pass = (c.auth && c.auth.password) || 'gezira45';
      if (input.value === pass) {
        sessionStorage.setItem('b45-auth', '1');
        B45.authed = true;
        overlay.remove();
        document.body.classList.remove('locked');
        B45._resolve();
      } else {
        err.textContent = 'كلمة المرور غير صحيحة — حاول مرة أخرى.';
        input.select();
      }
    });
  }

  /* ---------------- global UI ---------------- */
  function bindGlobalUI() {
    // back to top
    const btn = B45.el('<button class="back-to-top" id="b45-top" aria-label="العودة للأعلى">↑</button>');
    document.body.appendChild(btn);
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () { btn.classList.toggle('show', window.scrollY > 480); }, { passive: true });

    // reveal on scroll — also covers elements injected later by page scripts
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
        });
      }, { threshold: 0.08 });
      const seen = new WeakSet();
      const armFallback = function (el) {
        // safety net: never leave content invisible if the observer doesn't fire
        setTimeout(function () {
          if (el && el.classList && !el.classList.contains('visible')) el.classList.add('visible');
        }, 1000);
      };
      const observeRoot = function (root) {
        B45.qsa('.reveal', root).forEach(function (el) {
          if (!seen.has(el)) { seen.add(el); io.observe(el); armFallback(el); }
        });
      };
      observeRoot(document);
      if ('MutationObserver' in window) {
        const mo = new MutationObserver(function (muts) {
          muts.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
              if (node.nodeType !== 1) return;
              if (node.classList && node.classList.contains('reveal') && !seen.has(node)) {
                seen.add(node); io.observe(node); armFallback(node);
              }
              observeRoot(node);
            });
          });
        });
        mo.observe(document.body, { childList: true, subtree: true });
      }
    } else {
      B45.qsa('.reveal').forEach(function (e) { e.classList.add('visible'); });
    }
  }

  function showServerHint() {
    document.body.innerHTML =
      '<div style="max-width:720px;margin:12vh auto;padding:2rem;font-family:Tahoma,Arial;direction:rtl;line-height:2;color:#1C2533">' +
      '<h1 style="color:#0B1F3A">تعذّر تحميل بيانات الموقع</h1>' +
      '<p>يجب تشغيل الموقع عبر خادم محلي وليس بفتح الملف مباشرة (file://)، لأن المتصفح يمنع قراءة ملفات JSON.</p>' +
      '<p><b>الحل:</b> افتح الموقع عبر ملف <code>تشغيل-الموقع.bat</code> الموجود بجانب الصفحات، ثم زر <code>http://localhost:8080</code>.</p>' +
      '<p style="color:#5F6B7A;font-size:.9rem">' + B45.esc(B45._fetchError || '') + '</p></div>';
  }

  /* ---------------- shared render helpers ---------------- */
  B45.MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  B45.newsCard = function (item) {
    const s = B45.fmtShort(item.date);
    return '<article class="card news-card reveal" data-news-id="' + B45.esc(item.id) + '" style="cursor:pointer">' +
      '<div class="news-date"><span class="d">' + s.d + '</span><span class="m">' + s.m + '</span></div>' +
      '<div class="news-main">' +
      '<div class="news-top"><span class="badge ' + B45.badgeClass(item.category) + '">' + B45.esc(item.category) + '</span>' +
      (item.pinned ? '<span class="pinned-flag">📌 مثبّت</span>' : '') + '</div>' +
      '<h3 class="news-title">' + B45.esc(item.title) + '</h3>' +
      '<p class="news-excerpt">' + B45.esc(item.excerpt) + '</p>' +
      '<div class="news-meta"><span>👤 ' + B45.esc(item.author || 'الدفعة') + '</span>' +
      '<span>🗓️ ' + B45.fmtDate(item.date) + '</span>' +
      '<span class="card-link" style="margin-inline-start:auto">اقرأ المزيد ←</span></div>' +
      '</div></article>';
  };

  B45.eventCard = function (ev) {
    const s = B45.fmtShort(ev.date);
    return '<article class="card event-card reveal" data-event-id="' + B45.esc(ev.id) + '">' +
      '<div class="event-date"><span class="d">' + s.d + '</span><span class="m">' + s.m + '</span></div>' +
      '<div class="event-info"><h3>' + B45.esc(ev.title) + '</h3>' +
      '<p>' + B45.esc(ev.desc) + '</p>' +
      '<div class="event-meta"><span>🕐 ' + B45.esc(ev.time || '') + '</span><span>📍 ' + B45.esc(ev.place || '') + '</span>' +
      '<span class="badge badge--gold">' + B45.esc(ev.type || 'فعالية') + '</span></div></div></article>';
  };

  B45.fileRow = function (f) {
    const meta = [f.kind, f.size, f.date ? B45.fmtDate(f.date) : ''].filter(Boolean).map(B45.esc).join(' · ');
    const action = f.url
      ? '<a class="file-dl" href="' + B45.esc(f.url) + '" target="_blank" rel="noopener">تحميل ↓</a>'
      : '<span class="badge badge--muted">قريبًا</span>';
    return '<div class="file-row"><div class="file-ico">📄</div>' +
      '<div class="file-name"><b>' + B45.esc(f.title) + '</b><span>' + meta + '</span></div>' + action + '</div>';
  };

  B45.sortByDateDesc = function (arr, key) {
    key = key || 'date';
    return arr.slice().sort(function (a, b) { return new Date(b[key]) - new Date(a[key]); });
  };

  /* ---------------- init ---------------- */
  async function init() {
    try {
      B45.config = await B45.loadJSON('data/config.json');
    } catch (e) {
      B45._fetchError = e.message;
      showServerHint();
      return;
    }
    renderTopbar();
    renderHeader();
    renderAnnounce();
    renderFooter();
    bindGlobalUI();

    const enabled = !(B45.config.auth && B45.config.auth.enabled === false);
    const stored = sessionStorage.getItem('b45-auth') === '1';
    if (!enabled || stored) {
      B45.authed = true;
      B45._resolve();
    } else {
      B45.authed = false;
      renderAuthGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
