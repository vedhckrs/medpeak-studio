#!/usr/bin/env node
/**
 * Upload package: everything YouTube needs, per cut. Free.
 *   node pipeline/package.mjs <slug>
 * Writes videos/<slug>/package/<cut>.json (read by publish/upload.py) and upload.md (for a human).
 *
 * Channel rules baked in (MedPeak Health, 2026-11-15):
 *  - title starts with the search phrase; no ALL CAPS words, no emojis, no hashtags in titles
 *  - description: keyword-first opener, chapters (long), sources, @MedPeakHealth, comment question,
 *    disclaimer, 3 hashtags
 *  - AI-made visuals are disclosed (containsSyntheticMedia), not made for kids, category 27 Education
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, fmtTime, loadTimings, loadVideo, sceneList, videoDir, writeJson} from './lib/util.mjs';
import {durations} from './lib/retention.mjs';

const FOOTER = (hashtags) => [
  '🔔 Subscribe to MedPeak Health for 3D medical animations that show what really happens inside your body: @MedPeakHealth',
  '💬 Comment below: which part of the body should we animate next?',
  '⚠️ For education only. This video is not medical advice, diagnosis or treatment. Always talk to a qualified doctor about your health.',
  hashtags,
].join('\n\n');

const titleProblems = (t) => [
  t.length > 100 && 'over 100 characters',
  /\b[A-Z]{4,}\b/.test(t.replace(/\b(WHO|CDC|DNA|ICMR|BMJ|USA)\b/g, '')) && 'ALL CAPS word',
  /[\u{1F300}-\u{1FAFF}]/u.test(t) && 'emoji',
  /#/.test(t) && 'hashtag',
].filter(Boolean);

const chaptersText = (video, timings) => {
  const d = durations(video.scenes, timings);
  const rows = [];
  let at = 0;
  video.scenes.forEach((s, i) => {
    if (s.chapter && !rows.some((r) => r.id === s.chapter)) rows.push({id: s.chapter, at});
    at += d[i];
  });
  rows[0].at = 0; // YouTube needs the first chapter at 0:00
  return rows.map((r) => `${fmtTime(r.at)} ${video.chapters.find((c) => c.id === r.id).title}`).join('\n');
};

const sourcesText = (video, ids) => {
  const used = video.sources.filter((s) => ids.has(s.id));
  return used.length ? `Sources:\n${used.map((s) => `• ${s.label}: ${s.url}`).join('\n')}` : '';
};

const main = () => {
  const slug = args()._[0];
  const video = loadVideo(slug);
  const timings = loadTimings(slug);
  const dir = path.join(videoDir(slug), 'package');
  fs.mkdirSync(dir, {recursive: true});
  const renders = path.join(videoDir(slug), 'renders');
  const md = [`# Upload package: ${slug}`, '', timings ? '' : '> Timings are estimates until the voice is made; chapter times will shift slightly.', ''];
  let problems = 0;

  const cuts = [{id: 'long', pkg: video.package, scenes: video.scenes}, ...(video.shorts || []).map((s) => ({id: s.id, pkg: s.package || {title: s.title}, scenes: sceneList(video, s.id), short: s}))];
  for (const c of cuts) {
    const ids = new Set(c.scenes.flatMap((s) => s.sources || []));
    const opener = c.short
      ? `${c.scenes[0].text} ${c.short.title}: the facts in under a minute, animated in 3D.\n\nWatch the full video: "${video.package.title}" on our channel.`
      : `${c.scenes[0].text} ${c.scenes[1].text} This 3D medical animation follows sugar through your blood, liver, heart and teeth, with every number sourced.`;
    const description = [opener, c.short ? '' : `Chapters:\n${chaptersText(video, timings)}`, sourcesText(video, ids), FOOTER(c.pkg.hashtags || video.package.hashtags)]
      .filter(Boolean).join('\n\n');
    const tags = [...new Set([...(c.pkg.tags || video.package.tags || []), 'MedPeak Health', '3d medical animation'])];
    const issues = titleProblems(c.pkg.title);
    if (description.length > 5000) issues.push('description over 5000 characters');
    if (tags.join(',').length > 500) issues.push('tags over 500 characters');
    problems += issues.length;
    const file = c.id === 'long' ? 'long.mp4' : `short-${c.id}.mp4`;
    const data = {
      cut: c.id,
      file: path.join(renders, file),
      thumbnail: path.join(renders, c.id === 'long' ? 'thumb.jpg' : `cover-${c.id}.jpg`),
      snippet: {title: c.pkg.title, description, tags, categoryId: '27', defaultLanguage: 'en', defaultAudioLanguage: 'en'},
      status: {privacyStatus: 'private', selfDeclaredMadeForKids: false, containsSyntheticMedia: true},
      relatedVideo: c.short ? 'long' : null,
      issues,
    };
    writeJson(path.join(dir, `${c.id}.json`), data);
    md.push(`## ${c.id === 'long' ? 'Long video' : `Short: ${c.id}`}`, '', `**Title:** ${c.pkg.title}`, issues.length ? `**Fix:** ${issues.join(', ')}` : '', '', '**Description:**', '', '```', description, '```', '', `**Tags:** ${tags.join(', ')}`, '', `**File:** renders/${file}`, '');
  }
  fs.writeFileSync(path.join(dir, 'upload.md'), md.join('\n'));
  console.log(`Package written to ${path.relative(process.cwd(), dir)} (${cuts.length} cuts)${problems ? `, ${problems} issue(s) to fix` : ''}`);
  process.exit(problems ? 1 : 0);
};

main();
