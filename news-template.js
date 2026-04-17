// news-template.js
// Shared rendering engine for all news category pages.
// Each news page loads this file, then calls window.renderNewsPage(config).
//
// config = {
//   data:       object   — the NEWS data variable (e.g. WORLD_NEWS)
//   varName:    string   — name of the variable, used in empty-state message
//   dataFile:   string   — filename of the data JS, used in empty-state message
//   icon:       string   — emoji used as hero/card placeholder and empty-state icon
//   accentVar:  string   — CSS variable name for accent colour, e.g. '--blue'
//   accentHex:  string   — fallback hex for the accent (used in drop-cap colour)
// }

(function () {

  // ── Date label ─────────────────────────────────────────────────────────────
  var dateEl = document.getElementById('js-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Story modal ────────────────────────────────────────────────────────────
  var modalEl = null;

  function buildModal() {
    if (modalEl) return;
    var style = document.createElement('style');
    style.textContent = [
      '.story-modal-overlay{position:fixed;inset:0;background:rgba(10,15,30,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;z-index:999;padding:1rem;}',
      '.story-modal-overlay.open{display:flex;}',
      '.story-modal{background:#fff;border-radius:18px;box-shadow:0 28px 80px rgba(0,0,0,0.22);width:100%;max-width:580px;max-height:90vh;overflow-y:auto;animation:smIn .2s cubic-bezier(.22,1,.36,1);}',
      '@keyframes smIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:none}}',
      '.sm-thumb{width:100%;aspect-ratio:16/9;overflow:hidden;background:#f1f5f9;border-radius:18px 18px 0 0;flex-shrink:0;}',
      '.sm-thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.sm-body{padding:1.4rem 1.6rem 1.6rem;}',
      '.sm-eyebrow{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.7rem;}',
      '.sm-cat{font-size:0.58rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue,#003399);}',
      '.sm-close{background:none;border:none;font-size:1.25rem;line-height:1;cursor:pointer;color:#94a3b8;padding:0.1rem 0.3rem;border-radius:6px;transition:color .15s,background .15s;}',
      '.sm-close:hover{color:#0d0d0d;background:#f1f5f9;}',
      '.sm-title{font-family:"Playfair Display",serif;font-weight:700;font-size:1.15rem;line-height:1.35;color:#0d0d0d;margin-bottom:1rem;}',
      '.sm-paras p{font-size:0.875rem;line-height:1.75;color:#374151;margin-bottom:0.75rem;}',
      '.sm-paras p:last-child{margin-bottom:0;}',
      '.sm-footer{display:flex;align-items:center;justify-content:space-between;margin-top:1.2rem;padding-top:1rem;border-top:1px solid #e5e7eb;}',
      '.sm-source{font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;}',
      '.sm-read-btn{display:inline-flex;align-items:center;gap:0.35rem;font-size:0.7rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#fff;background:var(--blue,#003399);padding:0.45rem 1rem;border-radius:8px;text-decoration:none;transition:opacity .15s;}',
      '.sm-read-btn:hover{opacity:0.85;text-decoration:none;}',
      '.card-summary-btn{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--blue,#003399);background:none;border:none;padding:0;cursor:pointer;font-family:inherit;transition:color .15s;}',
      '.card-summary-btn:hover{text-decoration:underline;}'
    ].join('');
    document.head.appendChild(style);

    modalEl = document.createElement('div');
    modalEl.className = 'story-modal-overlay';
    modalEl.innerHTML =
      '<div class="story-modal" id="story-modal-panel">'
      + '<div class="sm-thumb" id="sm-thumb"></div>'
      + '<div class="sm-body">'
      +   '<div class="sm-eyebrow"><span class="sm-cat" id="sm-cat"></span><button class="sm-close" onclick="window._closeStoryModal()" aria-label="Close">&times;</button></div>'
      +   '<div class="sm-title" id="sm-title"></div>'
      +   '<div class="sm-paras" id="sm-paras"></div>'
      +   '<div class="sm-footer"><span class="sm-source" id="sm-source"></span><a class="sm-read-btn" id="sm-read-btn" target="_blank" rel="noopener">Read original &rarr;</a></div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(modalEl);

    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) window._closeStoryModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') window._closeStoryModal();
    });
  }

  window._openStoryModal = function (item) {
    buildModal();
    document.getElementById('sm-cat').textContent = item.category || '';
    document.getElementById('sm-title').textContent = item.title || '';

    var thumbEl = document.getElementById('sm-thumb');
    if (item.image) {
      thumbEl.style.display = '';
      thumbEl.innerHTML = '<img src="' + item.image.replace(/"/g,'') + '" alt="' + (item.title||'').replace(/"/g,'') + '" loading="lazy">';
    } else {
      thumbEl.style.display = 'none';
    }

    var paras = Array.isArray(item.body) ? item.body : [];
    document.getElementById('sm-paras').innerHTML = paras.map(function (p) {
      return '<p>' + p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>';
    }).join('') || '<p>' + (item.summary||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>';

    document.getElementById('sm-source').textContent = item.source || '';
    var btn = document.getElementById('sm-read-btn');
    if (item.url) { btn.href = item.url; btn.style.display = ''; }
    else btn.style.display = 'none';

    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window._closeStoryModal = function () {
    if (modalEl) modalEl.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Ticker — populated from this page's live data ─────────────────────────
  function _initTicker(data) {
    var t = document.getElementById('js-ticker');
    if (!t) return;
    var headlines = [];
    if (data) {
      if (data.main && data.main.title) headlines.push(data.main.title);
      if (Array.isArray(data.secondary)) {
        data.secondary.forEach(function (s) { if (s.title) headlines.push(s.title); });
      }
    }
    if (!headlines.length) headlines = ['Loading latest headlines\u2026'];
    var mk = function (a) {
      return a.map(function (x) {
        return '<span style="color:#fff;font-family:\'Source Serif 4\',serif;font-size:0.78rem;font-weight:600;padding:0 2rem;">'
          + x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          + '</span><span class="ticker-sep">&#124;</span>';
      }).join('');
    };
    t.innerHTML = mk(headlines) + mk(headlines);
    requestAnimationFrame(function () {
      t.style.animationDuration = (t.scrollWidth / 2 / 60) + 's';
    });
  }

  // ── Dropdown nav ───────────────────────────────────────────────────────────
  (function () {
    var btns = document.querySelectorAll('.nav-drop-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.nextElementSibling;
        var isOpen = menu.style.display === 'flex';
        document.querySelectorAll('.nav-drop-menu').forEach(function (m) { m.style.display = ''; });
        if (!isOpen) menu.style.display = 'flex';
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-drop-menu').forEach(function (m) { m.style.display = ''; });
    });
  })();

  // ── Render engine ──────────────────────────────────────────────────────────
  window.renderNewsPage = function (cfg) {
    var output = document.getElementById('news-output');
    if (!output) return;

    _initTicker(cfg.data);

    if (!cfg.data) {
      output.innerHTML =
        '<div class="empty-state">'
        + '<span class="empty-icon">' + cfg.icon + '</span>'
        + '<div class="empty-title">No news available</div>'
        + '<p class="empty-text">Update <code>' + cfg.dataFile + '</code> with today\'s stories.</p>'
        + '</div>';
      return;
    }

    var data = cfg.data;
    var accent = cfg.accentVar || '--blue';
    var accentHex = cfg.accentHex || '#003399';

    // Helpers
    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function fmtDate(iso) {
      return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    function imgOrPlaceholder(src, alt, wrapCls, icon) {
      if (!src) return '<div class="' + wrapCls + '-placeholder">' + icon + '</div>';
      return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" '
        + 'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
        + '<div class="' + wrapCls + '-placeholder" style="display:none">' + icon + '</div>';
    }

    function catPill(cat) {
      if (!cat) return '';
      return '<span class="story-tag">' + esc(cat) + '</span>';
    }

    // Main story
    var m = data.main;
    var paras = Array.isArray(m.content) ? m.content : m.content.split(/\n+/).filter(Boolean);
    var pullQuote = paras[0].split('.')[0] + '.';

    var mainHTML =
      '<article class="main-story">'
      + '<div class="story-eyebrow">'
      +   (m.category ? catPill(m.category) : '<span class="story-tag">Main Story</span>')
      +   '<time class="story-date">' + fmtDate(data.date) + '</time>'
      + '</div>'
      + '<h2 class="story-headline">' + esc(m.title) + '</h2>'
      + '<div class="hero-img-wrap">' + imgOrPlaceholder(m.image, m.title, 'hero-placeholder', cfg.icon) + '</div>'
      + '<div class="story-body">'
      +   '<div class="story-text">'
      +     paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('')
      +   '</div>'
      +   '<aside class="story-aside">'
      +     '<blockquote class="pull-quote"><p>&ldquo;' + esc(pullQuote) + '&rdquo;</p></blockquote>'
      +     (m.source
        ? '<div class="story-source"><span style="display:block;font-weight:700;color:var(--muted);margin-bottom:0.3rem">Source</span>'
          + (m.sourceUrl
            ? '<a href="' + esc(m.sourceUrl) + '" target="_blank" rel="noopener">' + esc(m.source) + '</a>'
            : esc(m.source))
          + '</div>'
        : '')
      +   '</aside>'
      + '</div>'
      + '</article>';

    // Secondary grid
    var secondary = data.secondary || [];
    // Store items in a lookup so onclick can reference by index without inline JSON
    window._newsItems = secondary;
    var gridHTML = '';

    if (secondary.length > 0) {
      var cards = secondary.map(function (item, i) {
        var hasBody = Array.isArray(item.body) && item.body.length > 0;
        var thumbContent = imgOrPlaceholder(item.image, item.title, 'card-thumb', cfg.icon);
        var thumbHTML = item.url
          ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener" tabindex="-1" style="display:block;overflow:hidden;">' + thumbContent + '</a>'
          : '<div>' + thumbContent + '</div>';
        var titleHTML = hasBody
          ? '<h3 class="card-title" style="cursor:pointer;" onclick="window._openStoryModal(window._newsItems[' + i + '])">' + esc(item.title) + '</h3>'
          : (item.url
            ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;" class="card-title-link"><h3 class="card-title">' + esc(item.title) + '</h3></a>'
            : '<h3 class="card-title">' + esc(item.title) + '</h3>');
        var footerAction = hasBody
          ? '<button class="card-summary-btn" onclick="window._openStoryModal(window._newsItems[' + i + '])">Read summary &#9658;</button>'
          : (item.url ? '<a class="card-read-more" href="' + esc(item.url) + '" target="_blank" rel="noopener">Read more &rarr;</a>' : '');
        return '<article class="news-card" style="animation-delay:' + (i * 120) + 'ms">'
          + '<div class="card-thumb">' + thumbHTML + '</div>'
          + '<div class="card-body">'
          +   (item.category ? '<span class="card-category">' + esc(item.category) + '</span>' : '')
          +   titleHTML
          +   '<p class="card-summary">' + esc(item.summary) + '</p>'
          +   '<div class="card-footer">'
          +     (item.source ? '<span class="card-source">' + esc(item.source) + '</span>' : '<span></span>')
          +     footerAction
          +   '</div>'
          + '</div>'
          + '</article>';
      }).join('');

      gridHTML =
        '<section class="secondary-section">'
        + '<div class="section-heading">'
        +   '<h2>More Stories</h2>'
        +   '<div class="section-rule"></div>'
        +   '<span class="section-count">' + secondary.length + ' ' + (secondary.length === 1 ? 'story' : 'stories') + '</span>'
        + '</div>'
        + '<div class="news-grid">' + cards + '</div>'
        + '</section>';
    }

    var footerHTML = '<p class="last-updated">Last updated: ' + fmtDate(data.date) + '</p>';

    output.innerHTML = mainHTML + gridHTML + footerHTML;
  };

})();
