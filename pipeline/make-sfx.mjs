#!/usr/bin/env node
/**
 * Sound effects, synthesised with ffmpeg (free, no licence questions). Quiet, soft, medical-clean.
 * Writes public/sfx/<name>.wav. Run once per machine (render.mjs runs it if missing).
 *
 *   whoosh   panel/scene change        pop     a label or icon lands
 *   tick     a counter or list item    impact  a big number / chapter card
 *   riser    the build into the twist  heart   a soft heartbeat (body scenes)
 *   bubble   cells, blood, molecules   chime   the payoff / best point
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {isMain, PUBLIC} from './lib/util.mjs';

export const SFX = {
  whoosh: 'anoisesrc=d=0.6:c=pink:a=0.6,highpass=f=300,lowpass=f=4000,afade=t=in:d=0.25,afade=t=out:st=0.3:d=0.3,volume=0.5',
  pop: 'sine=f=880:d=0.12,afade=t=out:st=0.02:d=0.1,volume=0.5',
  tick: 'sine=f=1600:d=0.05,afade=t=out:st=0.01:d=0.04,volume=0.35',
  impact: 'sine=f=55:d=0.9,afade=t=out:st=0.05:d=0.85,volume=0.9',
  riser: 'anoisesrc=d=1.6:c=white:a=0.35,highpass=f=800,afade=t=in:d=1.4,afade=t=out:st=1.45:d=0.15,volume=0.45',
  heart: 'sine=f=60:d=0.14,afade=t=out:st=0.02:d=0.12,apad=pad_dur=0.12,volume=0.9',
  bubble: 'sine=f=500:d=0.18,vibrato=f=18:d=0.8,afade=t=out:st=0.03:d=0.15,volume=0.35',
  chime: 'sine=f=1318:d=1.2,afade=t=out:st=0.05:d=1.1,volume=0.3',
};

export const makeSfx = (force = false) => {
  const dir = path.join(PUBLIC, 'sfx');
  fs.mkdirSync(dir, {recursive: true});
  for (const [name, filter] of Object.entries(SFX)) {
    const out = path.join(dir, `${name}.wav`);
    if (fs.existsSync(out) && !force) continue;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', filter, '-ac', '2', '-ar', '44100', out]);
  }
  return dir;
};

if (isMain(import.meta.url)) {
  console.log(`SFX ready in ${makeSfx(process.argv.includes('--force'))}`);
}
