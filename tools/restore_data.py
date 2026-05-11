#!/usr/bin/env python3
"""
Restore lost Personal Hub data by merging backup Gist data into the live sync Gist.
Keys where backup has MORE entries than sync are restored from backup.
All other keys are kept as-is from sync.
Timestamps for restored keys are set to Date.now() equivalent so they win on next pull.
"""
import json, sys, time, urllib.request

WORKER_URL = 'https://personal-hub-sync.alfieedworthy.workers.dev'
SYNC_FILE   = 'personal-hub-sync.json'
BACKUP_FILE = 'personal-hub-backup.json'

# Keys to restore from backup if backup has more entries
RESTORE_KEYS = [
    'ph_calendar_v3',
    'ph_recipes_v1',
    'ph_curiosity_favs_v1',
    'personal_hub_books_v2',
]

def fetch_gist():
    req = urllib.request.Request(WORKER_URL, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def count_entries(val):
    if not val:
        return 0
    try:
        parsed = json.loads(val)
        if isinstance(parsed, list):
            return len(parsed)
        if isinstance(parsed, dict):
            return len(parsed)
        return 1
    except:
        return 0

def main():
    print('Fetching Gist data...')
    gist = fetch_gist()

    sync_raw   = gist['files'][SYNC_FILE]['content']
    backup_raw = gist['files'][BACKUP_FILE]['content']
    sync   = json.loads(sync_raw)
    backup = json.loads(backup_raw)

    merged = dict(sync)  # start with all sync data
    ts = dict(merged.get('_timestamps', {}))
    now_ms = int(time.time() * 1000)

    changes = []
    for k in RESTORE_KEYS:
        s_count = count_entries(sync.get(k))
        b_count = count_entries(backup.get(k))
        if b_count > s_count:
            merged[k] = backup[k]
            ts[k] = now_ms + 1000  # slightly in the future so it always wins
            changes.append(f'  RESTORING {k}: backup={b_count} items > sync={s_count} items')
        else:
            changes.append(f'  KEEPING   {k}: sync={s_count} (backup={b_count})')

    if not any('RESTORING' in c for c in changes):
        print('No keys need restoring. Aborting.')
        for c in changes:
            print(c)
        return

    print('Changes to be applied:')
    for c in changes:
        print(c)

    merged['_timestamps'] = ts
    content = json.dumps(merged)

    payload = json.dumps({
        'files': {
            SYNC_FILE: {'content': content}
        }
    }).encode('utf-8')

    print(f'\nPushing merged data ({len(content)} bytes) to Gist via Worker...')
    req = urllib.request.Request(
        WORKER_URL,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        status = r.status
        resp = r.read().decode('utf-8')

    if status == 200:
        print(f'Done. HTTP {status} — data restored successfully.')
        print('Your Personal Hub will show restored data on next page load.')
    else:
        print(f'Unexpected HTTP {status}: {resp}')
        sys.exit(1)

if __name__ == '__main__':
    main()
