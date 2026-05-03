/* ── Personal Hub Cloud Sync ─────────────────────────────────────────────────
   Syncs organisational data to a private GitHub Gist.
   Token is stored only in localStorage on each device — never in this file.
   Gist ID is not sensitive (it's just a storage key, not a credential).
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var GIST_ID   = '15906d39db7dcba2325f33eab0ee1a9b';
  var GIST_FILE = 'personal-hub-sync.json';
  var API_URL   = 'https://api.github.com/gists/' + GIST_ID;

  var TOKEN_KEY     = 'ph_sync_token';
  var LAST_SYNC_KEY = 'ph_sync_last';
  var RELOAD_FLAG   = 'ph_sync_reloaded_' + location.pathname;

  var SYNC_KEYS = [
    'ph_calendar_v3',
    'ph_todos_v1',
    'personal_hub_books_v2',
    'ph_wishlist_v1',
    'personal_hub_achievements',
    'personal_hub_meal_planner_v2',
    'ph_wordle_v1',
    'ph_wordle_stats_v1',
    'personal_hub_goals',
    'reads_daily',
    'ph_recipes_v1',
    'ph_ex_routines_v1',
    'ph_ex_logs_v1',
    'ph_ex_acts_v1',
    'ph_curiosity_favs_v1',
    'ph_philosophy_favs_v1'
  ];

  /* ── helpers ── */
  var _origSet = localStorage.setItem.bind(localStorage);
  var _origGet = localStorage.getItem.bind(localStorage);

  function getToken() { return _origGet(TOKEN_KEY); }

  function authHeaders(token) {
    return {
      'Authorization': 'token ' + token,
      'Content-Type':  'application/json'
    };
  }

  var TIMESTAMPS_KEY = 'ph_sync_timestamps'; // local record of when each key was last written here

  function getLocalTimestamps() {
    try { return JSON.parse(_origGet(TIMESTAMPS_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setLocalTimestamp(key) {
    var ts = getLocalTimestamps();
    ts[key] = Date.now();
    _origSet(TIMESTAMPS_KEY, JSON.stringify(ts));
  }

  /* ── push: localStorage → Gist ── */
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
    var files = {};
    files[GIST_FILE] = { content: JSON.stringify(data) };
    return JSON.stringify({ files: files });
  }

  function doPush(keepalive) {
    var token = getToken();
    if (!token) return;
    fetch(API_URL, {
      method:   'PATCH',
      headers:  authHeaders(token),
      body:     buildPayload(),
      keepalive: !!keepalive
    }).then(function () {
      _origSet(LAST_SYNC_KEY, new Date().toISOString());
      updateSyncUI('synced');
    }).catch(function () {
      updateSyncUI('error');
    });
  }

  /* ── pull: Gist → localStorage ── */
  function doPull(callback) {
    var token = getToken();
    if (!token) { if (callback) callback(false, 'no-token'); return; }
    fetch(API_URL, { headers: authHeaders(token) })
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
          if (remote[k] === undefined) return; // remote has nothing — never overwrite
          var localVal   = _origGet(k);
          var remoteTime = remoteTs[k] || 0;
          var localTime  = localTs[k]  || 0;

          // Only overwrite local if:
          // 1. We have no local data at all, OR
          // 2. Remote timestamp is strictly newer than local timestamp
          if (localVal === null || remoteTime > localTime) {
            if (remote[k] !== localVal) {
              _origSet(k, remote[k]);
              // adopt remote timestamp so we don't immediately push back
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
    if (key !== TOKEN_KEY && key !== LAST_SYNC_KEY && SYNC_KEYS.indexOf(key) !== -1) {
      setLocalTimestamp(key);
      schedulePush();
    }
  };

  /* ── on page load: pull then reload once if data changed ── */
  window.addEventListener('DOMContentLoaded', function () {
    if (!getToken()) {
      injectSyncWarning('Cloud sync is not active &mdash; your data is only stored in this browser and could be lost if it is cleared.');
      return;
    }
    var alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);
    doPull(function (ok, reason) {
      if (ok && reason === 'updated' && !alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      } else if (!ok) {
        var last = _origGet(LAST_SYNC_KEY);
        var hoursSince = last ? (Date.now() - new Date(last).getTime()) / 3600000 : Infinity;
        if (hoursSince > 24) {
          var days = Math.floor(hoursSince / 24);
          var daysMsg = hoursSince === Infinity ? ' No successful backup on record.' : ' Last successful backup was ' + days + ' day' + (days === 1 ? '' : 's') + ' ago.';
          injectSyncWarning('Sync is failing &mdash; your data is not being backed up.' + daysMsg);
        }
        updateSyncUI('error');
      } else {
        updateSyncUI('synced');
        sessionStorage.removeItem(RELOAD_FLAG);
      }
    });
  });

  /* ── sync health warning banner ── */
  function injectSyncWarning(msg) {
    if (document.getElementById('ph-sync-warning')) return;
    var el = document.createElement('div');
    el.id = 'ph-sync-warning';
    el.style.cssText = 'background:#7a1a1a;color:#fff;padding:0.65rem 1.4rem;text-align:center;font-size:0.82rem;font-family:sans-serif;position:sticky;top:0;z-index:99999;line-height:1.6;';
    el.innerHTML = '<strong>⚠ Sync warning:</strong> ' + msg + ' &mdash; <a href="/personal_hub.html" style="color:#ffd;text-underline-offset:2px;">Go to Hub to fix →</a>';
    if (document.body) {
      document.body.insertBefore(el, document.body.firstChild);
    }
  }

  /* ── push on tab close / navigation away (keepalive so browser doesn't kill it) ── */
  window.addEventListener('beforeunload', function () { doPush(true); });

  /* ── safety-net: push every 2 minutes while the page is open ── */
  setInterval(function () { if (getToken()) doPush(); }, 2 * 60 * 1000);

  /* ── sync status indicator (subtle, top-right of page) ── */
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

  /* ── public API (used by setup UI in personal_hub.html) ── */
  window.PhSync = {
    TOKEN_KEY:    TOKEN_KEY,
    LAST_SYNC_KEY: LAST_SYNC_KEY,
    getToken:     getToken,
    setToken: function (token, callback) {
      _origSet(TOKEN_KEY, token.trim());
      doPull(function (ok, reason) {
        if (ok) {
          updateSyncUI('synced');
          if (callback) callback(true, reason);
        } else {
          if (callback) callback(false, reason);
        }
      });
    },
    push:   function() { doPush(); },
    pull:   doPull,
    status: updateSyncUI
  };
})();
