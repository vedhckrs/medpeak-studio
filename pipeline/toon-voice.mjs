#!/usr/bin/env node
/**
 * Toon voices: each line is spoken by its character's fixed voice (skill/medpeak-health/toons-cast.json),
 * with word timing for lip-sync, then pitch-shifted to the character with ffmpeg.
 *
 *   node pipeline/toon-voice.mjs <slug> --dry-run                       # free: characters, credits, balance
 *   node pipeline/toon-voice.mjs <slug> --approve --max-characters N    # spends credits, capped at N
 *   node pipeline/toon-voice.mjs <slug> --approve --max-characters N --only A1,B2
 *   node pipeline/toon-voice.mjs <slug> --remix                         # free: pitch and level again from the raw downloads
 *   node pipeline/toon-voice.mjs --audition --dry-run                   # one short line per character
 *   node pipeline/toon-voice.mjs --audition --approve --max-characters N   # -> out/toons/auditions/<who>.mp3
 *   node pipeline/toon-voice.mjs --audition --who gunk,crew --dry-run   # only these characters
 *
 * Lines already voiced with the same text, voice and pitch are skipped (no double spend).
 * Writes public/toons/<slug>/voice/<id>.mp3 and videos/<slug>/toon-timings.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, PUBLIC, ROOT, readJson, videoDir, writeJson} from './lib/util.mjs';
import {approved, balance, costOf, needApproval, post, printPool} from './lib/eleven.mjs';
import {loadCast, seconds, voiceFx} from './lib/toon-audio.mjs';
import {toWords} from './voice.mjs';

const AUDITION = 'Hello! This is my voice. Wait, what was that? Oh no, not again!';

let billed = 0;
const speakLine = async (cast, who, text, emotion, rawFile) => {
  const c = cast.cast[who];
  const act = cast.acting[emotion ?? 'neutral'] ?? cast.acting.neutral;
  const r = await post(`/text-to-speech/${c.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    text,
    model_id: cast.model,
    voice_settings: {stability: act.stability, similarity_boost: 0.8, style: act.style, use_speaker_boost: true, speed: c.speed ?? 1},
  });
  billed += costOf(r) ?? text.length;
  const d = await r.json();
  fs.mkdirSync(path.dirname(rawFile), {recursive: true});
  fs.writeFileSync(rawFile, Buffer.from(d.audio_base64, 'base64'));
  return toWords(d.alignment);
};

const main = async () => {
  const a = args();
  const cast = loadCast();
  const cap = Number(a['max-characters'] || 0);

  if (a.audition) {
    const only = typeof a.who === 'string' ? a.who.split(',').map((w) => w.trim()).filter(Boolean) : [];
    const unknown = only.filter((w) => !cast.cast[w]);
    if (unknown.length) { console.error(`Not in the cast: ${unknown.join(', ')}`); process.exit(2); }
    const names = only.length ? only : Object.keys(cast.cast);
    const chars = names.length * AUDITION.length;
    const bal = await balance();
    console.log(`Voice audition: ${names.length} characters x ${AUDITION.length} characters = ${chars} credits on ${cast.model}`);
    printPool(bal);
    if (a['dry-run']) return;
    if (!approved()) needApproval(`voice audition (${chars} characters)`);
    if (!cap || chars > cap) { console.error(`Stopped: ${chars} characters is over the approved cap (--max-characters ${cap || 'missing'}).`); process.exit(5); }
    const out = path.join(ROOT, 'out', 'toons', 'auditions');
    for (const who of names) {
      const raw = path.join(out, 'raw', `${who}.mp3`);
      await speakLine(cast, who, AUDITION, 'happy', raw);
      voiceFx(raw, path.join(out, `${who}.mp3`), cast.cast[who].pitch);
      console.log(`audition: ${who} (${cast.cast[who].voice}, pitch ${cast.cast[who].pitch})`);
    }
    console.log(`Done. Spent ${billed} credits. Files in out/toons/auditions/`);
    return;
  }

  const slug = a._[0];
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const tPath = path.join(videoDir(slug), 'toon-timings.json');
  const timings = readJson(tPath, {lines: {}});
  // forget lines the script no longer has (a removed scene used to stay in the file for good)
  const scripted = new Set(toon.shots.flatMap((s) => s.lines ?? []).map((l) => l.id));
  for (const id of Object.keys(timings.lines)) if (!scripted.has(id)) delete timings.lines[id];
  const outDir = path.join(PUBLIC, 'toons', slug, 'voice');
  const only = a.only ? new Set(String(a.only).split(',')) : null;
  const lines = toon.shots.flatMap((s) => s.lines);
  for (const l of lines) if (!cast.cast[l.who]) throw new Error(`Line ${l.id}: no voice cast for "${l.who}" in toons-cast.json`);
  const todo = lines.filter((l) => {
    if (only) return only.has(l.id);
    const t = timings.lines[l.id];
    const c = cast.cast[l.who];
    return !(t && t.text === l.text && t.voiceId === c.voiceId && t.pitch === c.pitch && fs.existsSync(path.join(outDir, `${l.id}.mp3`)));
  });
  if (a.remix) { // free: pitch and level every line again from the raw downloads
    for (const l of lines) {
      const raw = path.join(ROOT, 'out', 'toons', 'raw', slug, `${l.id}.mp3`);
      if (!fs.existsSync(raw) || !timings.lines[l.id]) { console.log(`no raw file for ${l.id}`); continue; }
      const file = path.join(outDir, `${l.id}.mp3`);
      const was = timings.lines[l.id].tempo ?? 1;
      const now = Math.max(0.9, Math.min(1.15, l.tempo ?? 1)); // a line's own pace (toon.json: "tempo"), free to change
      voiceFx(raw, file, cast.cast[l.who].pitch, now, l.cut ?? null); // "cut": keep only this many seconds (a stray sound after the last word)
      Object.assign(timings.lines[l.id], {pitch: cast.cast[l.who].pitch, tempo: now, duration: +(seconds(file) + 0.05).toFixed(3), words: timings.lines[l.id].words.map((w) => ({...w, start: +((w.start * was) / now).toFixed(3), end: +((w.end * was) / now).toFixed(3)}))});
    }
    writeJson(tPath, timings);
    console.log('Lines mixed again (free).');
    return;
  }
  const chars = todo.reduce((n, l) => n + l.text.length, 0);
  const bal = await balance();
  console.log(`Lines to voice: ${todo.length} of ${lines.length}`);
  const by = {};
  for (const l of todo) by[l.who] = (by[l.who] ?? 0) + l.text.length;
  for (const [who, n] of Object.entries(by)) console.log(`  ${who.padEnd(10)} ${cast.cast[who].voice.padEnd(8)} pitch ${String(cast.cast[who].pitch).padStart(2)}  ${n} characters`);
  console.log(`Characters: ${chars}  ->  about ${chars} credits on ${cast.model}`);
  printPool(bal);
  if (a['dry-run'] || !todo.length) return;
  if (!approved()) needApproval(`toon voices for ${todo.length} lines (${chars} characters)`);
  if (!cap || chars > cap) { console.error(`Stopped: ${chars} characters is over the approved cap (--max-characters ${cap || 'missing'}).`); process.exit(5); }

  for (const l of todo) {
    const c = cast.cast[l.who];
    const raw = path.join(ROOT, 'out', 'toons', 'raw', slug, `${l.id}.mp3`);
    const words = await speakLine(cast, l.who, l.text, l.emotion, raw);
    const file = path.join(outDir, `${l.id}.mp3`);
    const tempo = Math.max(0.9, Math.min(1.15, l.tempo ?? 1));
    voiceFx(raw, file, c.pitch, tempo, l.cut ?? null);
    timings.lines[l.id] = {who: l.who, text: l.text, voiceId: c.voiceId, pitch: c.pitch, tempo, file: `toons/${slug}/voice/${l.id}.mp3`, duration: +(seconds(file) + 0.05).toFixed(3), words: words.map((w) => ({...w, start: +(w.start / tempo).toFixed(3), end: +(w.end / tempo).toFixed(3)}))};
    writeJson(tPath, timings);
    console.log(`voiced ${l.id}  ${l.who}  ${timings.lines[l.id].duration}s`);
  }
  console.log(`Done. Spent ${billed} credits.`);
};

main().catch((e) => { console.error(e.message); process.exit(1); });
