// ElevenLabs access with a key pool. Paid calls need --approve on the command line of that run
// (owner rule: quote first, then wait). Keys are read from env files and never printed.
//
// Key pool (owner 2026-11-15: "use all together, when one ends switch to another automatically"):
// ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_2 ... _9. Order of use: subscription keys whose credits reset
// soonest first (so credits that would expire get used), pay-as-you-go keys last (they cost real money
// once their included credits are gone). A key with fewer than MIN_LEFT credits is skipped. When
// ElevenLabs refuses a request for quota (refused requests are not charged), that key is marked empty
// and the same request goes to the next key. When a library voice is missing on the next account it
// is added first (needs voice.publicOwnerId in video.json). All keys empty: exit 6, refill.
import {loadEnv} from './util.mjs';

export const API = 'https://api.elevenlabs.io/v1';
export const APPROVAL_EXIT = 5;
export const KEYS_EMPTY_EXIT = 6;
export const MIN_LEFT = 300;

const NAMES = ['ELEVENLABS_API_KEY', ...Array.from({length: 8}, (_, i) => `ELEVENLABS_API_KEY_${i + 2}`)];
const label = (name) => (name === 'ELEVENLABS_API_KEY' ? 'key 1' : `key ${name.split('_').pop()}`);

export const keys = () => {
  loadEnv();
  const out = [];
  for (const name of NAMES) {
    const k = process.env[name];
    if (k && !out.some((o) => o.key === k)) out.push({name, label: label(name), key: k});
  }
  if (!out.length) {
    console.error('No ElevenLabs key. Put ELEVENLABS_API_KEY=... in medpeak-studio/.env (add _2, _3 ... for more).');
    process.exit(2);
  }
  return out;
};

const keyBalance = async (k) => {
  try {
    const r = await fetch(`${API}/user/subscription`, {headers: {'xi-api-key': k.key}});
    if (!r.ok) return {...k, ok: false, status: r.status, left: 0};
    const d = await r.json();
    return {...k, ok: true, plan: d.tier, used: d.character_count, limit: d.character_limit, left: d.character_limit - d.character_count,
      resets: d.next_character_count_reset_unix ? new Date(d.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : '9999'};
  } catch { return {...k, ok: false, status: 'network', left: 0}; }
};

/** Every key with its balance, in the order they will be used. */
export const pool = async () => {
  const all = await Promise.all(keys().map(keyBalance));
  const payg = (b) => /payg|pay_as_you_go|usage/i.test(b.plan || '');
  return all.sort((a, b) => (payg(a) - payg(b)) || String(a.resets).localeCompare(String(b.resets)));
};

/** Total and per-key balance (free). */
export const balance = async () => {
  const p = await pool();
  const usable = p.filter((b) => b.ok);
  return {left: usable.reduce((n, b) => n + b.left, 0), keys: p, plan: usable.map((b) => b.plan).join('+'), resets: usable.map((b) => b.resets).sort()[0]};
};

export const printPool = (bal) => {
  for (const b of bal.keys) {
    console.log(`  ${b.label.padEnd(6)} ${b.ok ? `${String(b.plan).padEnd(9)} ${String(b.left).padStart(7)} left  resets ${b.resets}${/payg/i.test(b.plan) ? '  (pay-as-you-go: used last)' : ''}` : `NOT WORKING (${b.status})`}`);
  }
  console.log(`  TOTAL  ${bal.left} credits across ${bal.keys.filter((b) => b.ok).length} keys`);
};

export const approved = () => process.argv.slice(2).includes('--approve');
export const needApproval = (what) => {
  console.error(`APPROVAL needed: ElevenLabs ${what}. Nothing was sent. Run again with --approve to spend it.`);
  process.exit(APPROVAL_EXIT);
};

const empty = new Set();
let order = null;
// a key whose subscription payment failed answers 401 payment_required (2026-11-22, key 2): it cannot spend, so it counts as empty
const isQuota = (status, text) => status === 401 && /quota|credits|exceed|payment/i.test(text) || status === 402 || (status === 429 && /quota/i.test(text));
const isMissingVoice = (status, text) => (status === 404 || status === 400) && /voice_not_found|voice.*not.*found|does not exist/i.test(text);

/** Add a shared library voice to the account behind `k` (free). */
const addVoice = async (k, voice) => {
  if (!voice?.publicOwnerId) return false;
  const r = await fetch(`${API}/voices/add/${voice.publicOwnerId}/${voice.voiceId}`, {method: 'POST', headers: {'xi-api-key': k.key, 'content-type': 'application/json'}, body: JSON.stringify({new_name: voice.name || voice.voiceId})});
  return r.ok;
};

/**
 * POST to ElevenLabs on the first key with credits; on a quota refusal switch to the next key
 * and send the same request again. `voice` ({voiceId, publicOwnerId}) lets a missing library voice be added.
 */
export const post = async (path, body, {voice} = {}) => {
  if (!order) order = (await pool()).filter((b) => b.ok);
  for (const k of order) {
    if (empty.has(k.name) || k.left < MIN_LEFT) continue;
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(`${API}${path}`, {method: 'POST', headers: {'xi-api-key': k.key, 'content-type': 'application/json'}, body: JSON.stringify(body)});
      if (r.ok) return r;
      const text = await r.text();
      if (isMissingVoice(r.status, text) && attempt === 0 && (await addVoice(k, voice))) continue;
      if (isQuota(r.status, text) || isMissingVoice(r.status, text)) {
        empty.add(k.name);
        console.log(`  ${k.label} ${isQuota(r.status, text) ? 'is out of credits' : 'does not have this voice'}: switching to the next key`);
        break;
      }
      throw new Error(`ElevenLabs ${path} failed on ${k.label}: ${r.status} ${text.slice(0, 300)}`);
    }
  }
  console.error('All ElevenLabs keys are out of credits. Refill or add a key (ELEVENLABS_API_KEY_N in .env).');
  process.exit(KEYS_EMPTY_EXIT);
};

/** A free GET on the first working key. */
export const get = async (path) => {
  const k = (await pool()).find((b) => b.ok);
  const r = await fetch(`${API}${path}`, {headers: {'xi-api-key': k.key}});
  if (!r.ok) throw new Error(`ElevenLabs GET ${path}: ${r.status}`);
  return r.json();
};

/** Credits one response cost, from ElevenLabs' own "character-cost" header (null when it is missing). */
export const costOf = (r) => {
  const h = r.headers.get('character-cost');
  const n = Number(h);
  return h !== null && h !== '' && Number.isFinite(n) && n >= 0 ? n : null;
};
/** The balance counter can lag behind a request: read it until it drops below `before` (about a minute at most). */
export const settledSpend = async (before, tries = 6) => {
  for (let i = 0; i < tries; i++) {
    const now = (await balance()).left;
    if (now < before) return before - now;
    await new Promise((res) => setTimeout(res, 10000));
  }
  return 0;
};
