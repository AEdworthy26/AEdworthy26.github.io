/* ── Personal Hub Cloud Sync ─────────────────────────────────────────────────
   Syncs organisational data via a Cloudflare Worker (token lives server-side).
   No credentials are stored in the browser.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var WORKER_URL   = 'https://personal-hub-sync.alfieedworthy.workers.dev';
  var GIST_FILE    = 'personal-hub-sync.json';
  var BACKUP_FILE  = 'personal-hub-backup.json';
  var BACKUP_DATE_KEY = 'ph_backup_date';

  var LAST_SYNC_KEY = 'ph_sync_last';
  var RELOAD_FLAG   = 'ph_sync_reloaded_' + location.pathname;

  var SYNC_KEYS = [
    // Calendar & organisation
    'ph_calendar_v3',
    'ph_todos_v1',
    'ph_wishlist_v1',
    'personal_hub_goals',
    'personal_hub_achievements',
    'personal_hub_checkins',
    // Books
    'personal_hub_books_v2',
    'personal_hub_books_order',
    'personal_hub_books_order_reading',
    'personal_hub_books_order_toread',
    // Recipes & meal planner
    'ph_recipes_v1',
    'personal_hub_meal_planner_v2',
    // Films watchlist
    'ph_films_log_v1',
    // Exercise
    'ph_ex_routines_v1',
    'ph_ex_logs_v1',
    'ph_ex_acts_v1',
    // Saved articles
    'ph_curiosity_favs_v1',
    'ph_philosophy_favs_v1',
    // Wordle
    'ph_wordle_v1',
    'ph_wordle_stats_v1',
    // Daily cache (preserves today's rotation across devices)
    'reads_daily',
  ];

  /* ── helpers ── */
  var _origSet = localStorage.setItem.bind(localStorage);
  var _origGet = localStorage.getItem.bind(localStorage);

  var TIMESTAMPS_KEY = 'ph_sync_timestamps';

  function getLocalTimestamps() {
    try { return JSON.parse(_origGet(TIMESTAMPS_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setLocalTimestamp(key) {
    var ts = getLocalTimestamps();
    ts[key] = Date.now();
    _origSet(TIMESTAMPS_KEY, JSON.stringify(ts));
  }

  /* ── push: localStorage → Worker → Gist ── */
  var pushTimer = null;
  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 800);
  }

  function buildPayload() {
    var data = { _timestamps: getLocalTimestamps() };
    SYNC_KEYS.forEach(function (k) {
      var v = _origGet(k);
      if (v !== null) data[k] = v;
    });
    var content = JSON.stringify(data);
    var files = {};
    files[GIST_FILE] = { content: content };
    var today = new Date().toISOString().slice(0, 10);
    if (_origGet(BACKUP_DATE_KEY) !== today) {
      files[BACKUP_FILE] = { content: content };
      _origSet(BACKUP_DATE_KEY, today);
    }
    return JSON.stringify({ files: files });
  }

  function doPush(keepalive) {
    var hasData = SYNC_KEYS.some(function(k) { return _origGet(k) !== null; });
    if (!hasData) return;
    fetch(WORKER_URL, {
      method:    'PATCH',
      headers:   { 'Content-Type': 'application/json' },
      body:      buildPayload(),
      keepalive: !!keepalive
    }).then(function () {
      _origSet(LAST_SYNC_KEY, new Date().toISOString());
      updateSyncUI('synced');
    }).catch(function () {
      updateSyncUI('error');
    });
  }

  /* ── pull: Worker → Gist → localStorage ── */
  function doPull(callback) {
    fetch(WORKER_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (gist) {
        if (!gist.files || !gist.files[GIST_FILE]) {
          if (callback) callback(false, 'empty');
          return;
        }
        var remote = JSON.parse(gist.files[GIST_FILE].content);
        var remoteTs = remote._timestamps || {};
        var localTs  = getLocalTimestamps();
        var changed = false;

        SYNC_KEYS.forEach(function (k) {
          if (remote[k] === undefined) return;
          var localVal   = _origGet(k);
          var remoteTime = remoteTs[k] || 0;
          var localTime  = localTs[k]  || 0;

          if (localVal === null || remoteTime > localTime) {
            if (remote[k] !== localVal) {
              _origSet(k, remote[k]);
              var ts = getLocalTimestamps();
              ts[k] = remoteTime || Date.now();
              _origSet(TIMESTAMPS_KEY, JSON.stringify(ts));
              changed = true;
            }
          }
        });

        _origSet(LAST_SYNC_KEY, new Date().toISOString());
        if (callback) callback(true, changed ? 'updated' : 'same');
      })
      .catch(function () {
        if (callback) callback(false, 'fetch-error');
      });
  }

  /* ── intercept localStorage.setItem to auto-push ── */
  localStorage.setItem = function (key, value) {
    _origSet(key, value);
    if (key !== LAST_SYNC_KEY && SYNC_KEYS.indexOf(key) !== -1) {
      setLocalTimestamp(key);
      schedulePush();
    }
  };

  /* ── on page load: pull then reload once if data changed ── */
  window.addEventListener('DOMContentLoaded', function () {
    var alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);

    // If localStorage appears empty (data just cleared) and we haven't already
    // reloaded, hide the page immediately so the user never sees a blank flash.
    // The pull will restore data then trigger a reload; the page reveals with
    // everything in place. Safety net shows the page after 4s regardless.
    var localLooksEmpty = !alreadyReloaded && !SYNC_KEYS.some(function(k) {
      return _origGet(k) !== null;
    });
    if (localLooksEmpty) {
      document.documentElement.style.visibility = 'hidden';
      setTimeout(function() { document.documentElement.style.visibility = ''; }, 4000);
    }

    doPull(function (ok, reason) {
      if (ok && reason === 'updated' && !alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      } else {
        // Restore visibility whether pull succeeded with no changes, or failed
        document.documentElement.style.visibility = '';
      }
      if (!ok) {
        var last = _origGet(LAST_SYNC_KEY);
        var hoursSince = last ? (Date.now() - new Date(last).getTime()) / 3600000 : Infinity;
        if (hoursSince > 24) {
          var days = Math.floor(hoursSince / 24);
          var daysMsg = hoursSince === Infinity
            ? ' No successful backup on record.'
            : ' Last successful backup was ' + days + ' day' + (days === 1 ? '' : 's') + ' ago.';
          injectSyncWarning('Sync is failing &mdash; your data is not being backed up.' + daysMsg);
        }
        updateSyncUI('error');
      } else {
        updateSyncUI('synced');
        sessionStorage.removeItem(RELOAD_FLAG);
        doPush();
      }
    });
  });

  /* ── sync health warning banner ── */
  function injectSyncWarning(msg) {
    if (document.getElementById('ph-sync-warning')) return;
    var el = document.createElement('div');
    el.id = 'ph-sync-warning';
    el.style.cssText = 'background:#7a1a1a;color:#fff;padding:0.65rem 1.4rem;text-align:center;font-size:0.82rem;font-family:sans-serif;position:sticky;top:0;z-index:99999;line-height:1.6;';
    el.innerHTML = '<strong>&#9888; Sync warning:</strong> ' + msg;
    if (document.body) {
      document.body.insertBefore(el, document.body.firstChild);
    }
  }

  /* ── push on tab close ── */
  window.addEventListener('beforeunload', function () { doPush(true); });

  /* ── safety-net: push every 2 minutes ── */
  setInterval(function () { doPush(); }, 2 * 60 * 1000);

  /* ── sync status indicator ── */
  function updateSyncUI(state) {
    var el = document.getElementById('ph-sync-indicator');
    if (!el) return;
    if (state === 'synced') {
      el.textContent = '✓ Synced';
      el.style.color = '#3a3';
    } else if (state === 'error') {
      el.textContent = '⚠ Sync error';
      el.style.color = '#c33';
    }
  }

  /* ── public API ── */
  window.PhSync = {
    LAST_SYNC_KEY: LAST_SYNC_KEY,
    push:   function () { doPush(); },
    pull:   doPull,
    status: updateSyncUI
  };
})();
