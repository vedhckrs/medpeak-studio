#!/usr/bin/env node
/**
 * Toon music beds: a few short, loopable comedy underscores made ONCE with ElevenLabs Music, kept in
 * assets/toons-music/ (committed) and reused. A Toon picks one by name ("music": "bouncy").
 *
 *   node pipeline/toon-music.mjs --dry-run
 *   node pipeline/toon-music.mjs --approve --max-credits N [--only bouncy] [--model music_v2_5]
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
  const todo = BEDS.filter(([n]) => (only ? only.has(n) : !fs.existsSync(path.join(MUSIC_DIR, `${n}.mp3`))));
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
