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
    'personal_hub_goals'
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

  /* ── push: localStorage → Gist ── */
  var pushTimer = null;
  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 800);
  }

  function doPush() {
    var token = getToken();
    if (!token) return;
    var data = {};
    SYNC_KEYS.forEach(function (k) {
      var v = _origGet(k);
      if (v !== null) data[k] = v;
    });
    var files = {};
    files[GIST_FILE] = { content: JSON.stringify(data) };
    fetch(API_URL, {
      method:  'PATCH',
      headers: authHeaders(token),
      body:    JSON.stringify({ files: files })
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
        var changed = false;
        SYNC_KEYS.forEach(function (k) {
          if (remote[k] !== undefined && remote[k] !== _origGet(k)) {
            _origSet(k, remote[k]);
            changed = true;
          }
        });
        _origSet(LAST_SYNC_KEY, new Date().toISOString());
        if (callback) callback(true, changed ? 'updated' : 'same');
      })
      .catch(function (err) {
        if (callback) callback(false, 'fetch-error');
      });
  }

  /* ── intercept localStorage.setItem to auto-push ── */
  localStorage.setItem = function (key, value) {
    _origSet(key, value);
    if (key !== TOKEN_KEY && key !== LAST_SYNC_KEY && SYNC_KEYS.indexOf(key) !== -1) {
      schedulePush();
    }
  };

  /* ── on page load: pull then reload once if data changed ── */
  window.addEventListener('DOMContentLoaded', function () {
    if (!getToken()) return;
    var alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);
    doPull(function (ok, reason) {
      if (ok && reason === 'updated' && !alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      } else {
        updateSyncUI('synced');
        sessionStorage.removeItem(RELOAD_FLAG);
      }
    });
  });

  /* ── push on tab close / navigation away ── */
  window.addEventListener('beforeunload', function () { doPush(); });

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
    push:    doPush,
    pull:    doPull,
    status:  updateSyncUI
  };
})();
