#!/usr/bin/env node
/**
 * Toon sound-effect library: made ONCE with ElevenLabs sound generation, kept in assets/toons-sfx/
 * (committed, so it is never paid for twice) and reused in every Toon.
 *
 *   node pipeline/toon-sfx.mjs --dry-run                        # free: the list, total seconds, cost range
 *   node pipeline/toon-sfx.mjs --approve --max-credits N        # makes the missing effects, capped at N
 *   node pipeline/toon-sfx.mjs --approve --max-credits N --only boing,pop
 *   node pipeline/toon-sfx.mjs --remix                          # free: level every effect again from the raw downloads
 *
 * Price measured 2026-11-16: 10 credits a second (the whole library was 327). The script still checks:
 * every response reports its cost, and it stops if the projected total would go over the cap. An effect
 * that comes back silent is asked for again (twice at most).
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, ROOT} from './lib/util.mjs';
import {approved, balance, costOf, needApproval, post, printPool, settledSpend} from './lib/eleven.mjs';
import {peakOf, SFX_DIR, sfxFx} from './lib/toon-audio.mjs';

// name, seconds, prompt. Short, dry, close-up cartoon sounds with no music and no voice.
export const LIBRARY = [
  ['whoosh-soft', 0.6, 'Soft airy whoosh, quick scene transition, cartoon, dry, no music'],
  ['whoosh-fast', 0.7, 'Loud fast whoosh swoosh, something swings past the microphone, cartoon swipe'],
  ['swish', 0.5, 'Tiny quick swish, light camera cut accent, subtle, dry'],
  ['zip-away', 0.7, 'Cartoon character zips away fast, rising zip sound, comedic'],
  ['slide-whistle-up', 0.8, 'Slide whistle going up, classic cartoon, clean'],
  ['slide-whistle-down', 0.9, 'Slide whistle going down, classic cartoon fall, clean'],
  ['boing', 0.7, 'Cartoon spring boing, single bouncy jaw harp boing, comedic'],
  ['spring-bounce', 0.8, 'Rubber ball bounce with springy cartoon wobble, single bounce'],
  ['wobble', 0.8, 'Nervous cartoon wobble shiver, quivering jelly sound, comedic'],
  ['pop', 0.5, 'Single clean cartoon pop, mouth pop, bright'],
  ['bubble-pop', 0.5, 'Small soap bubble pop, wet, cute'],
  ['plop', 0.5, 'Small object plops into thick liquid, cartoon plop'],
  ['squish', 0.6, 'Wet soft squish, squeezing jelly, cartoon'],
  ['squelch', 0.7, 'Slimy squelch step in goo, cartoon, short'],
  ['thud-soft', 0.6, 'Soft heavy thud on a padded floor, cartoon body land'],
  ['bonk', 0.5, 'Cartoon bonk on the head, hollow wooden knock, comedic'],
  ['footsteps-tiny', 1.5, 'Tiny quick cartoon footsteps running, pitter patter, light and fast'],
  ['skid', 0.7, 'Cartoon skid to a stop, short tire squeak'],
  ['gulp', 0.6, 'Single loud cartoon gulp swallow, throat'],
  ['gurgle-stomach', 1.5, 'Stomach gurgling and rumbling, hungry belly, wet, comedic'],
  ['heartbeat', 1.6, 'Two clear heartbeats, lub dub lub dub, close, steady'],
  ['burp-small', 0.6, 'Small polite cartoon burp, short, comedic'],
  ['toot', 0.6, 'Small squeaky cartoon toot, short, comedic, not gross'],
  ['sizzle-acid', 1.5, 'Acid sizzling and fizzing on a surface, bubbling hiss'],
  ['drip', 0.8, 'One loud water droplet plinks into a pool, close microphone, clear plink'],
  ['splash-small', 0.8, 'Small water splash, something drops into a pool, clean'],
  ['cough', 0.8, 'Cute cartoon cough, two short coughs, small character'],
  ['gasp', 0.7, 'Sharp surprised cartoon gasp, short, no words'],
  ['ding', 0.8, 'Bright bell ding, good idea, single clean chime'],
  ['sparkle', 1.0, 'Magical sparkle shimmer chime, twinkling, short'],
  ['success-chime', 1.0, 'Short happy success chime, three rising marimba notes'],
  ['tada', 1.2, 'Short ta-da brass fanfare sting, cheerful, comedic'],
  ['sad-trombone', 1.6, 'Sad trombone wah wah wah, short comedic fail'],
  ['record-scratch', 0.8, 'Vinyl record scratch stop, comedic interruption'],
  ['rimshot', 1.0, 'Drum rimshot ba dum tss, comedy punchline, dry'],
  ['alarm-beep', 1.0, 'Urgent cartoon alarm, three quick beeps, clean'],
  ['error-buzz', 0.6, 'Short wrong answer buzzer, game show'],
  ['caption-pop', 0.3, 'Very short soft click pop, tiny UI tick, subtle'],
];

const main = async () => {
  const a = args();
  const only = a.only ? new Set(String(a.only).split(',')) : null;
  const todo = LIBRARY.filter(([n]) => (only ? only.has(n) : !fs.existsSync(path.join(SFX_DIR, `${n}.mp3`))));
  const total = todo.reduce((s, [, d]) => s + d, 0);
  if (a.remix) { // free: level the effects again from the raw downloads
    for (const [n] of LIBRARY) { const raw = path.join(ROOT, 'out', 'toons', 'raw', 'sfx', `${n}.mp3`); if (fs.existsSync(raw)) sfxFx(raw, path.join(SFX_DIR, `${n}.mp3`)); else console.log(`no raw file for ${n}`); }
    console.log('Effects levelled again (free).');
    return;
  }
  const bal = await balance();
  console.log(`Sound effects to make: ${todo.length} of ${LIBRARY.length} (${total.toFixed(1)} s in total)`);
  console.log(`Cost: about ${Math.round(todo.reduce((n, [, d]) => n + Math.max(0.5, d), 0) * 10)} credits (10 credits a second, measured 2026-11-16; each response reports its own cost and the cap is checked as it goes)`);
  printPool(bal);
  if (a['dry-run'] || !todo.length) return;
  if (!approved()) needApproval(`sound-effect library (${todo.length} effects, ${total.toFixed(1)} s)`);
  const cap = Number(a['max-credits'] || 0);
  if (!cap) { console.error('Stopped: give the approved cap with --max-credits N.'); process.exit(5); }

  const billed = (d) => Math.max(0.5, d);
  const allSeconds = todo.reduce((n, [, d]) => n + billed(d), 0);
  let done = 0;
  let doneSeconds = 0;
  let spent = 0;
  let byHeader = true;
  const failed = [];
  for (const [name, dur, prompt] of todo) {
    const raw = path.join(ROOT, 'out', 'toons', 'raw', 'sfx', `${name}.mp3`);
    fs.mkdirSync(path.dirname(raw), {recursive: true});
    // now and then the service returns near-silence for a very short effect: ask again (twice at most)
    let cost = 0;
    let heard = false;
    for (let attempt = 0; attempt < 3 && !heard; attempt++) {
      const r = await post('/sound-generation', {text: prompt, duration_seconds: billed(dur), prompt_influence: attempt ? 0.4 : 0.6});
      const c = costOf(r);
      cost = c === null || cost === null ? null : cost + c;
      fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
      heard = peakOf(raw) > -30;
      if (!heard) console.log(`  ${name}: came back silent, asking again`);
    }
    if (!heard) { console.log(`  ${name}: still silent after 3 tries, skipped (run again with --only ${name})`); failed.push(name); }
    else sfxFx(raw, path.join(SFX_DIR, `${name}.mp3`));
    done++;
    doneSeconds += billed(dur);
    if (cost === null) byHeader = false;
    if (byHeader) spent += cost;
    else if (done === 1 || done % 8 === 0) spent = await settledSpend(bal.left);
    console.log(`made ${name}${cost === null ? '' : `  (${cost} credits)`}`);
    if (done === 1 && !spent) { console.error('Stopped after the first effect: its cost could not be measured (no cost header and the balance did not move), so the rest was not made.'); process.exit(5); }
    if (byHeader || done === 1 || done % 8 === 0) {
      const projected = Math.round((spent / doneSeconds) * allSeconds);
      if (done === 1 || done % 8 === 0) console.log(`  spent ${spent} credits so far (${(spent / doneSeconds).toFixed(1)} a second); the whole library projects to ${projected}`);
      if (projected > cap && done < todo.length) { console.error(`Stopped after ${done}: the projected total ${projected} is over the approved cap ${cap}.`); process.exit(5); }
    }
  }
  console.log(`Done. ${done - failed.length} effects in assets/toons-sfx/.${failed.length ? ` Not made: ${failed.join(', ')}.` : ''} Spent ${spent} credits (${byHeader ? 'as billed on each response' : 'from the balance'}).`);
};

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
