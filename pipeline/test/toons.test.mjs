import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../lib/util.mjs';
import {loadCast} from '../lib/toon-audio.mjs';
import {LIBRARY} from '../toon-sfx.mjs';
import {BEDS} from '../toon-music.mjs';

const EMOTIONS = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'];
const cast = loadCast();
const toons = fs.readdirSync(path.join(ROOT, 'videos'))
  .map((d) => path.join(ROOT, 'videos', d, 'toon.json'))
  .filter((f) => fs.existsSync(f))
  .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));

test('every Toons character has one fixed voice', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'toons', 'Preview.tsx'), 'utf8');
  const order = src.match(/export const ORDER[^=]*=\s*\[([\s\S]*?)\]/)[1].match(/'([a-z]+)'/g).map((s) => s.slice(1, -1));
  assert.ok(order.length >= 25);
  for (const who of order) {
    const c = cast.cast[who];
    assert.ok(c, `no voice for ${who}`);
    assert.match(c.voiceId, /^[A-Za-z0-9]{20}$/, `${who} voice id`);
    assert.ok(Math.abs(c.pitch) <= 6, `${who} pitch is too far from natural`);
  }
  for (const e of EMOTIONS) assert.ok(cast.acting[e], `no acting settings for ${e}`);
});

test('the sound-effect library has every sound the player can ask for', () => {
  const names = new Set(LIBRARY.map(([n]) => n));
  assert.equal(names.size, LIBRARY.length, 'duplicate effect name');
  const player = fs.readFileSync(path.join(ROOT, 'src', 'toons', 'Player.tsx'), 'utf8');
  const auto = player.match(/EMO_SFX[^=]*=\s*\{([\s\S]*?)\}/)[1].match(/'([a-z-]+)'/g).map((s) => s.slice(1, -1));
  for (const n of [...auto, 'whoosh-soft', 'swish', 'caption-pop']) assert.ok(names.has(n), `missing effect ${n}`);
  for (const [n, d, prompt] of LIBRARY) {
    assert.ok(d >= 0.3 && d <= 2, `${n} length`);
    assert.ok(prompt.length > 12, `${n} prompt`);
  }
});

test('toon scripts only use the cast, the library and the music beds', () => {
  const sfx = new Set(LIBRARY.map(([n]) => n));
  const beds = new Set(BEDS.map(([n]) => n));
  for (const toon of toons) {
    if (toon.music) assert.ok(beds.has(toon.music), `${toon.slug}: unknown music bed ${toon.music}`);
    const ids = new Set();
    for (const shot of toon.shots) {
      const here = new Set(shot.cast.map((a) => a.who));
      for (const line of shot.lines) {
        assert.ok(!ids.has(line.id), `${toon.slug}: line id ${line.id} is used twice`);
        ids.add(line.id);
        assert.ok(here.has(line.who), `${toon.slug} ${line.id}: ${line.who} is not in the shot`);
        assert.ok(cast.cast[line.who], `${toon.slug} ${line.id}: no voice for ${line.who}`);
        if (line.emotion) assert.ok(EMOTIONS.includes(line.emotion), `${toon.slug} ${line.id}: emotion`);
        if (line.sfx) assert.ok(sfx.has(line.sfx), `${toon.slug} ${line.id}: unknown effect ${line.sfx}`);
        if (line.key) assert.ok(line.text.toLowerCase().includes(line.key.toLowerCase()), `${toon.slug} ${line.id}: key word is not in the line`);
      }
    }
  }
});
