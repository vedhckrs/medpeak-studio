#!/usr/bin/env node
/**
 * Upload package for a Toon: everything YouTube needs. Free; uploads nothing.
 *
 *   node pipeline/toon-package.mjs <slug>          # one video
 *   node pipeline/toon-package.mjs --all
 *   node pipeline/toon-package.mjs <slug> --no-cover   # skip rendering the cover picture
 *
 * Reads the `package` block of videos/<slug>/toon.json (title, opener, question, tags, hashtags,
 * cover) and the voice timings. Writes into videos/<slug>/package/:
 *   toon.json       what publish/upload.py reads (title, description, tags, private, AI label)
 *   captions.srt    only with --captions: the spoken words with their real times. By default a Toon gets
 *                   NO caption track: its words are already on screen (owner, 2026-11-17: "i dont want
 *                   caption because text on screen already")
 *   upload.md       the same for a person to read and paste, with a pre-upload checklist
 * and renders videos/<slug>/renders/toon-cover.jpg (one frame of the video with a short hook).
 *
 * Channel rules (skill references/channel.md): the title starts with the search phrase; no ALL
 * CAPS words, emojis or hashtags in titles; the description opens keyword-first, lists sources,
 * ends with the subscribe line, a comment question, the disclaimer and 3 hashtags. Every upload is
 * private, not made for kids, and answers YouTube's "AI use" question with Yes (owner, 2026-11-16:
 * "restore again AI features select again ... but dont add in description"). The description never
 * says how the video is made.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, readJson, remotion, ROOT, VIDEOS, videoDir, writeJson} from './lib/util.mjs';
import {layoutToon, GAP, TOON_FPS} from '../src/toons/director.ts';
import {v8Props} from './toon-v8-render.mjs';

/** The real length of the rendered file (the end card included), else the story's length. */
const fileSeconds = (file, fallback) => {
  try { return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim()) || fallback; } catch { return fallback; }
};

const SUBSCRIBE = '🔔 Subscribe to MedPeak Health for cartoons and 3D animations that show what really happens inside your body: @MedPeakHealth';
const DISCLAIMER = '⚠️ For education only. This video is not medical advice, diagnosis or treatment. Always talk to a qualified doctor about your health.';
// No 'made with AI' line in the description (owner 2026-11-16: "i dont want in descption this line i dont want to give this reveal").
// The altered-content answer stays a YouTube Studio setting (see the upload checklist), never description text.

const titleProblems = (t) => [
  !t && 'no title',
  t && t.length > 100 && 'title over 100 characters',
  t && t.length > 70 && 'title over 70 characters (a Short cuts it off)',
  t && /\b[A-Z]{4,}\b/.test(t.replace(/\b(WHO|CDC|DNA|ICMR|BMJ|USA)\b/g, '')) && 'ALL CAPS word in the title',
  t && /[\u{1F300}-\u{1FAFF}]/u.test(t) && 'emoji in the title',
  t && /#/.test(t) && 'hashtag in the title',
].filter(Boolean);

const stamp = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
/** Break a caption into two rows of about equal length (YouTube shows at most two). */
const twoRows = (text) => {
  if (text.length <= 42) return text;
  const words = text.split(' ');
  let best = 1;
  let score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const sc = Math.abs(a - (text.length - a - 1)) - (/[,.:;!?]$/.test(words[i - 1]) ? 6 : 0);
    if (sc < score) { score = sc; best = i; }
  }
  return `${words.slice(0, best).join(' ')}\n${words.slice(best).join(' ')}`;
};
/** One caption per sentence of every line, timed from the real word times. */
const captionsOf = (L) => {
  const cues = [];
  for (const l of L.lines) {
    const t0 = l.from / TOON_FPS;
    const end = (l.from + l.frames) / TOON_FPS - GAP;
    let from = 0;
    l.words.forEach((w, i) => {
      const last = i === l.words.length - 1;
      if (!last && !(/[.!?]$/.test(w.w) && i - from >= 1)) return;
      const next = last ? end : t0 + l.words[i + 1].start;
      cues.push({a: t0 + l.words[from].start, b: Math.max(t0 + w.end, next - 0.04), text: l.words.slice(from, i + 1).map((x) => x.w).join(' ')});
      from = i + 1;
    });
  }
  return cues.map((c, i) => `${i + 1}\n${stamp(c.a)} --> ${stamp(c.b)}\n${twoRows(c.text)}\n`).join('\n');
};

const one = (slug, a) => {
  const wantCaptions = !!a.captions; // a caption track only when the owner asks for one (--captions)
  const dir = videoDir(slug);
  const toon = readJson(path.join(dir, 'toon.json'));
  const stored = readJson(path.join(dir, 'toon-timings.json'), null);
  const lines = toon.shots.flatMap((s) => s.lines ?? []);
  const voiced = !!stored && lines.every((l) => stored.lines[l.id]?.text === l.text);
  const L = layoutToon(toon, voiced ? stored : null);
  const seconds = L.total / TOON_FPS;
  const pkg = toon.package ?? {};
  const out = path.join(dir, 'package');
  fs.mkdirSync(out, {recursive: true});
  // look v8 (2026-11-21): the v8 render when there is one, else the old engine's
  const v8 = fs.existsSync(path.join(dir, 'renders', 'toon-v8.mp4'));
  const video = path.join(dir, 'renders', v8 ? 'toon-v8.mp4' : 'toon.mp4');
  const cover = path.join(dir, 'renders', 'toon-cover.jpg');
  const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/'); // the package is read on another machine: paths relative to the repo

  const used = new Set(lines.flatMap((l) => l.src ?? []));
  const sources = (toon.sources ?? []).filter((s) => used.has(s.id));
  const tags = [...new Set([...(pkg.tags ?? []), 'MedPeak Health'])];
  const hashtags = pkg.hashtags ?? '';
  const description = [
    pkg.opener,
    sources.length ? `Sources:\n${sources.map((s) => `• ${s.label}: ${s.url}`).join('\n')}` : '',
    SUBSCRIBE,
    pkg.question ? `💬 ${pkg.question}` : '',
    DISCLAIMER,
    hashtags,
  ].filter(Boolean).join('\n\n');

  const issues = [
    ...titleProblems(pkg.title),
    pkg.title && pkg.phrase && !pkg.title.toLowerCase().startsWith(pkg.phrase.toLowerCase()) && `the title does not start with the search phrase "${pkg.phrase}"`,
    !pkg.opener && 'no opener for the description',
    pkg.opener && pkg.phrase && !pkg.opener.toLowerCase().slice(0, 120).includes(pkg.phrase.toLowerCase()) && 'the description does not open with the search phrase',
    !pkg.question && 'no comment question',
    description.length > 5000 && 'description over 5000 characters',
    tags.join(',').length > 500 && 'tags over 500 characters',
    hashtags.split(/\s+/).filter((h) => h.startsWith('#')).length !== 3 && 'exactly 3 hashtags are needed',
    !/#shorts\b/i.test(hashtags) && 'one hashtag must be #shorts',
    !sources.length && 'no sources',
    !voiced && 'the voices are not made yet (or the script changed after voicing)',
    seconds >= 60 && `the video is ${seconds.toFixed(1)} s: a Short must be under 60 s`,
    !fs.existsSync(video) && 'the final render is missing (node pipeline/toon-render.mjs <slug>)',
    !pkg.cover?.text && 'no cover text',
  ].filter(Boolean);

  if (!a['no-cover'] && pkg.cover?.text && v8) {
    // the cover from the v8 video itself: its frame at `cover.at`, the cover text in the caption style
    const props = path.join(ROOT, 'out', `toon-v8-cover-${slug}.json`);
    writeJson(props, {...v8Props(slug), at: pkg.cover.at ?? 1, text: pkg.cover.text, accent: pkg.cover.accent});
    remotion(['still', path.join('src', 'toons', 'v8', 'entry-video.tsx'), 'ToonV8Cover', cover, `--props=${props}`, '--log=error', '--timeout=120000', '--jpeg-quality=92']);
  } else if (!a['no-cover'] && pkg.cover?.text) {
    const props = path.join(ROOT, 'out', `toon-cover-${slug}.json`);
    writeJson(props, {toon, timings: voiced ? stored : null, sfx: [], music: null, text: pkg.cover.text, accent: pkg.cover.accent});
    const frame = Math.min(L.total - 1, Math.round((pkg.cover.at ?? 1) * TOON_FPS));
    remotion(['still', 'src/index.ts', 'ToonCover', cover, `--props=${props}`, `--frame=${frame}`, '--log=error', '--timeout=90000', '--jpeg-quality=92']);
  }
  if (!fs.existsSync(cover)) issues.push('the cover picture is missing');

  const srt = path.join(out, 'captions.srt');
  if (wantCaptions) fs.writeFileSync(srt, captionsOf(L));
  else if (fs.existsSync(srt)) fs.rmSync(srt); // no caption track unless the owner asks for one
  // keep what has already happened to this video on YouTube (a second run must never look "not uploaded")
  const before = readJson(path.join(out, 'toon.json'), {}) ?? {};
  const done = Object.fromEntries(['uploaded', 'stored', 'coverSet', 'labelSet', 'captionsUploaded', 'captionsRemoved', 'commentId', 'madePublic'].filter((k) => before[k] !== undefined).map((k) => [k, before[k]]));
  writeJson(path.join(out, 'toon.json'), {
    cut: 'toon',
    file: rel(video),
    thumbnail: rel(cover),
    captions: wantCaptions ? srt : null,
    snippet: {title: pkg.title, description, tags, categoryId: '27', defaultLanguage: 'en', defaultAudioLanguage: 'en'},
    status: {privacyStatus: 'private', selfDeclaredMadeForKids: false, containsSyntheticMedia: true},
    relatedVideo: pkg.related ?? null,
    issues,
    ...done,
  });
  const tick = (ok) => (ok ? 'x' : ' ');
  fs.writeFileSync(path.join(out, 'upload.md'), [
    `# Upload package: ${toon.title}`,
    '',
    issues.length ? `> **Not ready:** ${issues.join('; ')}` : '> Ready. Nothing is uploaded until the owner says so; an upload is always private first.',
    '',
    `**Video:** \`${rel(video)}\` (${fileSeconds(video, seconds).toFixed(1)} s, 1080 x 1920, a Short)`,
    `**Cover:** \`videos/${slug}/renders/toon-cover.jpg\` (the frame at ${(pkg.cover?.at ?? 1).toFixed(1)} s; in the YouTube app a Short's cover is picked from the video's own frames, so choose that moment there if the picture is not accepted)`,
    wantCaptions ? `**Captions:** \`videos/${slug}/package/captions.srt\` (YouTube Studio > Subtitles > Upload file > With timing)` : '**Captions:** none. The words are already on screen; the owner does not want a caption track.',
    '',
    '## Title',
    '',
    pkg.title ?? '',
    '',
    `(${(pkg.title ?? '').length} characters; search phrase: "${pkg.phrase ?? ''}")`,
    '',
    '## Description',
    '',
    '```',
    description,
    '```',
    '',
    '## Tags',
    '',
    tags.join(', '),
    '',
    '## Settings',
    '',
    '- Visibility: **Private** (or scheduled). Public only when the owner says so.',
    '- Audience: **No, it is not made for kids.**',
    '- AI use: **Yes** (the owner\'s rule; the uploader sets it and reads it back). Nothing about it goes in the title, description, comments or cover.',
    '- Category: Education. Language: English.',
    `- Related video: ${pkg.related ? pkg.related : 'none yet. When a long video on this topic exists, link it here in YouTube Studio (only long-video watch time counts toward the 4,000 hours).'}`,
    '',
    '## Pinned comment',
    '',
    pkg.question ?? '',
    '',
    '## Before uploading',
    '',
    `- [${tick(voiced)}] voices made and unchanged since`,
    `- [${tick(fs.existsSync(video))}] final render exists`,
    `- [${tick(seconds < 60)}] under 60 seconds (${seconds.toFixed(1)} s)`,
    `- [${tick(!titleProblems(pkg.title).length)}] title follows the channel rules`,
    `- [${tick(sources.length > 0)}] ${sources.length} source(s) listed`,
    '- [ ] owner has watched the final video with sound',
    '- [ ] owner has said yes to the upload',
    '',
  ].join('\n'));
  console.log(`${issues.length ? 'NOT READY' : 'READY    '}  ${slug}  "${pkg.title ?? ''}"${issues.length ? `\n           ${issues.join('\n           ')}` : ''}`);
  return !issues.length;
};

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) ok = one(slug, a) && ok;
console.log(ok ? '\nPackages written. Nothing was uploaded.' : '\nFix the items above, then run this again.');
process.exit(ok ? 0 : 1);
