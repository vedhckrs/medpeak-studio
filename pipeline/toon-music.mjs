#!/usr/bin/env node
/**
 * Toon music beds: a few short, loopable comedy underscores made ONCE with ElevenLabs Music, kept in
 * assets/toons-music/ (committed) and reused. A Toon picks one by name ("music": "bouncy").
 *
 *   node pipeline/toon-music.mjs --dry-run
 *   node pipeline/toon-music.mjs --approve --max-credits N [--only bouncy] [--model music_v2_5]
 *   node pipeline/toon-music.mjs --slug rabies --dry-run | --approve --max-credits N [--seconds 40] [--force]
 *       one video's OWN track (format 5), from "musicPrompt" in its toon.json, saved as <slug>.mp3
 *       format 6 (engine v9, decision 22): the prompt is the ONE music family's template (toon-rules.mjs MUSIC_TEMPLATE:
 *       playful funk, slap bass, 130-165 BPM, a brighter half from the doctor's answer) filled in with the video's own
 *       "musicColour" and "musicBpm" (musicPrompt6), unless its "musicPrompt" already passes the family gate. After the
 *       track is made, `npm run toon:music:scan` checks it by ear (earshot: funk/playful, 130-165 BPM).
 *
 * Price measured 2026-11-16: 500 credits for a 40 s bed (12.5 a second; the four beds were 1,875). The
 * music response carries no cost header and the balance counter lags by a few minutes, so the script
 * waits for the first bed to show on the balance and stops if the set would go over the cap.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, isMain, ROOT} from './lib/util.mjs';
import {approved, balance, costOf, needApproval, post, printPool, settledSpend} from './lib/eleven.mjs';
import {bedFx, MUSIC_DIR} from './lib/toon-audio.mjs';
import {F6, musicPrompt6} from './lib/toon-rules.mjs';
import {layoutToon, TOON_FPS} from '../src/toons/director.ts';

/** Does a prompt belong to the format-6 music family (the gate's own test: "funk" and a tempo in the band)? */
export const inFamily = (prompt) => {
  const bpm = Number(String(prompt).match(/(\d{2,3})\s*bpm/i)?.[1] ?? NaN);
  return /funk/i.test(prompt) && bpm >= F6.bpm[0] && bpm <= F6.bpm[1];
};
/** A format-6 video's track prompt: its own if it is in the family, else the template with its colour and the answer's second. */
export const prompt6 = (toon) => {
  if (inFamily(toon.musicPrompt ?? '')) return String(toon.musicPrompt);
  const L = layoutToon(toon, null);
  const ans = L.lines.find((l) => l.line.answer);
  return musicPrompt6({colour: toon.musicColour ?? 'one light colour of the topic', answerAt: ans ? ans.from / TOON_FPS : (L.total / TOON_FPS) * 0.6, bpm: toon.musicBpm ?? 150});
};

const TAIL = 'Instrumental only, no vocals, no lead melody that fights a voice, keep the 1-4 kHz voice range clear, steady and loopable, clean ending.';
export const BEDS = [
  ['bouncy', 40, `Playful cartoon comedy underscore: pizzicato strings, ukulele, light woodblock percussion, bouncy tuba bass, 112 BPM, sneaky and funny. ${TAIL}`],
  ['sneaky', 40, `Tiptoe sneaking cartoon underscore: pizzicato bass, clarinet and soft xylophone, mysterious but funny, 96 BPM. ${TAIL}`],
  ['panic', 30, `Fast comedic chase underscore: quick xylophone runs, staccato strings and snare, cartoon panic, 150 BPM. ${TAIL}`],
  ['doctor', 40, `Warm reassuring underscore for a kind doctor explaining: soft marimba, felt piano and light shaker, calm and hopeful, 92 BPM. ${TAIL}`],
];

const main = async () => {
  const a = args();
  const only = a.only ? new Set(String(a.only).split(',')) : null;
  // --slug <slug>: this video's own track, from "musicPrompt" in its toon.json (format 5: never a shared bed)
  const own = a.slug ? JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', String(a.slug), 'toon.json'), 'utf8')) : null;
  const six = own && (own.format ?? 0) >= 6;
  if (own && !six && String(own.musicPrompt ?? '').length < 40) { console.error(`Stopped: videos/${a.slug}/toon.json needs a "musicPrompt" (40+ characters).`); process.exit(2); }
  const ownPrompt = own ? (six ? prompt6(own) : String(own.musicPrompt)) : '';
  if (six) console.log(`Format 6 music family prompt: ${ownPrompt}`);
  const list = own ? [[String(a.slug), Number(a.seconds || (six ? 60 : 40)), `${ownPrompt} ${TAIL}`]] : BEDS;
  const todo = list.filter(([n]) => (own && a.force) || (only ? only.has(n) : !fs.existsSync(path.join(MUSIC_DIR, `${n}.mp3`))));
  const total = todo.reduce((s, [, d]) => s + d, 0);
  const bal = await balance();
  console.log(`Music beds to make: ${todo.map(([n, d]) => `${n} (${d} s)`).join(', ') || 'none'}  ->  ${total} s in total`);
  console.log(`Cost: about ${Math.round(total * 12.5)} credits (12.5 credits a second, measured 2026-11-16; the script measures the first bed again and stops over the cap)`);
  printPool(bal);
  if (a['dry-run'] || !todo.length) return;
  if (!approved()) needApproval(`music beds (${total} s)`);
  const cap = Number(a['max-credits'] || 0);
  if (!cap) { console.error('Stopped: give the approved cap with --max-credits N.'); process.exit(5); }
  let doneSeconds = 0;
  let spent = 0;
  let byHeader = true;
  for (const [name, dur, prompt] of todo) {
    const body = {prompt, music_length_ms: dur * 1000, force_instrumental: true, ...(a.model ? {model_id: a.model} : {})};
    const r = await post('/music?output_format=mp3_44100_128', body);
    const cost = costOf(r);
    const raw = path.join(ROOT, 'out', 'toons', 'raw', 'music', `${name}.mp3`);
    fs.mkdirSync(path.dirname(raw), {recursive: true});
    fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    bedFx(raw, path.join(MUSIC_DIR, `${name}.mp3`));
    doneSeconds += dur;
    if (cost === null) byHeader = false;
    spent = byHeader ? spent + cost : await settledSpend(bal.left);
    const projected = Math.round((spent / doneSeconds) * total);
    console.log(`made ${name}: ${spent} credits spent so far; the set projects to ${projected}`);
    if (!spent) { console.error('Stopped: the cost of this bed could not be measured (no cost header and the balance did not move), so the rest was not made.'); process.exit(5); }
    if (projected > cap && doneSeconds < total) { console.error(`Stopped: the projected total ${projected} is over the approved cap ${cap}.`); process.exit(5); }
  }
  console.log(`Done. Beds in assets/toons-music/. Spent ${spent} credits (${byHeader ? 'as billed on each response' : 'from the balance'}).`);
};

if (isMain(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
