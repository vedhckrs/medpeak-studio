// Retention 7 (owner rule, 2026-11-15): every video passes all seven points before
// its script is approved. See skill/medpeak-health/references/retention-7.md.
// Also checks MedPeak's own rules: a source on every number, no banned medical claims.

export const INTRO_WORDS = [
  'namaste', 'namaskar', 'hello', 'hi guys', 'hey guys', 'doston', 'dosto', 'friends', 'welcome',
  'swagat', 'aaj hum', 'is video mein', 'iss video', 'in this video', 'today we', 'channel', 'medpeak',
];
const BANNED_CLAIMS = [
  /\bcures?\b/i, /\bguarantee[sd]?\b/i, /\bmiracle\b/i, /\bdetox(es|ify)?\b/i, /\b100% (safe|effective)\b/i,
  /\breverses? diabetes\b/i,
];
const STOP = new Set('a an the of to in on and or is are be your you it its this that for with does do what how why can could from at by as more than much'.split(' '));
const ORDINALS = [
  ['number one', 'first'], ['number two', 'second'], ['number three', 'third'],
  ['number four', 'fourth'], ['number five', 'fifth'], ['number six', 'sixth'], ['number seven', 'seventh'],
];
// a number said in words or digits that needs a source (not "one of", "number one" etc.)
const NUMBER_RE = /\b\d[\d,.]*\s*(%|percent|grams?|g\b|teaspoons?|times|days?|years?|million|people|servings?)|\b\d{2,}[\d,.]*\b|\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b|\b\w+ (percent|teaspoons?|grams?)\b/i;

const WPS = 2.6; // ElevenLabs English narration, words per second (estimate before voice exists)
const words = (t) => (t.toLowerCase().match(/[a-z0-9']+/g) || []);
const keyWords = (t) => words(t).filter((w) => w.length > 2 && !STOP.has(w));

/** Scene durations: real ones from timings.json when voiced, else an estimate. */
export const durations = (scenes, timings) => scenes.map((s) => {
  const t = timings?.scenes?.[s.id];
  return t ? t.duration : Math.max(1.5, words(s.text).length / WPS + 0.35);
});

export const panelsOf = (scene) => Math.max(1, (scene.visual?.panels || []).length || 1);

/**
 * Check one cut (the long video or a Short). Returns {ok, results:[{point, pass, detail}]}.
 * `toons6` (a Toon script of format 6, decision 4 of the engine-v9 blueprint, the owner's yes of 2026-11-23): Retention 7 read
 * for Toons: point 2 (the promise) is also met by the character's story question (`retention.question`) by 8 s; point 7 (the
 * loop) is also met by ending on a question or mid-line (`retention.loop.kind`: 'question' or 'midline'). The long videos
 * and the Toons already out are checked as before.
 */
export const checkCut = ({scenes, retention, isShort, sources, timings, label, toons6 = false}) => {
  const res = [];
  const add = (point, pass, detail) => res.push({point, pass, detail});
  const dur = durations(scenes, timings);
  const total = dur.reduce((a, b) => a + b, 0);
  const starts = dur.map((_, i) => dur.slice(0, i).reduce((a, b) => a + b, 0));
  const idx = (id) => scenes.findIndex((s) => s.id === id);
  const firstIds = (field) => String(field?.scene || '').split(',').map((x) => x.trim()).filter(Boolean);
  const pct = (sec) => `${Math.round((sec / total) * 100)}%`;

  if (!retention) {
    add('plan', false, `${label}: no retention plan (the seven-point table must be filled first)`);
    return {ok: false, total, results: res};
  }

  // 1 No intro
  const first = (scenes[0]?.text || '').toLowerCase();
  const intro = INTRO_WORDS.filter((w) => first.includes(w));
  const hookMatches = retention.noIntro?.line && first.includes(retention.noIntro.line.toLowerCase().slice(0, 25));
  add('1 No intro', !intro.length && !!hookMatches,
    intro.length ? `first line has intro word(s): ${intro.join(', ')}` : hookMatches ? `hook: "${scenes[0].text.slice(0, 70)}"` : 'first spoken line is not the planned hook');

  // 2 Promise
  const limit = isShort ? 8 : 15;
  const pi = idx(firstIds(retention.promise)[0]);
  const pOk = pi >= 0 && starts[pi] <= limit && scenes[pi].text.toLowerCase().includes((retention.promise?.line || '').toLowerCase().slice(0, 20));
  const qi = toons6 ? idx(firstIds(retention.question)[0]) : -1;
  const qOk = qi >= 0 && starts[qi] <= limit && scenes[qi].text.includes('?');
  if (toons6 && !pOk && qOk) add('2 Promise', true, `met by the story question at ${starts[qi].toFixed(1)} s (limit ${limit} s): "${scenes[qi].text.slice(0, 60)}"`);
  else add('2 Promise', pOk, pi < 0 ? (toons6 ? 'neither a promise line nor a story question (retention.question) by 8 s' : 'promise scene not found') : `starts at ${starts[pi].toFixed(1)} s (limit ${limit} s)`);

  // 3 Counting
  const all = scenes.map((s) => s.text.toLowerCase()).join(' \n ');
  let pos = 0; let counted = 0;
  for (const forms of ORDINALS) {
    const hits = forms.map((f) => all.indexOf(f, pos)).filter((x) => x >= 0);
    if (!hits.length) break;
    pos = Math.min(...hits) + 1; counted++;
  }
  add('3 Counting', counted >= 3, `${counted} numbered beats said in order`);

  // 4 Change every 3 s (Short) / 5 s (long)
  const maxHold = isShort ? 3 : 5;
  const slow = scenes.map((s, i) => ({id: s.id, hold: dur[i] / panelsOf(s)})).filter((x) => x.hold > maxHold + 0.05);
  add('4 3-sec change', !slow.length, slow.length
    ? `${slow.length} scene(s) hold a picture too long: ${slow.slice(0, 6).map((x) => `${x.id} ${x.hold.toFixed(1)}s`).join(', ')}${slow.length > 6 ? ' …' : ''}`
    : `every picture changes within ${maxHold} s`);

  // 5 Twist at 50-75 %
  const ti = idx(firstIds(retention.twist)[0]);
  const tAt = ti >= 0 ? starts[ti] / total : -1;
  add('5 Twist', tAt >= 0.5 && tAt <= 0.75, ti < 0 ? 'twist scene not found' : `twist starts at ${pct(starts[ti])}`);

  // 6 Best last: final quarter, after the twist
  const bi = idx(firstIds(retention.bestLast)[0]);
  const bAt = bi >= 0 ? starts[bi] / total : -1;
  add('6 Best last', bi > ti && bAt >= 0.75, bi < 0 ? 'best-last scene not found' : `best point starts at ${pct(starts[bi])}`);

  // 7 Loop: last line shares 3+ key words with the first line
  const lastText = scenes[scenes.length - 1]?.text || '';
  const shared = [...new Set(keyWords(lastText))].filter((w) => keyWords(scenes[0]?.text || '').includes(w));
  const endKind = toons6 ? (retention.loop?.kind ?? (/\?\s*$/.test(lastText) ? 'question' : null)) : null;
  if (toons6 && shared.length < 3 && ['question', 'midline'].includes(endKind)) add('7 Loop', true, `ends on ${endKind === 'question' ? 'a question' : 'a cut mid-line'} (Toons, format 6): the replay starts at once`);
  else add('7 Loop', shared.length >= 3, `last line shares ${shared.length} key word(s) with the first: ${shared.join(', ')}`);

  // MedPeak: a source on every number, sources exist, no banned claims
  const srcIds = new Set((sources || []).map((s) => s.id));
  const unsourced = scenes.filter((s) => NUMBER_RE.test(s.text) && !(s.sources || []).length).map((s) => s.id);
  add('Sources on numbers', !unsourced.length, unsourced.length ? `numbers without a source in: ${unsourced.join(', ')}` : 'every number has a source');
  const missing = scenes.flatMap((s) => (s.sources || []).filter((id) => !srcIds.has(id)).map((id) => `${s.id}->${id}`));
  add('Source ids exist', !missing.length, missing.length ? `unknown source ids: ${missing.join(', ')}` : 'all source ids known');
  const claims = scenes.filter((s) => BANNED_CLAIMS.some((re) => re.test(s.text))).map((s) => s.id);
  add('No banned claims', !claims.length, claims.length ? `cure/miracle/detox wording in: ${claims.join(', ')}` : 'no cure/miracle/detox claims');

  return {ok: res.every((r) => r.pass), total, results: res};
};
