#!/usr/bin/env node
/**
 * MedPeak Toons, engine v9 phase 1 (2026-11-23): THE SCOREBOARD. Every number of blueprint 05, Part 1 ("the target"),
 * measured on a video's FINAL render, its layout log and its script, against the 20 reference Shorts and the pass bands
 * the owner approved (decision 17: "all checks run on the final render; toon:score must say PASS").
 *
 *   npm run toon:score -- <slug> [<slug> ...] [--file x.mp4] [--fresh] [--sheet out.jpg] [--title "..."]
 *
 * Writes videos/<slug>/renders/score.json and renders/scoreboard.jpg (a 16:9 sheet for the owner), and with several
 * slugs one sheet with a column per video (--sheet, default out/toons/scoreboard.jpg). Free and local.
 * Rows that nothing measures yet say "not measured" (grey) and name the phase that adds them; a row marked
 * "you saw it" is a fault the owner already pointed out, so the sheet proves the checks now catch it.
 * Exit code 1 when any measured row fails.
 */
import {layoutOf} from './lib/toon-layout.mjs'; // first: it prepares the JSX runtime for the layout probe
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {args, isMain, ROOT, readJson, videoDir, writeJson} from './lib/util.mjs';
import {findPython, pictureChecks, pictureOf} from './lib/toon-picture.mjs';
import {scanLayout} from './lib/toon-staging.mjs';
import {scanLayoutMotion} from './lib/toon-motion.mjs';
import {scanLayoutCamera} from './lib/toon-camera.mjs';
import {checkToon} from './lib/toon-rules.mjs';
import {musicFamily} from './toon-music-scan.mjs';
import {CTA_PAD, CTA9_SECONDS, known} from './toon-check.mjs';

const PEOPLE = new Set(['doctor', 'patient', 'mom', 'dad', 'kid', 'grandpa', 'grandma', 'baby', 'narrator']);
const STOP = new Set(['what', 'happens', 'when', 'you', 'your', 'to', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'and', 'or', 'after', 'why', 'how', 'do', 'does', 'is', 'are', 'it', 'body', 'take', 'stop', 'every', 'day', 'this', 'that', 'can', 'i', 'my', 'get', 'if', 'with']);
const NUM = /^(\d[\d.,%]*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|percent|double|twice|triple)$/i;
const REACT = /^(huh|whoa|woah|ugh|wow|oh|ooh|uh|uh-oh|hey|yikes|ouch|eek|hmm|ew|eww|yay|phew|aha|ha|haha|oops|argh|gah|nope|yes|no)[!?.,]*$/i;
const bare = (w) => w.toLowerCase().replace(/[^a-z0-9'%]/g, '');
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const pct = (v) => (v === null || v === undefined ? '-' : `${Math.round(v * 100)}%`);
const r1 = (v) => (v === null || v === undefined ? '-' : (Math.round(v * 10) / 10).toString());

/** The script and voice numbers from the layout log's lines (word times from the voice). */
export const scriptNumbers = (log, toon) => {
  const lines = log.lines;
  const story = log.story;
  const spoken = lines.map((l) => ({...l, end: l.from + l.voice, n: l.words.length, start: l.from + (l.words[0]?.[1] ?? 0)}));
  const talk = spoken.reduce((s, l) => s + (l.end - l.start), 0);
  const gaps = spoken.slice(1).map((l, i) => l.start - spoken[i].end);
  const wps = (l) => l.n / Math.max(0.3, l.end - l.start);
  const body = spoken.filter((l) => !PEOPLE.has(l.who));
  const doc = spoken.filter((l) => l.who === 'doctor');
  const titleWords = toon.title.split(/\s+/).map(bare).filter((w) => w && !STOP.has(w));
  let topicAt = null;
  for (const l of spoken) for (const [w, s] of l.words) if (topicAt === null && titleWords.some((t) => bare(w).startsWith(t.slice(0, Math.max(4, t.length - 2))))) topicAt = l.from + s;
  const allWords = spoken.flatMap((l) => l.words.map((w) => w[0]));
  const docWords = doc.reduce((s, l) => s + l.n, 0);
  return {
    story, words: allWords.length,
    wpsBody: median(body.map(wps)), wpsDoc: doc.length ? median(doc.map(wps)) : null,
    talkShare: talk / story,
    pauses05: (gaps.filter((g) => g >= 0.5).length / story) * 60, pauses10: (gaps.filter((g) => g >= 1.0).length / story) * 60,
    firstWord: spoken[0]?.start ?? null, topicAt, topicWords: titleWords,
    // a fact: a run of sourced lines on the same source (one fact told over two lines counts once)
    sourced: lines.reduce((acc, l) => { const k = l.src && !l.chat ? String(l.src) : null; if (k && k !== acc.prev) acc.n++; acc.prev = k; return acc; }, {n: 0, prev: null}).n,
    numbers: allWords.filter((w) => NUM.test(bare(w))).length,
    reactions: allWords.filter((w) => REACT.test(w.toLowerCase())).length,
    docWords, docAt: doc.length ? doc[0].start / story : null,
    lastWord: spoken.length ? spoken[spoken.length - 1].end : null,
    speakers: new Set(lines.map((l) => l.who)).size,
  };
};

const probe = (file) => {
  const o = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=r_frame_rate,codec_type', '-of', 'json', file]).toString());
  const v = o.streams.find((s) => s.codec_type === 'video');
  const [a, b] = (v?.r_frame_rate ?? '0/1').split('/').map(Number);
  return {duration: Number(o.format.duration), fps: b ? a / b : 0};
};
/** Loudness of the whole mix (free, ffmpeg ebur128): integrated LUFS, range LU, true peak dBTP. */
const loudness = (file) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26});
  const err = String(r.stderr ?? '');
  const sum = err.slice(err.lastIndexOf('Summary:'));
  const g = (re) => { const m = sum.match(re); return m ? Number(m[1]) : null; };
  return {lufs: g(/I:\s+(-?[\d.]+) LUFS/), lra: g(/LRA:\s+(-?[\d.]+) LU/), tp: g(/Peak:\s+(-?[\d.]+) dBFS/)};
};
/** The study's measured voice numbers (agent 3, 2026-11-23), when the plans folder has them: until toon:listen --voices (phase 5). */
const studyVoice = (slug) => {
  for (const base of [path.join(ROOT, 'plans', 'engine-upgrade-2026-11-23', 'agent3-sheets', 'voice-pitch-and-gaps.json')]) {
    if (fs.existsSync(base)) { const d = readJson(base); return d[`ours-${slug}`] ?? null; }
  }
  return null;
};

/**
 * The rows of the scoreboard. status: 'pass' | 'fail' | 'n/m'. `owner`: a fault the owner already saw.
 * Each row: {area, measure, ref, pass, aim, value, status, owner?, note?}
 */
export const scoreRows = ({log, pic, staging, motion, camera, script: S, media, sound, voice, toon, music = null, gate = null}) => {
  const rows = [];
  const add = (area, measure, ref, pass, aim, value, ok, extra = {}) => { const nm = ok === null || ok === undefined; rows.push({area, measure, ref, pass, aim, value: nm ? 'not measured' : value, status: nm ? 'n/m' : ok ? 'pass' : 'fail', ...extra}); };
  const chk = (list, id) => list.find((c) => c.id === id);
  const shots = log.shots.filter((s) => s.kind !== 'card');
  const inside = shots.filter((s) => s.kind === 'body' || s.kind === 'micro').reduce((t, s) => t + Math.min(s.to, log.story) - s.from, 0) / log.story;
  const switches = shots.slice(1).filter((s, i) => (s.kind === 'room') !== (shots[i].kind === 'room')).length;
  const {C1, C2, C3, C4, C6, C7} = pic;
  const L = (id) => chk(staging.checks, id);
  // Place
  add('Place', 'Time inside the body', '72%', '60%+', '70%', pct(inside), inside >= 0.6);
  add('Place', 'Body/room switches', '1', '3 or fewer', '2', String(switches), switches <= 3);
  // the anatomy stages report each named neighbour (anatomy.tsx StageReport): the fewest in any body shot that is on a stage
  const nb = new Map();
  for (const p of log.probes.filter((q) => q.kind === 'body')) {
    const n = new Set(p.items.filter((i) => i.kind === 'body' && String(i.id ?? '').startsWith('neighbour:')).map((i) => i.id)).size;
    if (n) nb.set(p.shot, Math.max(nb.get(p.shot) ?? 0, n));
  }
  const nbMin = nb.size ? Math.min(...nb.values()) : null;
  add('Place', 'Neighbours around the hero organ', '3+', '3+', '4', nbMin === null ? '-' : String(nbMin), nbMin === null ? null : nbMin >= 3, nbMin === null ? {note: 'no anatomy stage in this video'} : {});
  add('Place', 'Largest flat non-tissue field (body)', 'none', '12% or less', '8%', pct(C7.flat_max), C7.flat_max === null ? null : C7.flat_max <= 0.12);
  // Colour
  add('Colour', 'Body shots warm', '67%', '60%+', '65%', pct(C7.body_warm), C7.body_warm === null ? null : C7.body_warm >= 0.6);
  add('Colour', 'Any other colour family (body)', '0-2%', '8% or less', '5%', C7.body_other_max === null ? '-' : `${pct(C7.body_other_max)} ${C7.body_other_family}`, C7.body_other_max === null ? null : C7.body_other_max <= 0.08);
  add('Colour', 'Room saturation / brightness', '0.17 / 180', '0.22- / 165+', '0.18 / 180', C7.room_sat === null ? 'no room' : `${C7.room_sat.toFixed(2)} / ${Math.round(C7.room_bright)}`, C7.room_sat === null ? null : C7.room_sat <= 0.22 && C7.room_bright >= 165);
  // Line and face
  add('Line', 'Outline on screen, every shot', '5 px (3-7)', '4-7 px', '5-6 px', C6.min === null ? '-' : `${C6.min}-${C6.max} px`, C6.min === null ? null : C6.min >= 4 && C6.max <= 7);
  const l9 = L('L9');
  add('Face', 'One organ eye, whole-organ frame', '115 px', '110-190 px', '120-170 px', l9.status === 'n/m' ? '-' : `${l9.value} px`, l9.status === 'n/m' ? null : l9.status === 'pass', {note: l9.partial ? 'estimated' : undefined});
  // Cuts
  add('Cuts', 'Cuts a minute (cards not counted)', '3.3', '6 or fewer', '4', r1(C1.cuts_per_min), C1.cuts_per_min <= 6, {owner: 'cuts every 2 s'});
  add('Cuts', 'Median hold of one picture', '15.3 s', '6 s+', '10 s', `${r1(C1.hold_median)} s`, (C1.hold_median ?? 0) >= 6);
  const v1 = chk(camera.checks, 'V1');
  add('Cuts', 'Re-framings of the same place', '0', '1 at most', '0-1', String(v1.value + C1.reframes), v1.value + C1.reframes <= 1);
  // Motion
  add('Motion', 'Picture still (caption left out)', '89%', '78-94%', '85%', pct(C2.still), C2.still >= 0.78 && C2.still <= 0.94);
  add('Motion', 'Seconds with visible action', '13%', '25% or less', '15-20%', pct(C2.visible_seconds), C2.visible_seconds <= 0.25);
  add('Motion', 'Seconds with big action', '2%', '5% or less', '3%', pct(C2.big_seconds), C2.big_seconds <= 0.05);
  add('Motion', 'Frames a minute over 10% change', '8', '40 or fewer', '20', String(Math.round(C2.over10_per_min)), C2.over10_per_min <= 40);
  add('Motion', 'Pixels changing in 5%+ of frames', '0.3-1%', '5% or less', '2%', pct(C2.heat_share), C2.heat_share <= 0.05);
  add('Motion', 'Longest fully still stretch', '14.9 s', '4 s+', '8 s', `${r1(C2.longest_still)} s`, C2.longest_still >= 4);
  const bursts = L('L7').value;
  add('Motion', 'Shakes / white flashes / bursts', '0 / 0 / 0', '1 / 1 / 2', '0 / 0 / 1', `${C3.shakes} / ${C3.flashes} / ${bursts}`, C3.shakes <= 1 && C3.flashes <= 1 && bursts <= 2);
  add('Motion', 'One-frame pops (outside cuts)', 'rare', '0', 'beat: 0', C4 ? String(C4.pops) : '-', C4 ? C4.pops === 0 : null);
  add('Motion', 'One action, then a hold (M2)', '-', 'none closer', '0', String(C2.action_gaps_under_1_5), C2.action_gaps_under_1_5 === 0);
  // Script
  add('Script', 'Story length', '60 s', '50-60 s', '55 s', `${r1(S.story)} s`, S.story >= 50 && S.story <= 60);
  add('Script', 'Talk speed, body cast', '3.2 w/s', '3.0-3.6 w/s', '3.3', r1(S.wpsBody), S.wpsBody === null ? null : S.wpsBody >= 3.0 && S.wpsBody <= 3.6);
  add('Script', 'Share of the story with talking', '0.88', '0.80-0.93', '0.88', S.talkShare.toFixed(2), S.talkShare >= 0.8 && S.talkShare <= 0.93);
  add('Script', 'Pauses 0.5 s+ / 1 s+ a minute', '4.4 / 2.5', '3+ / 2+', '4 / 3', `${r1(S.pauses05)} / ${r1(S.pauses10)}`, S.pauses05 >= 3 && S.pauses10 >= 2);
  add('Script', 'First spoken word', '1.1 s', '0.3-1.2 s', '0.6 s', `${r1(S.firstWord)} s`, S.firstWord >= 0.3 && S.firstWord <= 1.2);
  add('Script', 'Topic named by', 'about 3 s', 'by 3.0 s', '2.5 s', S.topicAt === null ? 'never' : `${r1(S.topicAt)} s`, S.topicAt !== null && S.topicAt <= 3.0, {note: `title words: ${S.topicWords.join(', ')}`});
  add('Script', 'Sourced facts in the story', '1-3', '3 or fewer', '3', String(S.sourced), S.sourced <= 3);
  add('Script', 'Numbers said aloud', '0', '1 at most', '1', String(S.numbers), S.numbers <= 1);
  add('Script', 'Reaction words (warn)', '3.5', '2+', '3-4', String(S.reactions), S.reactions >= 2);
  add('Script', "Doctor's answer block", '50 w, 69%', '35-60 w, 55-80%', '50 at 68%', S.docWords ? `${S.docWords}w ${pct(S.docAt)}` : 'none', S.docWords >= 35 && S.docWords <= 60 && S.docAt >= 0.55 && S.docAt <= 0.8);
  add('Script', 'Doctor slower than the body cast', '0.4 w/s', '0.3 w/s slower', '0.4 slower', S.wpsDoc === null ? 'none' : `${r1(S.wpsBody - S.wpsDoc)} w/s`, S.wpsDoc === null ? false : S.wpsBody - S.wpsDoc >= 0.3);
  // Voice and sound
  // A4 (toon:listen --voices writes renders/listen/voices.json with its `voicesApart`): the real pitch of every voiced line
  const va = voice?.apart;
  const high = va?.high ?? voice?.share_high;
  add('Voice', 'Body lines above 250 Hz', '41%', '30-55%', '40%', Number.isFinite(high) ? pct(high) : 'not measured', Number.isFinite(high) ? high >= 0.3 && high <= 0.55 : null, {note: va ? 'toon:listen --voices' : voice ? 'study measure (agent 3)' : 'npm run toon:listen -- <slug> --voices'});
  add('Voice', 'Speakers in one scene, pitch apart', 'clear', '3+ semitones', '4+', va ? `${va.close.length} pairs close` : 'not measured', va ? va.close.length === 0 : null, {note: va ? undefined : 'npm run toon:listen -- <slug> --voices'});
  // A3: the track by ear (toon-music-scan.mjs musicFamily: earshot's tempo and genre/mood)
  add('Sound', 'Music style / tempo', 'funk 154', 'funk 130-165', '150', music ? (music.ok === null ? 'not measured' : `${music.hints?.[0] ?? '?'} ${music.bpm}`) : 'not measured', music ? music.ok : null, {note: music?.ok === null ? music.why : music ? undefined : 'no track'});
  // the format-6 script gate (toon-rules.mjs: S1-S12, impacts, music stops, one action then a hold, the music family)
  if (gate) add('Script', 'Format 6 script gate (S1-S12)', '-', 'all pass', 'all', `${gate.pass} / ${gate.n} pass`, gate.n ? gate.pass === gate.n : null, gate.fails.length ? {note: gate.fails.slice(0, 3).join('; ')} : {});
  add('Sound', 'Music in pauses, under the voice', '2.7 dB', '4-8 dB', '6 dB', voice?.voice_over_gap ? `${r1(voice.voice_over_gap)} dB` : 'not measured', voice?.voice_over_gap ? voice.voice_over_gap >= 4 && voice.voice_over_gap <= 8 : null, {note: 'needs real pauses; the mix check (phase 5)'});
  add('Sound', 'Loudness / true peak', '-9.4', '-14±1 / -1', 'beat: -14, 0 clips', sound.lufs === null ? '-' : `${r1(sound.lufs)}/${r1(sound.tp)}`, sound.lufs === null ? null : Math.abs(sound.lufs + 14) <= 1 && sound.tp <= -0.9);
  add('Sound', 'Loudness range', '5.9 LU', '4-8 LU', '6', sound.lra === null ? '-' : `${r1(sound.lra)} LU`, sound.lra === null ? null : sound.lra >= 4 && sound.lra <= 8);
  // Finish
  const tail = media.duration - (S.lastWord ?? log.story);
  // the owner (2026-11-23): Joey reads the whole card again ("cta": {"read": "card"}): the card runs his clip (16 s at most)
  const readCard = toon?.cta?.read === 'card';
  add('Finish', 'Seconds after the last story word', '0-2 s', readCard ? '16 s or less (Joey reads the card)' : '6 s or less', '5 s', `${r1(tail)} s`, tail <= (readCard ? 16 : 6));
  add('Finish', 'Faces covered (bursts and others)', '-', '0', 'beat: 0', String(L('L1').episodes), L('L1').status === 'n/m' ? null : L('L1').status === 'pass', {owner: 'bursts on faces', note: 'estimated boxes until the kit reports'});
  add('Finish', 'Caption on a face or eyes', '-', '0', 'beat: 0', String(L('L3').episodes), L('L3').status === 'n/m' ? null : L('L3').status === 'pass', {owner: 'caption on eyes'});
  add('Finish', 'Text on text', '-', '0', 'beat: 0', String(L('L2').episodes), L('L2').status === 'pass');
  add('Finish', 'Half people at the edge', '-', '0', 'beat: 0', String(L('L6').episodes), L('L6').status === 'pass');
  add('Finish', 'Watermark on a head / by the caption', '-', '0', '0', String(L('L5').episodes), L('L5').status === 'pass');
  add('Finish', 'Listeners look at the speaker', 'yes', '0 lines off', '100%', `${chk(staging.checks, 'L10').episodes} off`, L('L10').status === 'n/m' ? null : L('L10').status === 'pass');
  add('Finish', 'Frames a second', '30', '60', 'beat: 60', String(Math.round(media.fps)), Math.round(media.fps) === 60);
  // motion of bodies (layout log)
  const M = (id) => chk(motion.checks, id);
  add('Acting', 'The face talks, the body holds (M1)', '-', '0 lines', '0', `${M('M1').episodes} lines`, M('M1').status === 'n/m' ? null : M('M1').status === 'pass');
  add('Acting', 'Limb jumps and one-frame pose flips (M3, M4)', '-', '0', '0', `${M('M3').episodes} / ${M('M4').episodes}`, M('M3').status === 'pass' && M('M4').status === 'pass');
  void toon;
  return rows;
};

/** The track's music family by ear (A3), cached in renders/music-family.json while the track file is unchanged. */
const musicOf = (toon, dir) => {
  if (!toon.music) return null;
  const file = path.join(ROOT, 'assets', 'toons-music', `${toon.music}.mp3`);
  if (!fs.existsSync(file)) return null;
  const cacheFile = path.join(dir, 'music-family.json');
  const stamp = `${toon.music}:${fs.statSync(file).size}:${Math.round(fs.statSync(file).mtimeMs)}`;
  const cached = readJson(cacheFile, null);
  if (cached?.stamp === stamp && cached.ok !== null) return cached;
  const r = musicFamily(file);
  writeJson(cacheFile, {...r, stamp});
  return r;
};
/** The format-6 script gate's own results (toon-rules.mjs checkToon, group `format`): passes, total, and the failures. */
const gateOf = (toon, slug) => {
  const timings = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = timings && toon.shots.every((s) => s.lines.every((l) => timings.lines[l.id]?.text === l.text));
  const cta = readJson(path.join(videoDir(slug), 'cta-timings.json'), null);
  const ctaSeconds = cta?.words?.length ? Math.max(CTA9_SECONDS, cta.words[cta.words.length - 1].end + 0.04 + CTA_PAD) : 0;
  const c = checkToon(toon, voiced ? timings : null, {...known(), ctaSeconds});
  const f = c.results.filter((r) => r.group === 'format' && !r.warn);
  return {n: f.length, pass: f.filter((r) => r.pass).length, fails: f.filter((r) => !r.pass).map((r) => r.point)};
};

/** Score one video: measure everything (free) and return {slug, title, rows, checks}. */
export const scoreVideo = async (slug, opts = {}) => {
  const dir = path.join(videoDir(slug), 'renders');
  const file = opts.file ? path.resolve(String(opts.file)) : path.join(dir, 'toon-v8.mp4');
  if (!fs.existsSync(file)) throw new Error(`no final render: ${path.relative(ROOT, file)}`);
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const log = await layoutOf(slug, {fresh: !!opts.fresh});
  const pic = pictureOf(slug, {file, story: log.story, caption: toon.caption, fresh: !!opts.fresh});
  const staging = scanLayout(log), motion = scanLayoutMotion(log), camera = scanLayoutCamera(log);
  const script = scriptNumbers(log, toon);
  const media = probe(file);
  const sound = loudness(file);
  const voice = studyVoice(slug);
  const listened = readJson(path.join(dir, 'listen', 'voices.json'), null)?.voicesApart;
  const music = musicOf(toon, dir);
  const gate = (toon.format ?? 0) >= 6 ? gateOf(toon, slug) : null;
  const rows = scoreRows({log, pic, staging, motion, camera, script, media, sound, voice: listened ? {...(voice ?? {}), apart: listened} : voice, toon, music, gate});
  const out = {slug, title: toon.title, file: path.relative(ROOT, file), at: new Date().toISOString(), rows,
    checks: {picture: pictureChecks(pic), staging: staging.checks, motion: motion.checks, camera: camera.checks}};
  writeJson(path.join(dir, 'score.json'), out);
  return out;
};

/** Draw the sheet (16:9 JPG) with pipeline/lib/toon_scoreboard.py. */
export const drawSheet = (scores, out, title) => {
  const py = findPython();
  if (!py) throw new Error('No Python with numpy (earshot) for the sheet.');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const data = path.join(path.dirname(out), `${path.basename(out, path.extname(out))}.json`);
  fs.writeFileSync(data, JSON.stringify({title, date: new Date().toLocaleDateString('en-CA'), videos: scores.map((s) => ({slug: s.slug, title: s.title})),
    rows: scores[0].rows.map((r, i) => ({area: r.area, measure: r.measure, ref: r.ref, pass: r.pass, owner: r.owner ?? null, cells: scores.map((s) => ({value: s.rows[i].value, status: s.rows[i].status, note: s.rows[i].note ?? null}))}))}));
  execFileSync(py, ['-I', path.join(ROOT, 'pipeline', 'lib', 'toon_scoreboard.py'), data, out], {stdio: 'inherit'});
  return out;
};

if (isMain(import.meta.url)) {
  const a = args();
  const slugs = a._;
  if (!slugs.length) { console.error('Give one or more slugs: npm run toon:score -- <slug> [<slug> ...]'); process.exit(2); }
  const scores = [];
  for (const slug of slugs) {
    const s = await scoreVideo(slug, {file: slugs.length === 1 ? a.file : undefined, fresh: !!a.fresh});
    scores.push(s);
    const fails = s.rows.filter((r) => r.status === 'fail').length, nm = s.rows.filter((r) => r.status === 'n/m').length;
    console.log(`\nSCORE  ${s.title}  (${s.rows.length - nm} measured: ${s.rows.length - nm - fails} pass, ${fails} fail; ${nm} not measured yet)`);
    for (const r of s.rows) console.log(`  ${r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : 'n/m '}  ${r.area.padEnd(7)} ${r.measure.padEnd(40)} ${String(r.value).padEnd(18)} pass ${r.pass}${r.owner ? '   <- you saw it' : ''}`);
    if (!a['no-sheet']) console.log(`  sheet  ${path.relative(ROOT, drawSheet([s], path.join(videoDir(slug), 'renders', 'scoreboard.jpg'), `Scoreboard: ${s.title}`))}`);
  }
  if (scores.length > 1 && !a['no-sheet']) {
    const out = a.sheet ? path.resolve(String(a.sheet)) : path.join(ROOT, 'out', 'toons', 'scoreboard.jpg');
    console.log(`\nsheet  ${drawSheet(scores, out, a.title ? String(a.title) : `Scoreboard: our ${scores.length} newest Toons against the 20 reference Shorts`)}`);
  }
  process.exit(scores.every((s) => s.rows.every((r) => r.status !== 'fail')) ? 0 : 1);
}
