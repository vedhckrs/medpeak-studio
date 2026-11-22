// Camera jumps (the owner on fasting, 2026-11-22: "camera jump bugs"). The v8 shots set their OWN framings per line (`view`), and the
// camera check read only the script's camera words, so 9 jump cuts passed. This test reads the real framings: inside a shot, a new
// framing of the same place must change the size at least 1.5 times (or not change at all). Videos already on the channel are left
// as they are (fixes go to the next videos).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {V8_VIDEOS} from '../../src/toons/v8/video.tsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT = new Set(['rabies', 'no-sleep', 'creatine', 'quit-sugar']);
test('no jump cut inside a shot: a new framing changes the size 1.5 times or more', () => {
  for (const [slug, shots] of Object.entries(V8_VIDEOS)) {
    if (OUT.has(slug)) continue;
    const toon = JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', slug, 'toon.json'), 'utf8'));
    for (const sh of toon.shots) {
      const def = shots[sh.id];
      if (!def?.view) continue;
      const lines = sh.lines.map((l) => ({id: l.id, from: 0, voice: 1, words: []}));
      const views = [null, ...sh.lines.map((l) => l)].map((l) => def.view({id: sh.id, t: 0, dur: 1, lines, cur: l ? {id: l.id, from: 0, voice: 1, words: []} : null}));
      for (let i = 1; i < views.length; i++) {
        const a = views[i - 1], b = views[i];
        if (a.x === b.x && a.y === b.y && a.z === b.z) continue;
        const r = Math.max(a.z, b.z) / Math.min(a.z, b.z);
        const moved = Math.hypot(a.x - b.x, a.y - b.y) >= 300; // a cut to another subject (another character, another place)
        assert.ok(r >= 1.5 || moved, `${slug} shot ${sh.id}: a jump cut before ${sh.lines[i - 1]?.id ?? 'the first line'} (size x${r.toFixed(2)})`);
      }
    }
  }
});
