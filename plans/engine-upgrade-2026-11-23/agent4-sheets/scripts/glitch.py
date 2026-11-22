"""Find one-frame glitches (A->B->A) and big single-frame jumps outside cuts.
Reads the video at 60fps (or native) downscaled to 270x480 grey via ffmpeg pipe."""
import sys, subprocess, numpy as np, json
path = sys.argv[1]; end = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
W, H = 270, 480
cmd = ["ffmpeg", "-v", "error", "-i", path, "-t", str(end), "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
raw = subprocess.run(cmd, capture_output=True).stdout
n = len(raw) // (W * H)
F = np.frombuffer(raw, np.uint8)[: n * W * H].reshape(n, H, W).astype(np.int16)
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 60.0
# mask caption band y 1200-1640 of 1920 -> rows 300-410
mask = np.ones((H, W), bool); mask[300:410] = False
out = []
for i in range(1, n - 1):
    a, b, c = F[i - 1], F[i], F[i + 1]
    ab = (np.abs(a - b) > 25) & mask
    ac = (np.abs(a - c) > 25) & mask
    bc = (np.abs(b - c) > 25) & mask
    fab, fac, fbc = ab.mean(), ac.mean(), bc.mean()
    # one-frame blip: b differs from both a and c, a~c
    if fab > 0.004 and fbc > 0.004 and fac < 0.35 * min(fab, fbc):
        ys, xs = np.nonzero(ab)
        out.append({"t": round(i / fps, 3), "kind": "blip", "area": round(float(fab), 4),
                    "box": [int(xs.min()) * 4, int(ys.min()) * 4, int(xs.max()) * 4, int(ys.max()) * 4]})
print(json.dumps(out))
