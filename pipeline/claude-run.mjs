#!/usr/bin/env node
/**
 * Runs headless Claude Code on the owner's Anthropic key for ONE video, under a HARD spend cap.
 * The owner's rule (2026-11-20): at most $5 of Anthropic spend per video. Never run `claude -p` on his key
 * any other way.
 *
 *   node pipeline/claude-run.mjs <slug> --task <file.txt> --label "<what>"   run one task
 *   node pipeline/claude-run.mjs <slug> --status                              show the ledger
 *   node pipeline/claude-run.mjs <slug> --book 2.50 --label "<why>"           book spend made outside this script
 *
 * How the cap holds:
 * - every run's cost is booked in videos/<slug>/claude-spend.json (committed, so both machines see it);
 * - only one run at a time (a lock file), so two runs can never each spend the whole remainder;
 * - each run gets `--max-budget-usd` = what is left minus a safety margin (Claude Code checks the budget
 *   between turns, so the last turn can overshoot a little); no run starts if less than MIN_RUN is left;
 * - if a run dies without reporting its cost, its whole allowed budget is booked.
 * The key comes from MEDPEAK_ANTHROPIC_KEY (the cloud) or ANTHROPIC_API_KEY (a machine). Works on macOS and Windows.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {args, isMain, loadEnv, readJson, videoDir, writeJson, ROOT} from './lib/util.mjs';

export const CAP_USD = 5;
export const MARGIN_USD = 0.75;
export const MIN_RUN_USD = 0.75;
export const MODEL = 'claude-opus-5-5';
export const EFFORT = 'medium';
export const TOOLS = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash(npm run typecheck)', 'Bash(npm test)', 'Bash(npx tsc:*)',
  'Bash(ls:*)', 'Bash(grep:*)', 'Bash(cat:*)', 'Bash(head:*)', 'Bash(sed -n:*)', 'Bash(wc:*)'];

const r2 = (n) => Math.round(n * 100) / 100;
export const spent = (ledger) => r2((ledger.runs || []).reduce((s, r) => s + (Number(r.costUsd) || 0), 0));
export const remaining = (ledger) => r2((ledger.capUsd ?? CAP_USD) - spent(ledger));
/** The budget one run may use, or 0 when no run may start. */
export const runBudget = (ledger) => {
  const b = r2(remaining(ledger) - MARGIN_USD);
  return b >= MIN_RUN_USD ? b : 0;
};

const ledgerPath = (slug) => path.join(videoDir(slug), 'claude-spend.json');
export const loadLedger = (slug) => readJson(ledgerPath(slug), {capUsd: CAP_USD, runs: []});
const book = (slug, entry) => {
  const l = loadLedger(slug);
  l.runs.push({date: new Date().toISOString(), ...entry, costUsd: r2(entry.costUsd)});
  writeJson(ledgerPath(slug), l);
  return l;
};
const status = (slug, l = loadLedger(slug)) =>
  `${slug}: spent $${spent(l).toFixed(2)} of $${(l.capUsd ?? CAP_USD).toFixed(2)}, left $${remaining(l).toFixed(2)}`;

const run = (slug, taskFile, label) => {
  const budget = runBudget(loadLedger(slug));
  if (!budget) throw new Error(`HARD CAP: ${status(slug)}. No run may start (needs $${(MIN_RUN_USD + MARGIN_USD).toFixed(2)} left). Ask the owner.`);
  loadEnv(); // the repo's .env (never committed) or MEDPEAK_ENV_FILES, as the ElevenLabs keys; never printed
  const key = process.env.MEDPEAK_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No key: set MEDPEAK_ANTHROPIC_KEY (cloud) or ANTHROPIC_API_KEY (machine).');
  const lock = path.join(videoDir(slug), '.claude-run.lock');
  try { fs.writeFileSync(lock, String(process.pid), {flag: 'wx'}); } catch {
    throw new Error(`Another run holds ${lock}. One run at a time (the cap). Delete it only if no run is going.`);
  }
  try {
    const prompt = fs.readFileSync(taskFile, 'utf8');
    console.log(`${status(slug)}; this run may use $${budget.toFixed(2)}`);
    const res = spawnSync('claude', ['-p', prompt, '--model', MODEL, '--effort', EFFORT, '--output-format', 'json',
      '--max-budget-usd', String(budget), '--permission-mode', 'acceptEdits', '--allowedTools', ...TOOLS],
    {cwd: ROOT, env: {...process.env, ANTHROPIC_API_KEY: key}, encoding: 'utf8', maxBuffer: 64 << 20,
      shell: process.platform === 'win32'});
    let out = null;
    try { out = JSON.parse(res.stdout); } catch { /* died without a report */ }
    const cost = out && typeof out.total_cost_usd === 'number' ? out.total_cost_usd : budget;
    const l = book(slug, {label, costUsd: cost, ...(out ? {} : {estimated: true, note: 'no cost report; whole budget booked'})});
    console.log(`run cost $${cost.toFixed(2)}${out ? '' : ' (booked, no report)'}; ${status(slug, l)}`);
    if (out?.result) console.log(`\n${out.result}`);
    return out;
  } finally { fs.rmSync(lock, {force: true}); }
};

if (isMain(import.meta.url)) {
  const a = args();
  const slug = a._[0];
  if (!slug) { console.error('usage: node pipeline/claude-run.mjs <slug> --task <file> --label "<what>" | --status | --book <usd> --label "<why>"'); process.exit(2); }
  try {
    if (a.status) console.log(status(slug));
    else if (a.book !== undefined) console.log(status(slug, book(slug, {label: a.label || 'booked by hand', costUsd: Number(a.book), estimated: true})));
    else if (a.task) run(slug, a.task, a.label || path.basename(a.task));
    else throw new Error('give --task, --status or --book');
  } catch (e) { console.error(e.message); process.exit(1); }
}
