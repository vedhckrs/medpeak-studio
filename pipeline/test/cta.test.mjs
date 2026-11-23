// The narrator's end card (2026-11-22): quit-sugar and fasting went out with a silent card, because the clip was named by hand in
// each video's code. Now the render passes the paid clip in (toon.ctaClip) and the player plays it: every video with a clip gets it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ctaOf, V8_CTA} from '../../src/toons/v8/video.tsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
test('every video with a paid end-card clip plays its narrator, with beats in order inside the clip', () => {
  for (const slug of Object.keys(V8_CTA)) {
    const f = path.join(ROOT, 'videos', slug, 'cta-timings.json');
    if (!fs.existsSync(f)) continue;
    const t = JSON.parse(fs.readFileSync(f, 'utf8'));
    const seconds = t.seconds ?? t.words.at(-1).end;
    const toon = {...JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', slug, 'toon.json'), 'utf8')), ctaClip: {voice: `toons/${slug}/voice/cta.mp3`, seconds, words: t.words ?? []}};
    const c = ctaOf(toon);
    assert.ok(c?.voice, `${slug}: the end card has no narrator`);
    if (toon.format >= 6) continue; // format 6 (decision 25, option A): the short card shows its points together and Joey says only the follow line
    const [a, b, d] = c.at.points;
    assert.ok(a < b && b < d && d < c.at.follow && c.at.follow < seconds, `${slug}: the card's beats are out of order: ${[a, b, d, c.at.follow]}`);
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'toons-voice', slug, 'cta.mp3')), `${slug}: the clip is not kept in assets/`);
  }
});
