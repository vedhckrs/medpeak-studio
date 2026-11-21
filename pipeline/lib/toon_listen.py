"""Listening jobs for pipeline/toon-listen.mjs.

Run with earshot's own Python (the models load once per run and every job in the file uses them):
    ~/.local/share/uv/tools/earshot/bin/python pipeline/lib/toon_listen.py job.json

job.json:
    {"mode": "film", "file": "...mp4", "sheet": "...png", "cues": {"events": [{"t", "kind", "id"}]}, "out": "...json"}
        what the finished video sounds like: loudness, every sound event with its time, level and
        what it sounds like, where the picture cuts are and whether a sound lands on them
    {"mode": "library", "items": [{"name", "file", "prompt"}], "out": "...json"}
        does each sound effect sound like its own description

    {"mode": "voices", "items": [{"id", "who", "file"}], "file": "...mp4", "against": "...mp4", "out": "...json"}
        every voiced line on its own (clear speech or a bad take, level, brightness, a late start, clipping),
        and the finished mix against an approved video's mix

Nothing leaves the machine: earshot runs on the CPU from its local model cache.
"""
import json
import os
import sys

os.environ.setdefault('EARSHOT_OFFLINE', '1')  # never download from here; `earshot doctor --fetch` does that once

from earshot import api  # noqa: E402


def film(job):
    out = {'measure': api.measure(job['file'], light=True)}
    cues = job.get('cues')  # the script's planned sounds: earshot checks a sound really lands on each
    tl = api.timeline(job['file'], cues=cues, detail=job.get('detail', 'normal'))
    loud = tl.get('loudness') or {}
    out['timeline'] = {k: tl.get(k) for k in ('duration', 'events', 'sections', 'sync', 'cuts', 'summary') if k in tl}
    # the loudness curves are long: keep the findings (holes, clipping, the loudest moment)
    out['timeline']['loudness'] = {k: loud.get(k) for k in ('integrated_lufs', 'true_peak_dbtp', 'lra_lu', 'silences', 'clipping', 'max_momentary', 'max_short_term', 'digital_silence')}
    if job.get('sheet'):
        api.sheet(job['file'], job['sheet'], cues=cues, tl=tl)
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


def voices(job):
    """Every voiced line on its own: is it heard as speech, how loud, how bright, does it start late or clip.
    Then the finished mix against an approved one (`against`), in words."""
    rows = []
    for it in job['items']:
        row = {'id': it['id'], 'who': it['who']}
        try:
            m = api.measure(it['file'], light=True)
            row['measure'] = {k: m.get(k) for k in ('duration', 'lufs', 'true_peak_dbtp', 'clipped_samples', 'noise_floor_dbfs', 'attack_at', 'brightness_hz', 'centroid_hz')}
            # earshot's text match is not validated for voices (it says so itself); its AudioSet labels are
            # the part that knows speech: "Speech", "Female speech", "Speech synthesizer", "Gasp"...
            d = api.describe(it['file'], top=6)
            row['describe'] = {k: d.get(k) for k in ('audioset',) if k in d}
        except Exception as e:  # one unreadable file must not stop the rest
            row['error'] = str(e)
        rows.append(row)
    out = {'items': rows}
    if job.get('against') and job.get('file'):
        try:
            ab = api.ab(job['against'], job['file'])
            out['ab'] = {k: ab.get(k) for k in ('summary', 'differences', 'a', 'b', 'verdict') if k in ab}
            out['ab_keys'] = list(ab.keys())
        except Exception as e:
            out['ab_error'] = str(e)
    return out


def main():
    with open(sys.argv[1]) as f:
        job = json.load(f)
    out = film(job) if job['mode'] == 'film' else voices(job) if job['mode'] == 'voices' else library(job)
    with open(job['out'], 'w') as f:
        json.dump(out, f, default=str)


if __name__ == '__main__':
    main()
