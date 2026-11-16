#!/usr/bin/env node
/**
 * Sound check: how many sound effects a Toon has, how far apart, and (when the voices are made)
 * how loud the voices, the effects and the music are against each other. Free.
 *
 *   node pipeline/toon-sound.mjs <slug>       (or: npm run toon:sound -- <slug>)
 *   node pipeline/toon-sound.mjs --all
 *   node pipeline/toon-sound.mjs <slug> --list    # every sound with its time and reason
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {checkSound} from './lib/toon-sound.mjs';
import {TOON_FPS} from '../src/toons/director.ts';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((s) => (s.lines ?? []).every((l) => stored.lines[l.id]?.text === l.text));
  const r = checkSound(toon, voiced ? stored : null);
  console.log(`\nSOUND  ${toon.title}  (${voiced ? 'voiced' : 'estimated'} ${r.seconds.toFixed(1)} s${r.measured ? ', layers measured' : ', layers not measured: voices are not on this machine'})`);
  for (const x of r.results) console.log(`  ${x.pass ? 'PASS' : 'FAIL'}  ${x.point.padEnd(34)} ${x.detail}`);
  if (a.list) for (const e of r.plan) console.log(`        ${(e.at / TOON_FPS).toFixed(1).padStart(5)} s  ${e.name.padEnd(20)} ${e.why}`);
  ok &&= r.ok;
}
console.log(ok ? '\nALL PASS' : '\nFAILED: fewer or quieter sounds (director.ts SOUND, or the script\'s "sfx").');
process.exit(ok ? 0 : 1);
