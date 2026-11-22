#!/usr/bin/env node
/**
 * Run a video's script through the FORMAT 6 gate (engine v9) without changing its file: the script is read, given
 * "format": 6 in memory, and checked with its real voice timings when they match. Free, local. For the owner's review of
 * phase 5: an old script (creatine) must FAIL the new one-story rules where it should.
 *
 *   node --import tsx pipeline/tools/format6-gate.mjs creatine            the table
 *   node --import tsx pipeline/tools/format6-gate.mjs creatine --md out.md   also write it as a Markdown page
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, isMain, readJson, VIDEOS, videoDir} from '../lib/util.mjs';
import {loadCast} from '../lib/toon-audio.mjs';
import {checkToon} from '../lib/toon-rules.mjs';
import {LIBRARY} from '../toon-sfx.mjs';
import {BEDS} from '../toon-music.mjs';

export const gate6 = (slug) => {
  const toon = {...readJson(path.join(videoDir(slug), 'toon.json')), format: 6};
  const timings = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = timings && toon.shots.every((s) => s.lines.every((l) => timings.lines[l.id]?.text === undefined || timings.lines[l.id]?.text === l.text));
  const others = fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))).map((d) => readJson(path.join(VIDEOS, d, 'toon.json'))).map((t) => ({slug: t.slug, episode: t.episode, rooms: t.rooms}));
  const cta = readJson(path.join(videoDir(slug), 'cta-timings.json'), null);
  const ctaSeconds = cta?.words?.length ? Math.max(5.5, cta.words[cta.words.length - 1].end + 0.04 + 1.6) : 0; // the short card: CTA9_SECONDS (hud.tsx)
  const known = {cast: Object.keys(loadCast().cast), sfx: LIBRARY.map(([n]) => n), beds: BEDS.map(([n]) => n), others, ctaSeconds};
  return {toon, voiced: !!voiced, check: checkToon(toon, voiced ? timings : null, known)};
};

const main = () => {
  const a = args();
  const slug = a._[0];
  if (!slug) throw new Error('usage: node --import tsx pipeline/tools/format6-gate.mjs <slug> [--md <file>]');
  const {toon, voiced, check} = gate6(slug);
  const rows = check.results.map((r) => `| ${r.pass ? (r.warn ? 'note' : 'PASS') : 'FAIL'} | ${r.point} | ${String(r.detail).replace(/\|/g, '/')} |`);
  const fails = check.results.filter((r) => !r.pass);
  const md = [`# "${toon.title}" through the format-6 gate`, '', `Script \`videos/${slug}/toon.json\` checked as if it were \`"format": 6\` (${voiced ? 'with its real voice timings' : 'estimated timings'}). Story ${check.total.toFixed(1)} s.`, '',
    `**${fails.length} FAIL**, ${check.results.filter((r) => r.pass && r.warn).length} notes, ${check.results.filter((r) => r.pass && !r.warn).length} pass.`, '', '| | Rule | Result |', '|---|---|---|', ...rows, ''].join('\n');
  console.log(md);
  if (typeof a.md === 'string') { fs.mkdirSync(path.dirname(a.md), {recursive: true}); fs.writeFileSync(a.md, md); }
};

if (isMain(import.meta.url)) main();
