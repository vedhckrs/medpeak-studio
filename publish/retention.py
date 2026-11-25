"""The opening, measured on YouTube: how many viewers each Short keeps at 6 s, 15 s, halfway and the end. Read-only, free.

    ~/.config/youtube-analytics/venv/bin/python publish/retention.py            # the last 20 uploads -> table + plans/data/retention-<date>.md
    ~/.config/youtube-analytics/venv/bin/python publish/retention.py --days 60  # the window the curves are read over

Why (plans/opening-upgrade-2026-11-25.md): every Short gets the same first push from the Shorts feed; the weak ones lost half
their viewers by 15 s, the strong ones kept about 0.75. Read it every Tuesday (and on Thursday 27 Nov for the first v9 videos).
A value over 1.00 means people re-watched that part. YouTube's curves lag about two days, so a new Short shows "no data" first.
"""
import argparse, datetime, os, re, sys

sys.path.insert(0, os.path.expanduser('~/.config/youtube-analytics'))
from yt_analytics import creds  # noqa: E402
from googleapiclient.discovery import build  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = 0.70  # still watching at 15 s (the strong Shorts held about 0.74; the weak ones about 0.50)


def seconds(iso):
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso or '')
    return sum(int(x or 0) * k for x, k in zip(m.groups(), (3600, 60, 1))) if m else 0


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--days', type=int, default=45)
    a.add_argument('--count', type=int, default=20)
    args = a.parse_args()
    c = creds()
    yt, ya = build('youtube', 'v3', credentials=c), build('youtubeAnalytics', 'v2', credentials=c)
    up = yt.channels().list(part='contentDetails', mine=True).execute()['items'][0]['contentDetails']['relatedPlaylists']['uploads']
    ids = [i['contentDetails']['videoId'] for i in yt.playlistItems().list(part='contentDetails', playlistId=up, maxResults=min(50, args.count)).execute()['items']]
    vids = yt.videos().list(part='snippet,statistics,status,contentDetails', id=','.join(ids)).execute()['items']
    end = datetime.date.today()
    start = end - datetime.timedelta(days=args.days)
    rows = []
    for v in sorted(vids, key=lambda x: x['snippet']['publishedAt'], reverse=True):
        if v['status']['privacyStatus'] != 'public':
            continue
        dur = seconds(v['contentDetails']['duration'])
        if not dur or dur > 180:
            continue  # Shorts only
        r = ya.reports().query(ids='channel==MINE', startDate=str(start), endDate=str(end), metrics='audienceWatchRatio',
                               dimensions='elapsedVideoTimeRatio', filters=f"video=={v['id']}").execute().get('rows', [])
        at = lambda sec: min(r, key=lambda x: abs(x[0] - sec / dur))[1] if r else None  # noqa: E731
        rows.append({'title': v['snippet']['title'][:48], 'id': v['id'], 'published': v['snippet']['publishedAt'][:10],
                     'views': int(v['statistics'].get('viewCount', 0)), 'dur': dur,
                     's6': at(6), 's15': at(15), 'half': at(dur / 2), 'end': at(dur * 0.95)})
    f = lambda x: '  -  ' if x is None else f'{x:.2f}'  # noqa: E731
    lines = [f'# Retention of the Shorts, read {end} (window {start} to {end})', '',
             f'Still watching (1.00 = everyone who started). Target at 15 s: {TARGET:.2f} or more.', '',
             '| Published | Short | Views | at 6 s | at 15 s | halfway | end | 15 s target |', '|---|---|---|---|---|---|---|---|']
    for x in rows:
        ok = '' if x['s15'] is None else ('yes' if x['s15'] >= TARGET else 'NO')
        lines.append(f"| {x['published']} | {x['title']} | {x['views']} | {f(x['s6'])} | {f(x['s15'])} | {f(x['half'])} | {f(x['end'])} | {ok} |")
    text = '\n'.join(lines) + '\n'
    print(text)
    out = os.path.join(ROOT, 'plans', 'data', f'retention-{end}.md')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w') as fh:
        fh.write(text)
    print('written:', os.path.relpath(out, ROOT))


if __name__ == '__main__':
    main()
