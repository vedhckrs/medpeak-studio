/**
 * MedPeak Toons: compare what a voice line SAYS with what the script says (owner, 2026-11-17: "Ear repo
 * you have to listen audio right"; earshot hears speech but not words).
 *
 * The listener is NVIDIA Parakeet TDT 0.6b v3 run by parakeet-mlx on this Mac (free, offline). It writes
 * down each clip; this file lines its words up with the script's and says what differs.
 *
 * What counts:
 *   missing   a script word that was not heard
 *   extra     a heard word that is not in the script
 *   changed   a script word heard as another word
 * What is only a note (look, do not fail): a cry such as "Ow!" or "Nooo!" (any listener writes those
 * oddly), a near miss (one letter apart, or a plural), a word the listener itself was unsure of.
 */
import os from 'node:os';
import path from 'node:path';

/** The pinned listener. Changing the model means running the control test again (pipeline/test). */
export const WORDS = {
  tool: 'parakeet-mlx 0.7.0',
  model: 'mlx-community/parakeet-tdt-0.6b-v3',
  revision: 'ed2b7e8c15f9aaa0b5772e2efb986255eaef7e15',
  sha256: '05e01c7f396c298cf7d23f61da7b504adeab698f0aaeafd9c82d198625464592', // of model.safetensors, as Hugging Face lists it
  unsure: 0.5, // a word the listener gives less than this is listed as "unsure"
};
export const wordsPython = () => path.join(os.homedir(), '.local', 'share', 'uv', 'tools', 'parakeet-mlx', 'bin', 'python');
/** The model lives in a folder of its own, named by its exact version (config.json, tokenizer files, model.safetensors). */
export const wordsModelDir = () => path.join(os.homedir(), '.cache', 'medpeak', `${WORDS.model.split('/')[1]}-${WORDS.revision}`);

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numberWords = (n) => (n < 20 ? [ONES[n]] : n < 100 ? [TENS[Math.floor(n / 10)], ...(n % 10 ? [ONES[n % 10]] : [])] : [String(n)]);
/** Cries and noises: every listener spells them its own way, so a difference here is a note. */
export const CRIES = new Set(['ow', 'oh', 'ah', 'aw', 'ha', 'haha', 'hey', 'no', 'noo', 'nooo', 'ugh', 'uh', 'um', 'hm', 'hmm', 'mm', 'shh', 'sh', 'psst', 'burp', 'whoa', 'wow', 'yay', 'oops', 'huh', 'eh', 'ew', 'phew', 'yikes']);

/** A sentence as plain comparable words: lower case, no punctuation, numbers spelled out, "okay" = "ok". */
export const normWords = (text) => String(text ?? '')
  .toLowerCase()
  .replace(/[’‘`]/g, "'")
  .replace(/(\d+)\s*%/g, '$1 percent')
  .replace(/[-–—/]/g, ' ')
  .replace(/[^a-z0-9' ]+/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .flatMap((w) => (/^\d+$/.test(w) ? numberWords(Number(w)) : [w]))
  .map((w) => w.replace(/^'+|'+$/g, '').replace(/^okay$/, 'ok').replace(/(.)\1{2,}/g, '$1$1'))
  .filter(Boolean);

const dist = (a, b) => { // letters apart
  const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const bare = (w) => w.replace(/'/g, '');
/** Two words that are the same for our purpose, or nearly: one letter apart in a longer word, or a plural. */
export const nearWord = (a, b) => bare(a) === bare(b) || (Math.min(a.length, b.length) >= 4 && dist(bare(a), bare(b)) <= 1) || bare(a) === `${bare(b)}s` || bare(b) === `${bare(a)}s`;

/**
 * Line the script's words up with the heard words. Returns {same, missing, extra, changed, notes, faults}:
 * `faults` are the differences that matter, `notes` the ones to look at.
 */
export const diffWords = (script, heard) => {
  const a = normWords(script);
  const b = normWords(heard);
  // the cheapest way to turn the script's words into the heard words: a word kept, a near miss, a word
  // changed, a word dropped, a word added
  const cost = (x, y) => (bare(x) === bare(y) ? 0 : nearWord(x, y) ? 0.4 : 1);
  const D = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) D[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + cost(a[i - 1], b[j - 1]));
  const out = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && Math.abs(D[i][j] - (D[i - 1][j - 1] + cost(a[i - 1], b[j - 1]))) < 1e-9) { out.unshift([bare(a[i - 1]) === bare(b[j - 1]) ? 'same' : 'changed', a[i - 1], b[j - 1]]); i--; j--; }
    else if (i > 0 && Math.abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9) { out.unshift(['missing', a[i - 1], null]); i--; }
    else { out.unshift(['extra', null, b[j - 1]]); j--; }
  }
  const res = {same: 0, missing: [], extra: [], changed: [], notes: [], faults: [], script: a, heard: b};
  for (const [kind, s, h] of out) {
    if (kind === 'same') { res.same++; continue; }
    const cry = (s && CRIES.has(bare(s))) || (h && CRIES.has(bare(h)) && !s);
    const text = kind === 'missing' ? `"${s}" was not heard` : kind === 'extra' ? `"${h}" was heard but is not in the script` : `"${s}" was heard as "${h}"`;
    res[kind].push(kind === 'changed' ? [s, h] : s ?? h);
    if (cry) res.notes.push(`${text} (a cry: check by ear)`);
    else if (kind === 'changed' && nearWord(s, h)) res.notes.push(`${text} (a near miss)`);
    else res.faults.push(text);
  }
  return res;
};
