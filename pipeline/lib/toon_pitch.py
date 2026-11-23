"""The median speaking pitch (f0, Hz) of voice clips, free and local (numpy + ffmpeg).

earshot's `measure` reports loudness and brightness but no pitch, so check A4 of engine v9 ("voices apart": speakers of a scene
3+ semitones apart, 30-55% of the body cast's lines above 250 Hz) never had a number. This reads it.

  python3 pipeline/lib/toon_pitch.py out.json a.mp3 b.mp3 ...   ->  {"a.mp3": 212.4, "b.mp3": null, ...}

Method: 16 kHz mono, 40 ms frames every 10 ms; a frame is voiced when it is loud (within 25 dB of the clip's loudest frame) and
its normalised autocorrelation peak in 70-500 Hz is 0.5 or more (a cleaner YIN-like test is not needed for a median). The clip's
pitch is the median over voiced frames; null when under 10 frames are voiced.
"""
import json
import subprocess
import sys

import numpy as np

SR = 16000
FRAME, HOP = int(0.04 * SR), int(0.01 * SR)
LO, HI = 70, 500


def samples(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)


def f0_of(path):
    x = samples(path)
    if x.size < FRAME * 3:
        return None
    frames = np.lib.stride_tricks.sliding_window_view(x, FRAME)[::HOP]
    rms = np.sqrt((frames ** 2).mean(1)) + 1e-9
    loud = 20 * np.log10(rms) > 20 * np.log10(rms.max()) - 25
    lag_lo, lag_hi = SR // HI, SR // LO
    out = []
    win = np.hanning(FRAME)
    for f, ok in zip(frames, loud):
        if not ok:
            continue
        g = (f - f.mean()) * win
        ac = np.correlate(g, g, 'full')[FRAME - 1:]
        if ac[0] <= 0:
            continue
        ac = ac / ac[0]
        seg = ac[lag_lo:lag_hi]
        i = int(np.argmax(seg))
        if seg[i] < 0.5:
            continue
        lag = i + lag_lo
        # parabolic refinement of the peak
        if 0 < i < len(seg) - 1:
            a, b, c = seg[i - 1], seg[i], seg[i + 1]
            d = a - 2 * b + c
            if d != 0:
                lag = lag + 0.5 * (a - c) / d
        out.append(SR / lag)
    return round(float(np.median(out)), 1) if len(out) >= 10 else None


if __name__ == '__main__':
    out_path, files = sys.argv[1], sys.argv[2:]
    json.dump({f: f0_of(f) for f in files}, open(out_path, 'w'), indent=1)
