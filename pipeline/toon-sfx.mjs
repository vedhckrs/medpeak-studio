#!/usr/bin/env node
/**
 * Toon sound-effect library: made ONCE with ElevenLabs sound generation, kept in assets/toons-sfx/
 * (committed, so it is never paid for twice) and reused in every Toon.
 *
 *   node pipeline/toon-sfx.mjs --dry-run                        # free: the list, total seconds, cost range
 *   node pipeline/toon-sfx.mjs --approve --max-credits N        # makes the missing effects, capped at N
 *   node pipeline/toon-sfx.mjs --approve --max-credits N --only boing,pop
 *
 * ElevenLabs does not publish one firm API price for effects, so the script MEASURES it: it makes the
 * first effect, reads the real cost from the balance, and stops if the whole library would go over the cap.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, ROOT} from './lib/util.mjs';
import {approved, balance, needApproval, post, printPool} from './lib/eleven.mjs';
import {SFX_DIR, sfxFx} from './lib/toon-audio.mjs';

// name, seconds, prompt. Short, dry, close-up cartoon sounds with no music and no voice.
export const LIBRARY = [
  ['whoosh-soft', 0.6, 'Soft airy whoosh, quick scene transition, cartoon, dry, no music'],
  ['whoosh-fast', 0.5, 'Fast sharp whoosh swipe, cartoon, dry'],
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
  ['drip', 0.6, 'Single water drip in a cave with a short echo'],
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
  const bal = await balance();
  console.log(`Sound effects to make: ${todo.length} of ${LIBRARY.length} (${total.toFixed(1)} s in total)`);
  console.log(`Cost range: about ${Math.round(total * 11)}-${Math.round(total * 40)} credits (ElevenLabs lists 11 to 40 credits a second; the script measures the real rate on the first effect)`);
  printPool(bal);
  if (a['dry-run'] || !todo.length) return;
  if (!approved()) needApproval(`sound-effect library (${todo.length} effects, ${total.toFixed(1)} s)`);
  const cap = Number(a['max-credits'] || 0);
  if (!cap) { console.error('Stopped: give the approved cap with --max-credits N.'); process.exit(5); }

  let done = 0;
  let doneSeconds = 0;
  for (const [name, dur, prompt] of todo) {
    const r = await post('/sound-generation', {text: prompt, duration_seconds: Math.max(0.5, dur), prompt_influence: 0.6});
    const raw = path.join(ROOT, 'out', 'toons', 'raw', 'sfx', `${name}.mp3`);
    fs.mkdirSync(path.dirname(raw), {recursive: true});
    fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    sfxFx(raw, path.join(SFX_DIR, `${name}.mp3`));
    done++;
    doneSeconds += Math.max(0.5, dur);
    console.log(`made ${name}`);
    if (done === 1 || done % 8 === 0) {
      const spent = bal.left - (await balance()).left;
      const projected = Math.round((spent / doneSeconds) * todo.reduce((s, [, d]) => s + Math.max(0.5, d), 0));
      console.log(`  spent ${spent} credits so far (${(spent / doneSeconds).toFixed(1)} a second); the whole library projects to ${projected}`);
      if (projected > cap) { console.error(`Stopped after ${done}: the projected total ${projected} is over the approved cap ${cap}.`); process.exit(5); }
    }
  }
  const after = await balance();
  console.log(`Done. ${done} effects in assets/toons-sfx/. Spent ${bal.left - after.left} credits; ${after.left} left.`);
};

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
