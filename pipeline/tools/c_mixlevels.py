"""The mix numbers of the audio A/B (engine v9 decision 23): free, local, numpy + ffmpeg.

    python pipeline/tools/c_mixlevels.py out/c-samples/audio-<slug>-A-old.wav out/c-samples/audio-<slug>-B-new.wav out/c-samples/audio-<slug>-spans.json

For each file: the level while someone talks (inside the voice clips) and in the pauses between them (dB RMS), their
difference (the reference: 2.7 dB; ours as it went out 11-13.5 dB), the bass (under 90 Hz, the music) under words against
in the pauses (the reference dips 2.6 dB), and the pauses of 0.5 s and 1 s or more.
"""
import json
import subprocess
import sys

import numpy as np

SR = 44100


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def lowpass(x, hz=90):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[f > hz] = 0
    return np.fft.irfft(X, len(x))


def db(x):
    return 10 * np.log10(np.mean(x.astype(np.float64) ** 2) + 1e-12)


def main():
    a, b, sp = sys.argv[1:4]
    spans = json.load(open(sp))
    out = {}
    for tag, path in (('A', a), ('B', b)):
        x = load(path)
        n = len(x)
        talk = np.zeros(n, bool)
        for s, e in spans[tag]:
            talk[int(s * SR):min(n, int(e * SR))] = True
        start = int(spans[tag][0][0] * SR)
        gap = ~talk
        gap[:start] = False
        lo = lowpass(x)
        # pauses: runs of no voice, from the first word on
        runs, run = [], 0
        for v in gap[start:][::441]:  # 10 ms steps
            if v:
                run += 1
            elif run:
                runs.append(run / 100)
                run = 0
        stems = {}
        for k in ('voice', 'music'):
            try:
                stems[k] = load(path.replace(f'-{"A-old" if tag == "A" else "B-new"}.wav', f'-{tag}-{k}.wav'))[:n]
            except Exception:
                stems = {}
                break
        if stems:
            v, m = stems['voice'], stems['music']
            out[tag + '_stems'] = {
                'voice_minus_music_in_pauses_db': round(db(v[talk]) - db(m[gap]), 1),
                'music_dip_under_words_db': round(db(m[gap]) - db(m[talk]), 1),
                'music_in_pauses_vs_A_db': None,
                '_music_pause_db': round(db(m[gap]), 2),
            }
        out[tag] = {
            'voice_db': round(db(x[talk]), 1), 'pause_db': round(db(x[gap]), 1), 'voice_minus_pause_db': round(db(x[talk]) - db(x[gap]), 1),
            'music_dip_under_words_db': round(db(lo[gap]) - db(lo[talk]), 1),
            'pauses_0.5s': int(sum(r >= 0.5 for r in runs)), 'pauses_1s': int(sum(r >= 1.0 for r in runs)), 'talking_share': round(float(talk[start:].mean()), 2),
        }
    if 'A_stems' in out and 'B_stems' in out:
        out['B_stems']['music_in_pauses_vs_A_db'] = round(out['B_stems']['_music_pause_db'] - out['A_stems']['_music_pause_db'], 1)
    print(json.dumps(out, indent=1))


if __name__ == '__main__':
    main()
