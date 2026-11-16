#!/usr/bin/env node
/**
 * Toon script gate: a Toon is checked BEFORE any voice is made (free, instant).
 *
 *   node pipeline/toon-check.mjs <slug>               # check one script, print the table
 *   node pipeline/toon-check.mjs --all                # every videos/<slug>/toon.json (CI runs this)
 *   node pipeline/toon-check.mjs <slug> --sheet       # also write videos/<slug>/SCRIPT.md (for the owner)
 *   node pipeline/toon-check.mjs <slug> --check-urls  # also open every source link
 *
 * Four groups: the script is valid, Retention 7 (dialogue), the Toons format, medical accuracy.
 * Exit code 1 when anything fails: a failing script is fixed, never approved "with a note".
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {loadCast} from './lib/toon-audio.mjs';
import {checkToon, scriptSheet} from './lib/toon-rules.mjs';
import {LIBRARY} from './toon-sfx.mjs';
import {BEDS} from './toon-music.mjs';

const known = () => ({cast: Object.keys(loadCast().cast), sfx: LIBRARY.map(([n]) => n), beds: BEDS.map(([n]) => n)});
const GROUPS = {script: 'SCRIPT', retention: 'RETENTION 7', format: 'TOONS FORMAT', accuracy: 'MEDICAL ACCURACY'};

const checkUrls = async (toon) => {
  let bad = 0;
  for (const s of toon.sources ?? []) {
    let status = 'no answer';
    let ok = false;
    try {
      const pmid = s.url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)?.[1];
      if (pmid) {
        // PubMed's website turns scripts away, so the record is checked through its data service
        const d = await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}&tool=medpeak-studio`)).json();
        ok = !!d.result?.[pmid]?.title;
        status = ok ? `PubMed record found: ${d.result[pmid].title.slice(0, 60)}` : 'PubMed record not found';
      } else {
        const r = await fetch(s.url, {redirect: 'follow', headers: {'user-agent': 'Mozilla/5.0 (compatible; link-check)'}});
        status = String(r.status);
        ok = r.status === 200;
      }
    } catch (e) { status = e.cause?.code ?? 'error'; }
    if (!ok) bad++;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${s.id.padEnd(12)} ${status}  ${s.url}`);
  }
  return bad;
};

export const runCheck = async (slug, a = {}) => {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const timings = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = timings && toon.shots.every((s) => s.lines.every((l) => timings.lines[l.id]?.text === l.text));
  const c = checkToon(toon, voiced ? timings : null, known());
  console.log(`\nTOON  ${toon.title}  (${voiced ? 'voiced' : 'estimated'} length ${c.total.toFixed(1)} s)`);
  for (const group of Object.keys(GROUPS)) {
    const rows = c.results.filter((r) => r.group === group);
    if (rows.length) console.log(`  ${GROUPS[group]}`);
    for (const r of rows) console.log(`    ${r.pass ? (r.warn ? 'note' : 'PASS') : 'FAIL'}  ${r.point.padEnd(24)} ${r.detail}`);
  }
  let ok = c.ok;
  if (a['check-urls'] && toon.sources?.length) {
    console.log('  SOURCE LINKS');
    if (await checkUrls(toon)) ok = false;
  }
  if (a.sheet && c.layout) {
    const file = path.join(videoDir(slug), 'SCRIPT.md');
    fs.writeFileSync(file, scriptSheet(toon, c));
    console.log(`  script sheet: videos/${slug}/SCRIPT.md`);
  }
  return ok;
};

const main = async () => {
  const a = args();
  const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
  if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
  let ok = true;
  for (const s of slugs) ok = (await runCheck(s, a)) && ok;
  console.log(ok ? '\nALL PASS' : '\nFAILED: fix the script; nothing is voiced until every line passes.');
  process.exit(ok ? 0 : 1);
};
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
