#!/usr/bin/env node
/**
 * Camera check: measures the camera on every frame of a Toon and lists anything that would look
 * like a jump (free, a second or two per script).
 *
 *   node --import tsx pipeline/toon-camera.mjs <slug>     (or: npm run toon:camera -- <slug>)
 *   node --import tsx pipeline/toon-camera.mjs --all
 *
 * Exit code 1 when a script has a jolt, a jump cut or a wrong picture.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {scanCamera} from './lib/toon-camera.mjs';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((s) => s.lines.every((l) => stored.lines[l.id]?.text === l.text));
  const r = await scanCamera(toon, voiced ? stored : null);
  console.log(`\nCAMERA  ${toon.title}  (${voiced ? 'voiced' : 'estimated'} ${r.seconds.toFixed(1)} s, ${r.pictures} pictures, ${r.cleanCuts} clean cuts)`);
  for (const [label, rows] of [['wrong picture', r.wrong], ['jump cut', r.jumpCuts], ['jolt inside a shot', r.jolts]]) {
    console.log(`  ${rows.length ? 'FAIL' : 'PASS'}  ${label.padEnd(20)} ${rows.length}`);
    for (const row of rows.slice(0, 12)) console.log(`        ${row}`);
  }
  ok &&= r.ok;
}
console.log(ok ? '\nALL PASS' : '\nFAILED: the camera jumps; fix the script or the director.');
process.exit(ok ? 0 : 1);
