/* ── Personal Hub Cloud Sync ─────────────────────────────────────────────────
   Push always fetches remote first and merges — newer timestamp wins per key.
   This means no device can ever overwrite a change made on another device.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var WORKER_URL   = 'https://personal-hub-sync.alfieedworthy.workers.dev';
  var GIST_FILE    = 'personal-hub-sync.json';
  var BACKUP_FILE  = 'personal-hub-backup.json';
  var BACKUP_DATE_KEY = 'ph_backup_date';

  var LAST_SYNC_KEY = 'ph_sync_last';
  var RELOAD_FLAG   = 'ph_sync_reloaded_' + location.pathname;

  var SYNC_KEYS = [
    'ph_calendar_v3',
    'ph_todos_v1',
    'ph_wishlist_v1',
    'personal_hub_goals',
    'personal_hub_achievements',
    'personal_hub_checkins',
    'personal_hub_books_v2',
    'personal_hub_books_order',
    'personal_hub_books_order_reading',
    'personal_hub_books_order_toread',
    'ph_recipes_v1',
    'personal_hub_meal_planner_v2',
    'ph_films_log_v1',
    'ph_ex_routines_v1',
    'ph_ex_logs_v1',
    'ph_ex_acts_v1',
    'ph_curiosity_favs_v1',
    'ph_philosophy_favs_v1',
    'ph_wordle_v1',
    'ph_wordle_stats_v1',
    'ph_vocab_v1',
    'reads_daily',
    'ph_budget_v1',
  ];

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

  // Discard timestamps more than 1 hour in the future — they block incoming changes.
  function sanitiseTs(ts) {
    var nowMs = Date.now();
    var out = {};
    Object.keys(ts).forEach(function(k) {
      out[k] = ts[k] > nowMs + 3600000 ? 0 : ts[k];
    });
    return out;
  }

  /* ── push: fetch remote → merge (newer wins per key) → write back ── */
  var pushTimer    = null;
  var pushInFlight = false;
  var sessionChanged = false;

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 800);
  }

  function doPush() {
    if (pushInFlight) return;
    var hasData = SYNC_KEYS.some(function(k) { return _origGet(k) !== null; });
    if (!hasData) return;
    pushInFlight = true;

    // Step 1: fetch current remote state
    fetch(WORKER_URL)
      .then(function(r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function(gist) {
        var remote = {};
        try {
          if (gist.files && gist.files[GIST_FILE]) {
            remote = JSON.parse(gist.files[GIST_FILE].content);
          }
        } catch(e) {}

        var remoteTs = remote._timestamps || {};
        var localTs  = sanitiseTs(getLocalTimestamps());
        var nowMs    = Date.now();
        var merged   = { _timestamps: {} };

        // Step 2: for each key, winner is whichever side has the newer timestamp
        SYNC_KEYS.forEach(function(k) {
          var localVal   = _origGet(k);
          var remoteVal  = remote[k];
          var localTime  = localTs[k]  || 0;
          var remoteTime = remoteTs[k] || 0;

          if (localVal !== null && localTime >= remoteTime) {
            // Local is at least as recent — use it
            merged[k] = localVal;
            merged._timestamps[k] = localTime || nowMs;
          } else if (remoteVal !== undefined) {
            // Remote is newer — use remote and bring local up to date
            merged[k] = remoteVal;
            merged._timestamps[k] = remoteTime;
            if (remoteVal !== localVal) {
              _origSet(k, remoteVal);
              var ts = getLocalTimestamps();
              ts[k] = remoteTime;
              _origSet(TIMESTAMPS_KEY, JSON.stringify(ts));
            }
          }
        });

        // Step 3: write merged result back
        var content = JSON.stringify(merged);
        var files = {};
        files[GIST_FILE] = { content: content };
        var today = new Date().toISOString().slice(0, 10);
        if (_origGet(BACKUP_DATE_KEY) !== today) {
          files[BACKUP_FILE] = { content: content };
          _origSet(BACKUP_DATE_KEY, today);
        }
        return fetch(WORKER_URL, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ files: files })
        });
      })
      .then(function() {
        pushInFlight = false;
        _origSet(LAST_SYNC_KEY, new Date().toISOString());
        updateSyncUI('synced');
      })
      .catch(function() {
        pushInFlight = false;
        updateSyncUI('error');
      });
  }

  /* ── pull: Gist → localStorage (newer remote wins) ── */
  function doPull(callback) {
    fetch(WORKER_URL)
      .then(function(r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function(gist) {
        if (!gist.files || !gist.files[GIST_FILE]) {
          if (callback) callback(false, 'empty');
          return;
        }
        var remote   = JSON.parse(gist.files[GIST_FILE].content);
        var remoteTs = remote._timestamps || {};
        var localTs  = sanitiseTs(getLocalTimestamps());
        var changed  = false;

        // A device with no timestamps pre-dates the system — always defer to remote.
        var localHasTimestamps = _origGet(TIMESTAMPS_KEY) !== null;

        SYNC_KEYS.forEach(function(k) {
          if (remote[k] === undefined) return;
          var localVal   = _origGet(k);
          var remoteTime = remoteTs[k] || 0;
          var localTime  = localTs[k]  || 0;

          if (localVal === null || remoteTime > localTime || !localHasTimestamps) {
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
      .catch(function() {
        if (callback) callback(false, 'fetch-error');
      });
  }

  /* ── intercept localStorage.setItem to timestamp and push changes ── */
  localStorage.setItem = function(key, value) {
    _origSet(key, value);
    if (key !== LAST_SYNC_KEY && SYNC_KEYS.indexOf(key) !== -1) {
      setLocalTimestamp(key);
      sessionChanged = true;
      schedulePush();
    }
  };

  /* ── on page load: pull, reload if data changed, then push ── */
  window.addEventListener('DOMContentLoaded', function() {
    var alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);

    var localLooksEmpty = !alreadyReloaded && !SYNC_KEYS.some(function(k) {
      return _origGet(k) !== null;
    });
    if (localLooksEmpty) {
      document.documentElement.style.visibility = 'hidden';
      setTimeout(function() { document.documentElement.style.visibility = ''; }, 4000);
    }

    doPull(function(ok, reason) {
      if (ok && reason === 'updated' && !alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      } else {
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

  /* ── on tab close: push only if changes were made this session ── */
  window.addEventListener('beforeunload', function() {
    if (!sessionChanged) return;
    // Changes made this session have fresh timestamps so they win correctly.
    // Use sendBeacon for reliability on unload.
    var ts  = sanitiseTs(getLocalTimestamps());
    var data = { _timestamps: ts };
    SYNC_KEYS.forEach(function(k) { var v = _origGet(k); if (v !== null) data[k] = v; });
    var body = JSON.stringify({ files: { 'personal-hub-sync.json': { content: JSON.stringify(data) } } });
    try {
      navigator.sendBeacon(WORKER_URL, new Blob([body], { type: 'application/json' }));
    } catch(e) {}
  });

  /* ── safety-net: merge-push every 5 minutes ── */
  setInterval(doPush, 5 * 60 * 1000);

  /* ── sync health warning ── */
  function injectSyncWarning(msg) {
    if (document.getElementById('ph-sync-warning')) return;
    var el = document.createElement('div');
    el.id = 'ph-sync-warning';
    el.style.cssText = 'background:#7a1a1a;color:#fff;padding:0.65rem 1.4rem;text-align:center;font-size:0.82rem;font-family:sans-serif;position:sticky;top:0;z-index:99999;line-height:1.6;';
    el.innerHTML = '<strong>&#9888; Sync warning:</strong> ' + msg;
    if (document.body) document.body.insertBefore(el, document.body.firstChild);
  }

  function updateSyncUI(state) {
    var el = document.getElementById('ph-sync-indicator');
    if (!el) return;
    if (state === 'synced') { el.textContent = '✓ Synced'; el.style.color = '#3a3'; }
    else if (state === 'error') { el.textContent = '⚠ Sync error'; el.style.color = '#c33'; }
  }

  window.PhSync = {
    LAST_SYNC_KEY: LAST_SYNC_KEY,
    push:   doPush,
    pull:   doPull,
    status: updateSyncUI
  };
})();
