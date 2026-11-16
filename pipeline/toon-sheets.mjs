#!/usr/bin/env node
/**
 * MedPeak Toons: render the character boards (free, local).
 *
 *   node pipeline/toon-sheets.mjs                 # all boards + every model sheet
 *   node pipeline/toon-sheets.mjs stomach doctor  # only these model sheets
 *   node pipeline/toon-sheets.mjs --boards        # only the boards: cast, blueprint, camera and lenses, sets, stage
 *
 * Output: out/toons/sheets/. After adding a character (a Blueprint in src/toons/characters.tsx or a
 * HumanSpec in src/toons/humans.tsx), add its name to ORDER in src/toons/Preview.tsx, render its
 * sheet and check it against skill/medpeak-health/references/toons-blueprint.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT} from './lib/util.mjs';

const argv = process.argv.slice(2);
const boardsOnly = argv.includes('--boards');
const names = argv.filter((a) => !a.startsWith('--'));
const src = fs.readFileSync(path.join(ROOT, 'src/toons/Preview.tsx'), 'utf8');
const all = [...src.match(/export const ORDER: string\[\] = \[([^\]]+)\]/)[1].matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
const out = path.join(ROOT, 'out/toons/sheets');
fs.mkdirSync(out, {recursive: true});
const still = (comp, file, props) => execFileSync('npx', ['remotion', 'still', 'src/index.ts', comp, path.join(out, file), '--log=error', '--timeout=90000', ...(props ? [`--props=${JSON.stringify(props)}`] : [])], {cwd: ROOT, stdio: 'inherit'});

if (!names.length) {
  still('ToonCast', 'cast.jpg');
  still('ToonBlueprint', 'blueprint.jpg');
  still('ToonCamera', 'camera.jpg');
  still('ToonSets', 'sets.jpg');
  still('ToonStage', 'stage.jpg');
  console.log('boards done');
}
if (!boardsOnly) {
  for (const who of names.length ? names : all) {
    if (!all.includes(who)) { console.error(`Unknown character "${who}". Known: ${all.join(', ')}`); process.exit(1); }
    still('ToonSheet', `sheet-${who}.jpg`, {who});
    console.log(`sheet: ${who}`);
  }
}
console.log(`Saved in ${path.relative(ROOT, out)}`);
