"""Speech-to-text for pipeline/toon-listen.mjs --words.

Run with parakeet-mlx's own Python (the model loads once and writes down every clip in the job):
    ~/.local/share/uv/tools/parakeet-mlx/bin/python pipeline/lib/toon_words.py job.json

job.json: {"model": "<folder of the pinned model>", "items": [{"id", "file"}], "out": "...json"}
out:      {"items": [{"id", "text", "words": [{"w", "start", "end", "conf"}]}]}

Nothing leaves the machine: the model is read from the local Hugging Face cache and the hub is
switched off for the run.
"""
import json
import os
import sys

os.environ.setdefault('HF_HUB_OFFLINE', '1')

from parakeet_mlx import from_pretrained  # noqa: E402


def words_of(result):
    """The model writes in word pieces; a piece that begins with a space begins a new word."""
    out = []
    for s in result.sentences:
        for t in s.tokens:
            end = t.end or (t.start + t.duration)
            if t.text.startswith(' ') or not out:
                out.append({'w': t.text.strip(), 'start': round(t.start, 3), 'end': round(end, 3), 'conf': round(float(t.confidence), 3)})
            else:
                w = out[-1]
                w['w'] += t.text
                w['end'] = round(end, 3)
                w['conf'] = round(min(w['conf'], float(t.confidence)), 3)  # a word is as sure as its least sure piece
    return [w for w in out if w['w']]


def main():
    with open(sys.argv[1]) as f:
        job = json.load(f)
    model = from_pretrained(job['model'])
    rows = []
    for it in job['items']:
        try:
            r = model.transcribe(it['file'])
            rows.append({'id': it['id'], 'text': r.text.strip(), 'words': words_of(r)})
        except Exception as e:  # one unreadable file must not stop the rest
            rows.append({'id': it['id'], 'error': str(e)})
    with open(job['out'], 'w') as f:
        json.dump({'items': rows}, f)


if __name__ == '__main__':
    main()
