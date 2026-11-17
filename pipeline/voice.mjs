#!/usr/bin/env node
/**
 * Voice: one ElevenLabs narration file per scene, with word-level timing for captions.
 *
 *   node pipeline/voice.mjs --voices                       # free: list voices on the account
 *   node pipeline/voice.mjs <slug> --dry-run               # free: characters, credits, balance
 *   node pipeline/voice.mjs <slug> --approve --max-characters N   # spends credits, capped at N
 *   node pipeline/voice.mjs <slug> --approve --only S07,S08       # re-voice some scenes
 *   node pipeline/voice.mjs <slug> --pick-voice            # free: draw a new random narrator
 *
 * Narrator: every video gets a random voice from skill/medpeak-health/voices.json (15 voices),
 * never one of the last 7 videos' voices; the long video and its Shorts share it. Scenes already voiced with
 * the same text are skipped (no double spend). Writes public/videos/<slug>/voice/<id>.mp3 and
 * videos/<slug>/timings.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {allScenes, args, isMain, loadVideo, PUBLIC, readJson, videoDir, writeJson} from './lib/util.mjs';
import {approved, balance, get, needApproval, post, printPool} from './lib/eleven.mjs';
import {pickVoice, recentVoices, voicePool} from './lib/voices.mjs';

const CREDITS_PER_CHAR = {eleven_multilingual_v2: 1, eleven_v3: 1, eleven_turbo_v2_5: 0.5, eleven_flash_v2_5: 0.5};

const probeSeconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

/** ElevenLabs character alignment -> words with start/end seconds. */
export const toWords = (al) => {
  const out = [];
  let cur = null;
  al.characters.forEach((ch, i) => {
    const s = al.character_start_times_seconds[i];
    const e = al.character_end_times_seconds[i];
    if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = null; } return; }
    if (!cur) cur = {w: '', start: s, end: e};
    cur.w += ch; cur.end = e;
  });
  if (cur) out.push(cur);
  return out;
};

const listVoices = async () => {
  const d = await get('/voices');
  for (const v of d.voices || []) {
    const l = v.labels || {};
    console.log(`${v.voice_id}  ${v.name.padEnd(28)} ${[l.gender, l.accent, l.age, l.use_case || l['use case'], l.description].filter(Boolean).join(', ')}`);
  }
};

/** Give the video a random narrator from the pool (free). Kept once voiced, unless --pick-voice again. */
const assignVoice = (slug, video, force) => {
  const voiced = fs.existsSync(path.join(videoDir(slug), 'timings.json'));
  if (video.voice?.voiceId && video.voice.pool && !force) return video.voice;
  if (voiced && !force) return video.voice;
  const v = pickVoice({pool: voicePool(), recent: recentVoices(slug)});
  video.voice = {voiceId: v.voiceId, publicOwnerId: v.publicOwnerId, name: v.name, model: video.voice?.model || 'eleven_multilingual_v2', pool: true};
  writeJson(path.join(videoDir(slug), 'video.json'), video);
  console.log(`Narrator for this video (random, not used recently): ${v.name} - ${v.gender}, ${v.accent}, ${v.style}`);
  return video.voice;
};

const main = async () => {
  const a = args();
  if (a.voices) return listVoices();
  const slug = a._[0];
  const video = loadVideo(slug);
  if (a['pick-voice'] && fs.existsSync(path.join(videoDir(slug), 'timings.json')) && !a.force) {
    console.error('This video is already voiced; a new narrator means re-voicing everything. Add --force to do it anyway.');
    process.exit(1);
  }
  assignVoice(slug, video, !!a['pick-voice']);
  if (a['pick-voice']) return;
  const {voiceId, model = 'eleven_multilingual_v2', settings} = video.voice;
  const voiceRef = video.voice;
  console.log(`Narrator: ${video.voice.name || voiceId}`);

  const tPath = path.join(videoDir(slug), 'timings.json');
  const timings = readJson(tPath, {voiceId, model, scenes: {}});
  const outDir = path.join(PUBLIC, 'videos', slug, 'voice');
  const only = a.only ? new Set(String(a.only).split(',')) : null;
  const scenes = allScenes(video);
  const todo = scenes.filter((s) => {
    if (only) return only.has(s.id);
    const t = timings.scenes[s.id];
    return !(t && t.text === s.text && t.voiceId === voiceId && fs.existsSync(path.join(outDir, `${s.id}.mp3`)));
  });
  const chars = todo.reduce((n, s) => n + s.text.length, 0);
  const credits = Math.ceil(chars * (CREDITS_PER_CHAR[model] ?? 1));
  const bal = await balance();
  console.log(`Scenes to voice: ${todo.length} of ${scenes.length}`);
  console.log(`Characters: ${chars}  ->  about ${credits} credits on ${model}`);
  console.log('ElevenLabs keys (used in this order, auto-switch when one runs out):');
  printPool(bal);
  console.log(`After this run: about ${bal.left - credits} credits left in total`);
  if (a['dry-run'] || !todo.length) return;
  if (!approved()) needApproval(`voice for ${todo.length} scenes (${chars} characters, ~${credits} credits)`);
  const cap = Number(a['max-characters'] || 0);
  if (!cap || chars > cap) {
    console.error(`Stopped: ${chars} characters is over the approved cap (--max-characters ${cap || 'missing'}).`);
    process.exit(5);
  }
  if (credits > bal.left) { console.error('Stopped: not enough credits.'); process.exit(6); }

  fs.mkdirSync(outDir, {recursive: true});
  const order = scenes.map((s) => s.id);
  for (const s of todo) {
    const i = order.indexOf(s.id);
    const body = {
      text: s.text,
      model_id: model,
      voice_settings: settings || {stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true},
      previous_text: scenes[i - 1]?.text,
      next_text: scenes[i + 1]?.text,
    };
    const r = await post(`/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, body, {voice: voiceRef});
    const d = await r.json();
    const file = path.join(outDir, `${s.id}.mp3`);
    fs.writeFileSync(file, Buffer.from(d.audio_base64, 'base64'));
    const duration = probeSeconds(file);
    timings.scenes[s.id] = {text: s.text, voiceId, model, file: `videos/${slug}/voice/${s.id}.mp3`, duration: +(duration + 0.25).toFixed(3), words: toWords(d.alignment)};
    writeJson(tPath, timings);
    console.log(`voiced ${s.id}  ${duration.toFixed(2)} s`);
  }
  const after = await balance();
  console.log(`Done. Credits left: ${after.left} (spent ${bal.left - after.left}).`);
};

if (isMain(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
