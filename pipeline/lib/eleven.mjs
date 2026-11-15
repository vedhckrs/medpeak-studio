// ElevenLabs access. Paid calls need --approve on the command line of that run
// (owner rule: quote first, then wait). The key is read from env files, never printed.
import {loadEnv} from './util.mjs';

export const API = 'https://api.elevenlabs.io/v1';
export const APPROVAL_EXIT = 5;

export const key = () => {
  loadEnv();
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    console.error('No ELEVENLABS_API_KEY. Put it in medpeak-studio/.env or point MEDPEAK_ENV_FILES at the file that has it.');
    process.exit(2);
  }
  return k;
};

export const approved = () => process.argv.slice(2).includes('--approve');
export const needApproval = (what) => {
  console.error(`APPROVAL needed: ElevenLabs ${what}. Nothing was sent. Run again with --approve to spend it.`);
  process.exit(APPROVAL_EXIT);
};

export const balance = async () => {
  const r = await fetch(`${API}/user/subscription`, {headers: {'xi-api-key': key()}});
  if (!r.ok) throw new Error(`ElevenLabs balance check failed: ${r.status}`);
  const d = await r.json();
  return {plan: d.tier, used: d.character_count, limit: d.character_limit, left: d.character_limit - d.character_count,
    resets: d.next_character_count_reset_unix ? new Date(d.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : null};
};

export const post = async (path, body) => {
  const r = await fetch(`${API}${path}`, {method: 'POST', headers: {'xi-api-key': key(), 'content-type': 'application/json'}, body: JSON.stringify(body)});
  if (!r.ok) throw new Error(`ElevenLabs ${path} failed: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r;
};
