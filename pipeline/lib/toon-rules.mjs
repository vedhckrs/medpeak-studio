// The rules a Toon script (videos/<slug>/toon.json) must pass before a single credit is spent:
//   1. the script is valid (cast, sets, poses, camera words, sounds);
//   2. the owner's Retention 7, adapted to dialogue;
//   3. the Toons format (length, pace, the doctor's part);
//   4. medical accuracy (a source behind every number and every medical statement).
// It uses the same director as the player (src/toons/director.ts), so the picture changes it
// measures are the ones that get rendered.
import {checkCut} from './retention.mjs';
import {AUTO_SFX, checkRoom, EMOTION_NAMES, ENTRANCES, layoutToon, longestStill, parseCam, PROP_NAMES, roomsClash, roomSignature, SET_NAMES, STAGE_KEYS, TOON_FPS} from '../../src/toons/director.ts';
import {POSES} from '../../src/toons/poses.ts';

/** Where a medical fact may come from (medical-accuracy.md): research databases, WHO, national health bodies. */
export const ALLOWED_SOURCES = [/(^|\.)ncbi\.nlm\.nih\.gov$/, /(^|\.)nih\.gov$/, /(^|\.)medlineplus\.gov$/, /(^|\.)who\.int$/, /(^|\.)cdc\.gov$/, /(^|\.)nhs\.uk$/, /(^|\.)nice\.org\.uk$/, /(^|\.)icmr\.gov\.in$/, /(^|\.)cochranelibrary\.com$/, /\.gov$/, /\.gov\.[a-z]{2}$/];
const DOSING = [/\b\d+(\.\d+)?\s?(mg|mcg|ml|iu)\b/i, /\bstop taking\b/i, /\bdouble (the|your) dose\b/i];
const PEOPLE = ['doctor', 'patient', 'mom', 'kid', 'grandpa', 'baby'];
const wordsOf = (t) => t.split(/\s+/).filter(Boolean);
const bare = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Is `word` one of the words of `text`? (the player starts things on that exact word) */
const saysWord = (text, word) => wordsOf(text ?? '').some((w) => bare(w) === bare(word));

/**
 * Check one Toon. `known` = {cast: names with a voice, sfx: effect names, beds: music names,
 * others: the other videos' [{slug, episode, rooms}] (so every video gets rooms of its own)}.
 * Returns {ok, total (seconds), results: [{group, point, pass, detail, warn?}], layout}.
 */
export const checkToon = (toon, timings, known) => {
  const res = [];
  const add = (group, point, pass, detail, warn = false) => res.push({group, point, pass: !!pass, detail, warn});
  const shots = toon.shots ?? [];
  const lines = shots.flatMap((s) => (s.lines ?? []).map((l) => ({...l, shot: s})));
  const places = shots.filter((s) => s.card === undefined);

  // ---------------------------------------------------------------- 1 the script is valid
  const bad = [];
  const ids = new Set();
  if (!toon.slug || !toon.title) bad.push('slug and title are required');
  if (toon.music && !known.beds.includes(toon.music)) bad.push(`unknown music bed "${toon.music}"`);
  if (toon.camera && !['steady', 'cinematic'].includes(toon.camera)) bad.push(`camera must be "steady" or "cinematic", not "${toon.camera}"`);
  for (const s of shots) {
    if (s.card !== undefined) { // a time card: a few words on a plain screen, no characters
      if (!String(s.card).trim() || String(s.card).length > 40) bad.push(`card ${s.id}: a time card has a few words (40 characters at most)`);
      if ((s.lines ?? []).length) bad.push(`card ${s.id}: a time card has no lines`);
      continue;
    }
    if (!SET_NAMES.includes(s.set)) bad.push(`shot ${s.id}: unknown set "${s.set}"`);
    if (!s.cast?.length || s.cast.length > 3) bad.push(`shot ${s.id}: a shot has 1 to 3 characters`);
    const dials = STAGE_KEYS[s.set] ?? [];
    for (const k of Object.keys(s.state ?? {})) if (!dials.includes(k)) bad.push(`shot ${s.id}: the ${s.set} set has no dial "${k}" (it has: ${dials.join(', ') || 'none'})`);
    for (const e of s.events ?? []) {
      const l = e.at === 'start' ? null : s.lines.find((x) => x.id === e.at);
      if (e.at !== 'start' && !l) bad.push(`shot ${s.id}: event at "${e.at}" is not a line of this shot`);
      if (e.word && !l) bad.push(`shot ${s.id}: an event on the word "${e.word}" needs a line, not "start"`);
      if (l && e.word && !saysWord(l.text, e.word)) bad.push(`shot ${s.id}: event word "${e.word}" is not a word of line ${e.at}`);
      for (const k of Object.keys(e.set ?? {})) if (!dials.includes(k)) bad.push(`shot ${s.id}: an event sets "${k}", which the ${s.set} set does not have`);
      if (e.sfx && !known.sfx.includes(e.sfx)) bad.push(`shot ${s.id}: event sound "${e.sfx}" is not in the library`);
      if (e.fx && e.fx !== 'flash') bad.push(`shot ${s.id}: unknown event effect "${e.fx}"`);
      if (!e.set && !e.fx && !e.sfx) bad.push(`shot ${s.id}: the event at ${e.at} does nothing`);
    }
    for (const a of s.cast ?? []) {
      if (!known.cast.includes(a.who)) bad.push(`shot ${s.id}: "${a.who}" is not in the cast (toons-cast.json)`);
      if (a.stage && !dials.length) bad.push(`shot ${s.id}: ${a.who} is marked "stage" but ${s.set} is not a stage`);
      if (!a.stage && (a.x < 100 || a.x > 980)) bad.push(`shot ${s.id}: ${a.who} stands outside the frame (x ${a.x})`);
      if (a.emotion && !EMOTION_NAMES.includes(a.emotion)) bad.push(`shot ${s.id}: ${a.who} emotion "${a.emotion}"`);
      if (a.pose && !(a.pose in POSES)) bad.push(`shot ${s.id}: ${a.who} pose "${a.pose}"`);
      if (a.enter && !ENTRANCES.includes(a.enter)) bad.push(`shot ${s.id}: ${a.who} entrance "${a.enter}"`);
    }
    for (const p of s.props ?? []) {
      if (!PROP_NAMES.includes(p.kind)) bad.push(`shot ${s.id}: unknown prop "${p.kind}"`);
      for (const k of ['from', 'to']) if (p[k] && !s.lines.some((l) => l.id === p[k])) bad.push(`shot ${s.id}: prop ${p.kind} ${k} "${p[k]}" is not a line of this shot`);
      if (p.word && !saysWord(s.lines.find((l) => l.id === p.from)?.text, p.word)) bad.push(`shot ${s.id}: prop ${p.kind} word "${p.word}" is not a word of line ${p.from ?? '(no "from")'}`);
      if ((p.kind === 'tag' || p.kind === 'chip') && !p.text) bad.push(`shot ${s.id}: a ${p.kind} needs "text"`);
    }
    for (const l of s.lines) {
      const here = (s.cast ?? []).map((a) => a.who);
      if (ids.has(l.id)) bad.push(`line id ${l.id} is used twice`);
      ids.add(l.id);
      if (!here.includes(l.who)) bad.push(`${l.id}: ${l.who} is not in the shot`);
      if (!l.text?.trim()) bad.push(`${l.id}: empty line`);
      if (l.emotion && !EMOTION_NAMES.includes(l.emotion)) bad.push(`${l.id}: emotion "${l.emotion}"`);
      if (l.pose && !(l.pose in POSES)) bad.push(`${l.id}: pose "${l.pose}"`);
      if (l.sfx && !known.sfx.includes(l.sfx)) bad.push(`${l.id}: unknown sound "${l.sfx}"`);
      if (l.key && !l.text.toLowerCase().includes(l.key.toLowerCase())) bad.push(`${l.id}: key word "${l.key}" is not in the line`);
      const cam = parseCam(l.cam);
      if (cam.unknown.length) bad.push(`${l.id}: camera word(s) not understood: ${cam.unknown.join(', ')}`);
      for (const w of Object.keys(l.react ?? {})) {
        if (!here.includes(w)) bad.push(`${l.id}: react "${w}" is not in the shot`);
        else if (!EMOTION_NAMES.includes(l.react[w])) bad.push(`${l.id}: react emotion "${l.react[w]}"`);
      }
    }
  }
  if (!lines.length) bad.push('no lines');
  const built = ['clinic', 'home'].filter((r) => shots.some((x) => x.set === r));
  for (const role of built) bad.push(...checkRoom(role, toon.rooms?.[role]));
  if (built.length && !(Number.isInteger(toon.episode) && toon.episode > 0)) bad.push('"episode" (the number of this video in the series) is needed to compare its rooms with the others');
  add('script', 'Script is valid', !bad.length, bad.length ? bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` … (+${bad.length - 8})` : '') : `${places.length} scenes, ${lines.length} lines, ${new Set(lines.map((l) => l.who)).size} voices`);
  if (bad.length) return {ok: false, total: 0, results: res, layout: null};

  const L = layoutToon(toon, timings);
  const total = L.total / TOON_FPS;
  const segsOf = (id) => L.segs.filter((s) => s.line.line.id === id);
  const longest = L.segs.reduce((m, s) => (s.to - s.from > m.to - m.from ? s : m), L.segs[0]);
  const hold = (longest.to - longest.from) / TOON_FPS;
  if (toon.test) {
    add('script', 'Test scene', true, 'marked "test": only the script check applies (never published)', true);
    return {ok: true, total, results: res, layout: L};
  }

  // ---------------------------------------------------------------- 2 Retention 7 (dialogue)
  const scenes = L.lines.map((p) => ({id: p.line.id, text: p.line.text, sources: p.line.src ?? [], visual: {panels: segsOf(p.line.id)}}));
  const t7 = {scenes: Object.fromEntries(L.lines.map((p) => [p.line.id, {duration: p.frames / TOON_FPS}]))};
  const cut = checkCut({scenes, retention: toon.retention, isShort: true, sources: toon.sources ?? [], timings: t7, label: toon.slug});
  for (const r of cut.results) {
    const group = /^\d|plan/.test(r.point) ? 'retention' : 'accuracy';
    if (r.point === '4 3-sec change') {
      if (L.steady) { // steady camera: the change is what HAPPENS in the picture, not a cut
        const st = longestStill(L);
        add('retention', r.point, st.seconds <= 3.0, `something new appears ${st.changes} times in ${total.toFixed(0)} s (a place, a cut, a prop, a change of the stage); the longest wait is ${st.seconds.toFixed(1)} s (from ${st.from.toFixed(1)} s)`);
      } else add('retention', r.point, hold <= 3.0, `the longest picture is ${hold.toFixed(1)} s (line ${longest.line.line.id}); ${L.segs.length} pictures in ${total.toFixed(0)} s`);
    }
    else add(group, r.point, r.pass, r.detail);
  }

  // ---------------------------------------------------------------- 3 the Toons format
  add('format', 'Length', total >= 25 && total < 60, `${total.toFixed(1)} s (a Short must stay under 60 s; aim for 40-58)`);
  const sets = new Set(places.map((s) => s.set));
  add('format', 'Places', sets.size >= 2, `${sets.size} set(s): ${[...sets].join(', ')} (at least a body scene and the doctor's office)`);
  if (toon.camera === 'steady') {
    // every video has a clinic and a home of its OWN (owner, 2026-11-16): the shared rooms are not allowed
    const shared = [...sets].filter((x) => ['office', 'bedroom', 'bathroom'].includes(x));
    const own = sets.has('clinic') && sets.has('home');
    add('format', 'Own rooms', own && !shared.length, shared.length ? `uses the shared room(s) ${shared.join(', ')}: give this video its own ("set": "clinic" / "home" and a recipe in "rooms")` : own ? `clinic: ${roomSignature('clinic', toon.rooms.clinic)}; home: ${roomSignature('home', toon.rooms.home)}` : 'a steady script has a scene in its clinic and a scene in its home');
    if (own) {
      const clashes = [];
      for (const o of known.others ?? []) {
        if (o.slug === toon.slug) continue;
        if (o.episode === toon.episode) clashes.push(`episode ${toon.episode} is also ${o.slug}`);
        const near = Math.abs((o.episode ?? 1e9) - toon.episode) <= 6;
        for (const role of ['clinic', 'home']) {
          if (!o.rooms?.[role]) continue;
          const c = roomsClash(role, toon.rooms[role], o.rooms[role], near);
          if (c) clashes.push(`${role}: ${c} as ${o.slug}`);
        }
      }
      add('format', 'Rooms are unique', !clashes.length, clashes.length ? clashes.join('; ') : `no other video has this clinic or this home (compared with ${(known.others ?? []).filter((o) => o.slug !== toon.slug).length} other video(s))`);
    }
  }
  const voices = new Set(lines.map((l) => l.who));
  add('format', 'Voices', voices.size >= 3, `${voices.size} speaking characters (3 or more keep it a conversation)`);
  const docFrames = L.lines.filter((p) => p.line.who === 'doctor').reduce((n, p) => n + p.frames, 0);
  const docShare = docFrames / L.total;
  add('format', 'Doctor explains', docShare >= 0.15 && docShare <= 0.5, `Dr. Mira speaks for ${Math.round(docShare * 100)}% of the video (15-50%)`);
  const bodyTalk = L.lines.filter((p) => !PEOPLE.includes(p.line.who)).reduce((n, p) => n + p.frames, 0) / L.total;
  add('format', 'Body scene', bodyTalk >= 0.3, `body characters speak for ${Math.round(bodyTalk * 100)}% of the video (30% or more: they are the show)`);
  const long = lines.filter((l) => wordsOf(l.text).length > 20).map((l) => `${l.id} (${wordsOf(l.text).length})`);
  add('format', 'Short lines', !long.length, long.length ? `over 20 words: ${long.join(', ')}` : `the longest line is ${Math.max(...lines.map((l) => wordsOf(l.text).length))} words`);
  let run = 1;
  let maxRun = 1;
  lines.forEach((l, i) => { run = i && lines[i - 1].who === l.who && lines[i - 1].shot === l.shot ? run + 1 : 1; maxRun = Math.max(maxRun, run); });
  add('format', 'Banter', maxRun <= 3, `at most ${maxRun} lines in a row by one speaker (3 or fewer)`);

  // ---------------------------------------------------------------- 4 medical accuracy
  const sources = toon.sources ?? [];
  const sIds = new Set(sources.map((s) => s.id));
  const weak = sources.filter((s) => !s.id || !s.label || !/^https:\/\//.test(s.url ?? '') || (s.note ?? '').length < 40).map((s) => s.id || '(no id)');
  add('accuracy', 'Sources are complete', sources.length > 0 && !weak.length, !sources.length ? 'no sources listed' : weak.length ? `id, label, https link and a note with the exact finding are required: ${weak.join(', ')}` : `${sources.length} source(s), each with its finding written out`);
  const off = sources.filter((s) => { try { const h = new URL(s.url).hostname.replace(/^www\./, ''); return !ALLOWED_SOURCES.some((re) => re.test(h)); } catch { return true; } }).map((s) => s.id);
  add('accuracy', 'Sources are allowed', !off.length, off.length ? `not a research database, WHO or a national health body: ${off.join(', ')}` : 'research databases, WHO and national health bodies only');
  const docBare = lines.filter((l) => l.who === 'doctor' && !l.chat && !(l.src ?? []).length).map((l) => l.id);
  add('accuracy', 'Doctor lines are sourced', !docBare.length, docBare.length ? `Dr. Mira states something without a source in: ${docBare.join(', ')} (add "src", or "chat": true if it states no fact)` : 'every statement by Dr. Mira names its source');
  const unknown = lines.flatMap((l) => (l.src ?? []).filter((id) => !sIds.has(id)).map((id) => `${l.id}->${id}`));
  if (unknown.length) add('accuracy', 'Source ids exist', false, `unknown source ids: ${unknown.join(', ')}`);
  const dosing = lines.filter((l) => DOSING.some((re) => re.test(l.text))).map((l) => l.id);
  add('accuracy', 'No dosing advice', !dosing.length, dosing.length ? `doses or "stop taking" in: ${dosing.join(', ')}` : 'no doses, no "stop taking your medicine"');
  const unused = sources.filter((s) => !lines.some((l) => (l.src ?? []).includes(s.id))).map((s) => s.id);
  if (unused.length) add('accuracy', 'Unused sources', true, `listed but not used by any line: ${unused.join(', ')}`, true);

  return {ok: res.every((r) => r.pass), total, results: res, layout: L};
};

/** The script as a page the owner can read: the seven-point table first, then every line with its picture. */
export const scriptSheet = (toon, check) => {
  const L = check.layout;
  const out = [`# ${toon.title}`, '', `Toon script \`${toon.slug}\` · about ${check.total.toFixed(0)} seconds · ${L.segs.length} pictures`, ''];
  if (toon.retention) {
    out.push('## Retention 7', '', '| Point | Line | Words |', '|---|---|---|');
    const names = {noIntro: '1 No intro', promise: '2 Promise', counting: '3 Counting', change3s: '4 3-sec change', twist: '5 Twist', bestLast: '6 Best last', loop: '7 Loop'};
    for (const [k, label] of Object.entries(names)) out.push(`| ${label} | ${toon.retention[k]?.scene ?? ''} | ${toon.retention[k]?.line ?? ''} |`);
    out.push('');
  }
  out.push('## Check', '', '| | Rule | Result |', '|---|---|---|');
  for (const r of check.results) out.push(`| ${r.pass ? (r.warn ? 'note' : 'PASS') : 'FAIL'} | ${r.point} | ${r.detail} |`);
  out.push('');
  for (const s of toon.shots) {
    if (s.card !== undefined) { out.push(`## Time card: "${s.card}"`, ''); continue; }
    out.push(`## Scene ${s.id}: ${s.set}`, '', `Characters: ${s.cast.map((a) => a.who).join(', ')}${s.props?.length ? ` · props: ${s.props.map((p) => p.kind).join(', ')}` : ''}`, '', '| Time | Line | Who | Feeling | Words | Camera | Source |', '|---|---|---|---|---|---|---|');
    for (const p of L.lines.filter((x) => toon.shots[x.si] === s)) {
      const cams = L.segs.filter((g) => g.line === p).map((g) => `${g.whip ? 'whip to ' : ''}${g.who === p.line.who ? '' : `${g.who}: `}${g.shot} ${g.lens}${g.move === 'static' ? '' : ` ${g.move}`}`).join(' → ');
      out.push(`| ${(p.from / TOON_FPS).toFixed(1)} s | ${p.line.id} | ${p.line.who} | ${p.line.emotion ?? 'neutral'} | ${p.line.text} | ${cams || 'the scene, locked'} | ${(p.line.src ?? []).join(', ')} |`);
    }
    out.push('');
    const shown = [
      ...(s.events ?? []).map((e) => `at ${e.at}${e.word ? ` ("${e.word}")` : ''}: ${e.set ? Object.entries(e.set).map(([k, v]) => `${k} to ${v}`).join(', ') : e.fx ?? 'sound'}${e.sfx ? ` [${e.sfx}]` : ''}`),
      ...(s.props ?? []).map((p) => `at ${p.from ?? 'start'}${p.word ? ` ("${p.word}")` : ''}: ${p.kind}${p.text ? ` "${p.text}"` : ''}${p.bubble ? ' in a thought bubble' : ''}${p.no ? ' with a "not this" sign' : ''}`),
    ];
    if (shown.length) out.push('What happens in the picture:', '', ...shown.map((x) => `- ${x}`), '');
  }
  if (toon.sources?.length) {
    out.push('## Sources', '');
    for (const s of toon.sources) out.push(`- **${s.id}** ${s.label}. ${s.note} <${s.url}>`);
    out.push('');
  }
  return out.join('\n');
};
export {AUTO_SFX};
