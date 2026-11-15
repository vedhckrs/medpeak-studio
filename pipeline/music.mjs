#!/usr/bin/env node
/**
 * Music bed: one instrumental track from ElevenLabs Music, looped and ducked under the voice
 * by the Remotion mix (0.12 in pauses, 0.045 under speech).
 *
 *   node pipeline/music.mjs <slug> --dry-run                     # free: seconds and prompt
 *   node pipeline/music.mjs <slug> --approve --max-seconds 120   # spends credits
 *
 * A 90-120 s bed is enough: the mix loops it with a crossfade. Prompt from video.json music.prompt.
 * Writes public/videos/<slug>/music.mp3.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, loadVideo, PUBLIC} from './lib/util.mjs';
import {approved, balance, needApproval, post, printPool} from './lib/eleven.mjs';

const DEFAULT_PROMPT = 'Calm, curious documentary underscore for a science and health explainer. Soft pulsing synth, warm piano motifs, light percussion, 95 BPM. No lead melody, no vocals, keep the 1-4 kHz voice range clear. Steady, hopeful, loopable.';

const main = async () => {
  const a = args();
  const slug = a._[0];
  const video = loadVideo(slug);
  const seconds = Number(video.music?.seconds || 120);
  const prompt = video.music?.prompt || DEFAULT_PROMPT;
  const bal = await balance();
  console.log(`Music: ${seconds} s instrumental\nPrompt: ${prompt}\nElevenLabs keys (auto-switch when one runs out):`);
  printPool(bal);
  if (a['dry-run']) return;
  if (!approved()) needApproval(`music (${seconds} s)`);
  if (!a['max-seconds'] || seconds > Number(a['max-seconds'])) {
    console.error(`Stopped: ${seconds} s is over the approved cap (--max-seconds).`);
    process.exit(5);
  }
  const r = await post('/music?output_format=mp3_44100_128', {prompt, music_length_ms: seconds * 1000, force_instrumental: true});
  const out = path.join(PUBLIC, 'videos', slug, 'music.mp3');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  const after = await balance();
  console.log(`Saved ${path.relative(process.cwd(), out)}. Credits spent: ${bal.left - after.left}.`);
};

main().catch((e) => { console.error(e.message); process.exit(1); });
