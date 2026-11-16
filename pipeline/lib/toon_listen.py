"""Listening jobs for pipeline/toon-listen.mjs.

Run with earshot's own Python (the models load once per run and every job in the file uses them):
    ~/.local/share/uv/tools/earshot/bin/python pipeline/lib/toon_listen.py job.json

job.json:
    {"mode": "film", "file": "...mp4", "sheet": "...png", "out": "...json"}
        what the finished video sounds like: loudness, every sound event with its time, level and
        what it sounds like, where the picture cuts are and whether a sound lands on them
    {"mode": "library", "items": [{"name", "file", "prompt"}], "out": "...json"}
        does each sound effect sound like its own description

Nothing leaves the machine: earshot runs on the CPU from its local model cache.
"""
import json
import os
import sys

os.environ.setdefault('EARSHOT_OFFLINE', '1')  # never download from here; `earshot doctor --fetch` does that once

from earshot import api  # noqa: E402


def film(job):
    out = {'measure': api.measure(job['file'], light=True)}
    tl = api.timeline(job['file'], detail=job.get('detail', 'normal'))
    out['timeline'] = {k: tl.get(k) for k in ('duration', 'loudness', 'events', 'sections', 'sync', 'cuts', 'summary') if k in tl}
    if job.get('sheet'):
        api.sheet(job['file'], job['sheet'])
        out['sheet'] = job['sheet']
    return out


def library(job):
    rows = []
    for it in job['items']:
        row = {'name': it['name']}
        try:
            m = api.match(it['file'], it['prompt'])
            d = api.describe(it['file'], top=3)
            row['match'] = {k: m.get(k) for k in ('verdict', 'z', 'cosine', 'summary', 'best', 'near') if k in m}
            row['describe'] = {k: d.get(k) for k in ('summary', 'tags', 'audioset') if k in d}
            row['measure'] = {k: d.get('measure', {}).get(k) for k in ('duration', 'lufs', 'peak_dbfs')}
        except Exception as e:  # one unreadable file must not stop the rest
            row['error'] = str(e)
        rows.append(row)
    return {'items': rows}


def main():
    with open(sys.argv[1]) as f:
        job = json.load(f)
    out = film(job) if job['mode'] == 'film' else library(job)
    with open(job['out'], 'w') as f:
        json.dump(out, f, default=str)


if __name__ == '__main__':
    main()
