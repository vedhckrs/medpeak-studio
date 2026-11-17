#!/usr/bin/env node
/**
 * Script gate: Retention 7 + MedPeak rules, for the long video and every Short.
 * Uses real durations once the voice exists, an estimate before.
 *
 *   node pipeline/check.mjs <slug>        # one video
 *   node pipeline/check.mjs --all         # every video in videos/ (CI runs this)
 *
 * Exit code 1 when any point fails: a failing script is fixed, never approved "with a note".
 */
import fs from 'node:fs';
import {args, isMain, loadTimings, loadVideo, sceneList, VIDEOS, fmtTime} from './lib/util.mjs';
import {checkCut} from './lib/retention.mjs';

const table = (label, r) => {
  console.log(`\n${label}  (${r.timings ? 'voiced' : 'estimated'} length ${fmtTime(r.total)})`);
  for (const x of r.results) console.log(`  ${x.pass ? 'PASS' : 'FAIL'}  ${x.point.padEnd(20)} ${x.detail}`);
};

export const checkVideo = (slug, {quiet = false} = {}) => {
  const video = loadVideo(slug);
  if (!video.scenes?.length) {
    if (!quiet) console.log(`\n${slug}: no scenes yet (skipped)`);
    return true;
  }
  const timings = loadTimings(slug);
  let ok = true;
  const long = checkCut({scenes: video.scenes, retention: video.retention, isShort: false, sources: video.sources, timings, label: 'Long video'});
  if (!quiet) table(`LONG  ${video.package?.title || slug}`, {...long, timings});
  ok &&= long.ok;
  for (const short of video.shorts || []) {
    const r = checkCut({scenes: sceneList(video, short.id), retention: short.retention, isShort: true, sources: video.sources, timings, label: short.id});
    if (!quiet) table(`SHORT ${short.id}  ${short.title}`, {...r, timings});
    ok &&= r.ok;
  }
  return ok;
};

const main = () => {
  const a = args();
  const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(`${VIDEOS}/${d}/video.json`)) : [a._[0]];
  let ok = true;
  for (const s of slugs) ok = checkVideo(s) && ok;
  console.log(ok ? '\nALL PASS' : '\nFAILED: fix the script before it goes on');
  process.exit(ok ? 0 : 1);
};

if (isMain(import.meta.url)) main();
