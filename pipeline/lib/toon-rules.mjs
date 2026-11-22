// The rules a Toon script (videos/<slug>/toon.json) must pass before a single credit is spent:
//   1. the script is valid (cast, sets, poses, camera words, sounds);
//   2. the owner's Retention 7, adapted to dialogue;
//   3. the Toons format (length, pace, the doctor's part; format 4: the macros);
//   4. medical accuracy (a source behind every number and every medical statement).
// It uses the same director as the player (src/toons/director.ts), so the picture changes it
// measures are the ones that get rendered.
import {checkCut} from './retention.mjs';
import {AUTO_SFX, checkRoom, EMOTION_NAMES, ENTRANCES, frameOf, kindOf, layoutToon, longestStill, parseCam, PROP_NAMES, roomsClash, roomSignature, SET_NAMES, STAGE_KEYS, TOON_FPS} from '../../src/toons/director.ts';
import {POSES} from '../../src/toons/poses.ts';

/** Where a medical fact may come from (medical-accuracy.md): research databases, WHO, national health bodies. */
export const ALLOWED_SOURCES = [/(^|\.)ncbi\.nlm\.nih\.gov$/, /(^|\.)nih\.gov$/, /(^|\.)medlineplus\.gov$/, /(^|\.)who\.int$/, /(^|\.)cdc\.gov$/, /(^|\.)nhs\.uk$/, /(^|\.)nice\.org\.uk$/, /(^|\.)icmr\.gov\.in$/, /(^|\.)cochranelibrary\.com$/, /\.gov$/, /\.gov\.[a-z]{2}$/];
const DOSING = [/\b\d+(\.\d+)?\s?(mg|mcg|ml|iu)\b/i, /\bstop taking\b/i, /\bdouble (the|your) dose\b/i];
const PEOPLE = ['doctor', 'patient', 'mom', 'kid', 'grandpa', 'baby'];
const wordsOf = (t) => t.split(/\s+/).filter(Boolean);
const bare = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Is `word` one of the words of `text`? (the player starts things on that exact word) */
const saysWord = (text, word) => wordsOf(text ?? '').some((w) => bare(w) === bare(word));
const SMALL = new Set('a an the of to in on and or is are be am was it its this that for with does do did what how why can could from at by as so not no too my me i he she his her we they'.split(' '));
/** The words of a line that carry its meaning (small words out), for "does this line pick up that one?" */
const keysOf = (t) => [...new Set(wordsOf(t ?? '').map(bare).filter((w) => w.length > 2 && !SMALL.has(w) && !/^(you|your|you'll|you're|yours)$/.test(w)))];
/** What a format-2 hook must be (owner, 2026-11-17: "make better hook"): short, said to the viewer, about the title. */
/** The story shapes (format 3). A day's videos use different ones. */
export const SHAPES = ['fight', 'journey', 'clock', 'crew', 'visit'];
/** How many text stickers a format-3 video may have. */
export const STICKERS = 5;
/** The longest cold open before the hook (seconds). */
export const COLD_SECONDS = 4;
export const HOOK = {words: 8, seconds: 2.5, titleWords: 2, by: 3, questionBy: 7, answerFrom: 0.75};
/** Format 5, "engage": how fast the hook must hit and how long the picture may sit still. */
/** Where a text on the picture may stand (x of its centre): left, middle, right. */
export const TAG_GRID = [300, 540, 780];
/** ...and how high or low (y of its centre): clear of the top edge and of the caption box. */
export const TAG_Y = [240, 1300];
export const ENGAGE = {hookSeconds: 2, firstMotion: 0.5, openSeconds: 3, openStill: 1, still: 2};
/** A text on the picture may write a spoken number in digits ("15 minutes" for "fifteen minutes"). */
const NUMBER_WORDS = {1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety', 100: 'hundred'};
/** Stage dials that mean "this keeps moving while it is above zero" (a ride, a flow). */
const FLOW_DIALS = {macro: ['speed', 'wash']}; // creatine (2026-11-21): the blood stream and the kidney filter move only on story beats, and their events say when
/**
 * Every stretch of frames in which the picture changes: a cut, a camera move, a stage event while it
 * plays, a thing arriving, a stage that flows. People's talking mouths and arm beats do not count.
 */
export const motionSpans = (L) => {
  const spans = [];
  L.shots.forEach((sh, si) => {
    const s = sh.shot;
    spans.push([sh.from, sh.from + 1]);
    for (const e of s.events ?? []) {
      if (!e.set && !e.fx && !e.act) continue; // a character's visible action counts too (acting kit, 2026-11-21)
      const f = frameOf(L, si, e.at, e.word, e.delay);
      spans.push([f, f + Math.max(2, e.over ?? 18)]);
    }
    for (const p of s.props ?? []) { const f = frameOf(L, si, p.from, p.word); spans.push([f, f + 9]); }
    // a flowing dial keeps the stage moving from the moment it is above zero to the end of the shot
    for (const k of FLOW_DIALS[s.set] ?? []) {
      if ((s.state?.[k] ?? 0) > 0) spans.push([sh.from, sh.from + sh.frames]);
      else for (const e of s.events ?? []) if ((e.set?.[k] ?? 0) > 0) spans.push([frameOf(L, si, e.at, e.word, e.delay), sh.from + sh.frames]);
    }
  });
  for (const g of L.segs) { spans.push([g.from, g.from + 1]); if (!['lock', 'static'].includes(g.move)) spans.push([g.from, g.to]); }
  return spans.sort((a, b) => a[0] - b[0]);
};
/** The longest stretch between `from` and `to` (frames) that no span covers. */
export const longestGap = (spans, from, to) => {
  let at = from;
  let best = {seconds: 0, from: from / TOON_FPS};
  const close = (end) => { if (end - at > best.seconds * TOON_FPS) best = {seconds: (end - at) / TOON_FPS, from: at / TOON_FPS}; };
  for (const [a, b] of spans) {
    if (b <= from || a >= to) continue;
    if (a > at) close(Math.min(a, to));
    at = Math.max(at, Math.min(b, to));
  }
  close(to);
  return best;
};
export const hookFaults = (text, title) => {
  const out = [];
  const n = wordsOf(text).length;
  if (n > HOOK.words) out.push(`${n} words (at most ${HOOK.words})`);
  if (!wordsOf(text).some((w) => /^(you|your|you'll|you're|yours)$/.test(bare(w)))) out.push('does not say "you" or "your"');
  const shared = keysOf(title).filter((w) => wordsOf(text).map(bare).includes(w));
  if (shared.length < HOOK.titleWords) out.push(`says ${shared.length} of the title's words (at least ${HOOK.titleWords}: ${keysOf(title).join(', ')})`);
  return out;
};

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
  if (toon.music && toon.music !== toon.slug && !known.beds.includes(toon.music)) bad.push(`unknown music bed "${toon.music}"`);
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
      if (!e.set && !e.fx && !e.sfx && !e.act) bad.push(`shot ${s.id}: the event at ${e.at} does nothing`);
      if (e.act !== undefined && !/^[a-z]+: \S/.test(String(e.act))) bad.push(`shot ${s.id}: an "act" names who acts and what ("mom: jumps"), got "${e.act}"`);
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
  // a cold open (the first line marked "cold", at most COLD_SECONDS): the hook rules judge the line after it
  const coldLine = L.lines[0]?.line.cold ? L.lines[0] : null;
  if (L.lines.some((p, i) => p.line.cold && i > 0)) add('retention', 'Cold open', false, 'only the FIRST line may be a cold open');
  if (coldLine) add('retention', 'Cold open', coldLine.frames / TOON_FPS - 0.14 <= COLD_SECONDS, `"${coldLine.line.text}" opens cold in ${(coldLine.frames / TOON_FPS - 0.14).toFixed(1)} s (at most ${COLD_SECONDS}); the hook is the next line`);
  const HL = coldLine ? L.lines.slice(1) : L.lines; // the lines from the hook on
  const scenes = HL.map((p) => ({id: p.line.id, text: p.line.text, sources: p.line.src ?? [], visual: {panels: segsOf(p.line.id)}}));
  const t7 = {scenes: Object.fromEntries(L.lines.map((p) => [p.line.id, {duration: p.frames / TOON_FPS}]))};
  const f6 = toon.format >= 6; // engine v9: one story (checkFormat6 below); the older formats are checked exactly as before
  const cut = checkCut({scenes, retention: toon.retention, isShort: true, sources: toon.sources ?? [], timings: t7, label: toon.slug, toons6: f6});
  const v3 = toon.format >= 3; // story shapes (the fight, the journey, the clock, the crew at work, the visit): things happen, stickers stop
  const v2 = toon.format >= 2; // the second script shape: a cold open, a hook to the viewer, an open question instead of the counting
  for (const r of cut.results) {
    const group = /^\d|plan/.test(r.point) ? 'retention' : 'accuracy';
    if (v2 && r.point === '3 Counting') continue; // replaced by the open question, below
    if (r.point === '4 3-sec change') {
      if (f6) continue; // format 6: "one action, then a hold" (checkFormat6) and the render's picture checks replace it
      if (L.steady) { // steady camera: the change is what HAPPENS in the picture, not a cut
        const st = longestStill(L, {stickers: !v3});
        add('retention', r.point, st.seconds <= 3.0, `something new ${v3 ? 'HAPPENS' : 'appears'} ${st.changes} times in ${total.toFixed(0)} s (a place, a cut, ${v3 ? 'a thing arriving, a change of the stage; text stickers do not count' : 'a prop, a change of the stage'}); the longest wait is ${st.seconds.toFixed(1)} s (from ${st.from.toFixed(1)} s)`);
      } else add('retention', r.point, hold <= 3.0, `the longest picture is ${hold.toFixed(1)} s (line ${longest.line.line.id}); ${L.segs.length} pictures in ${total.toFixed(0)} s`);
    }
    else add(group, r.point, r.pass, r.detail);
  }

  if (v2) {
    // ---- the hook (owner, 2026-11-17: "remove 3 point, make better hook")
    const first = HL[0];
    const said = first.frames / TOON_FPS - 0.14; // the line itself, without the air after it
    if (!f6) { // format 6: the hook is IN the story (S1 in checkFormat6) and opens on the person, not on the damage
      const faults = hookFaults(first.line.text, toon.title);
      if (said > HOOK.seconds + 0.05) faults.push(`takes ${said.toFixed(1)} s to say (at most ${HOOK.seconds})`);
      add('retention', '1 Hook: short, to the viewer, about the title', !faults.length, faults.length ? `"${first.line.text}": ${faults.join('; ')}` : `"${first.line.text}" (${wordsOf(first.line.text).length} words, ${said.toFixed(1)} s, says "you", says the title's words)`);
      const opening = shots[0];
      const shown = Object.entries(opening?.state ?? {}).filter(([, v]) => v >= 0.5).map(([k]) => k);
      add('retention', '1 Hook: the first frame shows the consequence', !!STAGE_KEYS[opening?.set] && shown.length > 0, shown.length ? `the video opens on the ${opening.set} with ${shown.join(', ')} already there` : 'the first scene must be a body stage that starts with the damage (a "state" with a dial at 0.5 or more), then goes back to how it began');
    }
    const others = (toon.hooks ?? []).map((h) => (typeof h === 'string' ? h : h.line));
    // format 6: a hook choice is "story" (a character's reaction, 8 words at most) unless it is marked "kind": "viewer"
    const faultsOf = (h, i) => (f6 && (toon.hooks[i]?.kind ?? 'story') !== 'viewer' ? (wordsOf(h).length > F6.hookWords ? [`${wordsOf(h).length} words (at most ${F6.hookWords})`] : []) : hookFaults(h, toon.title));
    const badOthers = others.map((h, i) => [h, faultsOf(h, i)]).filter(([, f]) => f.length);
    add('retention', '1 Hook: three choices for the owner', others.length >= 3 && others.includes(first.line.text) && !badOthers.length, others.length < 3 ? `${others.length} hook choice(s) in "hooks" (3 needed, the script's own first line among them)` : !others.includes(first.line.text) ? 'the script\'s first line is not one of the "hooks"' : badOthers.length ? badOthers.map(([h, f]) => `"${h}": ${f.join('; ')}`).join(' | ') : `${others.length} choices, each short, to the viewer and about the title`);
    // ---- the open question: asked early, answered late (it replaces the counting)
    const at = (id) => L.lines.find((p) => p.line.id === id);
    const q = at(String(toon.retention?.question?.scene ?? ''));
    const a = at(String(toon.retention?.answer?.scene ?? ''));
    const qAt = q ? q.from / TOON_FPS : null;
    const aAt = a ? a.from / L.total : null;
    const picked = q && a ? keysOf(q.line.text).filter((w) => keysOf(a.line.text).includes(w)) : [];
    const qFaults = [];
    const qBy = f6 ? F6.questionBy : HOOK.questionBy, aFrom = f6 ? F6.answerFrom : HOOK.answerFrom; // format 6: asked by 6 s, the answer block from 55%
    if (!q) qFaults.push('"retention.question" must name the line that asks it');
    else { if (!q.line.text.includes('?')) qFaults.push(`${q.line.id} is not a question`); if (qAt > qBy) qFaults.push(`it is asked at ${qAt.toFixed(1)} s (by ${qBy} s)`); }
    if (!a) qFaults.push('"retention.answer" must name the line that answers it');
    else { if (aAt < aFrom) qFaults.push(`it is answered at ${Math.round(aAt * 100)}% (hold it back to ${f6 ? 'the answer block, 55% on' : 'the last quarter'})`); if (q && picked.length < 2) qFaults.push(`the answer shares ${picked.length} key word(s) with the question (at least 2, so it really answers it)`); }
    add('retention', '3 Open question', !qFaults.length, qFaults.length ? qFaults.join('; ') : `asked at ${qAt.toFixed(1)} s ("${q.line.text}"), answered at ${Math.round(aAt * 100)}% ("${a.line.text}"; shared words: ${picked.join(', ')})`);
    const counted = lines.filter((l) => /\b(first|firstly|second|secondly|third|thirdly|number (one|two|three))\b/i.test(l.text)).map((l) => l.id);
    add('retention', '3 No counting', counted.length < 2, counted.length < 2 ? 'the story is told as one chain of cause and effect, not as a numbered list' : `numbered beats in ${counted.join(', ')}: tell it as one story`);
  }

  // ---------------------------------------------------------------- 3 the Toons format
  // the STORY stays under 60 s; the narrator's end card may take the Short past it (the owner, 2026-11-20:
  // "never cut the narrator, going past one minute is fine"); it is reported, never failed
  const full = total + (known.ctaSeconds ?? 0);
  add('format', 'Length', total >= 25 && total < 60, `story ${total.toFixed(1)} s (under 60 s; aim for 40-58)${known.ctaSeconds ? `; with the end card ${full.toFixed(1)} s` : ''}`);
  const sets = new Set(places.map((s) => s.set));
  add('format', 'Places', sets.size >= 2, `${sets.size} set(s): ${[...sets].join(', ')} (at least a body scene and the doctor's office)`);
  if (toon.camera === 'steady') {
    // every video has a clinic and a home of its OWN (owner, 2026-11-16): the shared rooms are not allowed
    const shared = [...sets].filter((x) => ['office', 'bedroom', 'bathroom'].includes(x));
    const used = ['clinic', 'home'].filter((r) => sets.has(r));
    const own = v3 ? used.every((r) => toon.rooms?.[r]) : sets.has('clinic') && sets.has('home'); // a story shape uses only the rooms its story needs
    add('format', 'Own rooms', own && !shared.length, shared.length ? `uses the shared room(s) ${shared.join(', ')}: give this video its own ("set": "clinic" / "home" and a recipe in "rooms")` : own ? (used.map((r) => `${r}: ${roomSignature(r, toon.rooms[r])}`).join('; ') || 'no clinic and no home in this story') : 'a steady script has a scene in its clinic and a scene in its home');
    if (own) {
      const clashes = [];
      for (const o of known.others ?? []) {
        if (o.slug === toon.slug) continue;
        if (o.episode === toon.episode) clashes.push(`episode ${toon.episode} is also ${o.slug}`);
        const near = Math.abs((o.episode ?? 1e9) - toon.episode) <= 6;
        for (const role of ['clinic', 'home']) {
          if (!o.rooms?.[role] || !toon.rooms?.[role]) continue;
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
  const needDoc = !v3 || toon.shape === 'visit';
  add('format', 'Doctor explains', (needDoc ? docShare >= 0.15 : true) && docShare <= 0.5, `Dr. Mira speaks for ${Math.round(docShare * 100)}% of the video (${needDoc ? '15-50%' : 'this shape needs no doctor; never over 50%'})`);
  if (v3) {
    add('format', 'Story shape', SHAPES.includes(toon.shape), SHAPES.includes(toon.shape) ? `"${toon.shape}"` : `"shape" must be one of: ${SHAPES.join(', ')}`);
    const stickers = shots.flatMap((s) => (s.props ?? []).filter((p) => ['tag', 'chip'].includes(p.kind)));
    add('format', 'Few stickers', stickers.length <= STICKERS, `${stickers.length} text sticker(s) (at most ${STICKERS}: show it, do not label it)`);
    const twice = Object.entries(shots.flatMap((s) => (s.props ?? []).filter((p) => !['tag', 'chip', 'pain'].includes(p.kind))).reduce((m, p) => ({...m, [p.kind]: (m[p.kind] ?? 0) + 1}), {})).filter(([, n]) => n > 1).map(([k, n]) => `${k} x${n}`);
    add('format', 'No icon twice', !twice.length, twice.length ? `the same icon more than once: ${twice.join(', ')}` : 'no picture icon is used twice');
  }
  if (toon.format >= 4 && !f6) { // the macro (format 6: a macro is just one possible place; decision 16), the hero visual (owner, 2026-11-18): 2-3 extreme close-ups: the hook, the middle, the end
    const at = places.map((s, i) => ({s, i, f: places.length > 1 ? i / (places.length - 1) : 0}));
    const macros = at.filter((x) => x.s.set === 'macro');
    const runs = macros.filter((x, k) => k === 0 || macros[k - 1].i !== x.i - 1); // back-to-back macro shots are one macro
    const where = (x) => (x.f < 0.2 ? 'start' : x.f > 0.7 ? 'end' : 'middle');
    const spots = new Set(runs.map(where));
    add('format', 'Macros', runs.length >= 2 && runs.length <= 3, `${runs.length} macro close-up(s) (2 to 3: they are the hero visual)`);
    add('format', 'Macro hook', places[0]?.set === 'macro', places[0]?.set === 'macro' ? 'the video opens on a macro' : `the first picture is "${places[0]?.set}": open on a macro`);
    add('format', 'Macros spread', spots.has('start') && (spots.has('middle') || spots.has('end')) && runs.length >= 2 && (runs.length < 3 || spots.size === 3), `macros at: ${runs.map(where).join(', ') || 'none'} (one at the start, then the middle and/or the end)`);
    const views = new Set(macros.map((x) => Math.round(x.s.state?.view ?? 0)));
    add('format', 'Macro views differ', runs.length < 2 || views.size >= Math.min(runs.length, 3), `${views.size} different close-up(s) over ${runs.length} macro(s) (each macro shows a new close-up)`);
    // a view is a picture: a new place, a card, or a cut to another size inside a place (L.segs)
    const starts = L.segs.map((g) => g.from);
    const holds = starts.map((f, i) => ((starts[i + 1] ?? L.total) - f) / TOON_FPS);
    const per = total / Math.max(1, starts.length);
    const longest = Math.max(...holds);
    add('format', 'View changes', per <= 6 && longest <= 7.5, `${starts.length} pictures in ${total.toFixed(0)} s: a new view every ${per.toFixed(1)} s on average (6 or less), the longest held ${longest.toFixed(1)} s (7.5 or less)`);
  }
  if (toon.format >= 5) { // "engage" (owner, 2026-11-18: weak hook, text against the voice, nothing moves)
    // ---- text on the picture says what the voice says, on the word
    const tagFaults = [];
    for (const s of shots) for (const p of s.props ?? []) {
      if (!['tag', 'chip'].includes(p.kind)) continue;
      const line = s.lines.find((l) => l.id === p.from);
      const name = `"${p.text}" (${s.id})`;
      if (!line || !p.word) { tagFaults.push(`${name}: needs "from" (a line) and "word" (the spoken word it appears on)`); continue; }
      const said = new Set(wordsOf(line.text).map(bare));
      const tokens = String(p.text).toLowerCase().split(/[\s-]+/).map(bare).filter(Boolean);
      const spoken = (t) => said.has(t) || (NUMBER_WORDS[t] && said.has(NUMBER_WORDS[t]));
      const unsaid = tokens.filter((t) => !spoken(t));
      if (unsaid.length) tagFaults.push(`${name}: ${unsaid.join(', ')} ${unsaid.length > 1 ? 'are' : 'is'} not said in line ${line.id} ("${line.text}")`);
      const first = tokens[0];
      if (first && bare(p.word) !== first && bare(p.word) !== NUMBER_WORDS[first]) tagFaults.push(`${name}: appears on "${p.word}", not on its own first word "${first}"`);
      if (p.to !== p.from) tagFaults.push(`${name}: must leave when its line ends ("to": "${p.from}")`);
      if (p.rot) tagFaults.push(`${name}: no tilt ("rot" ${p.rot})`);
      if (!TAG_GRID.includes(p.x)) tagFaults.push(`${name}: x ${p.x} is off the grid (${TAG_GRID.join(', ')})`);
      // the caption already shows every spoken word: a text on the picture is there for a NUMBER, never to say the caption twice
      if (!/\d/.test(String(p.text))) tagFaults.push(`${name}: repeats the caption (a text on the picture shows a number, in digits)`);
      // text is laid on the screen: it stays above the caption box and below the top edge
      if (!(p.y >= TAG_Y[0] && p.y <= TAG_Y[1])) tagFaults.push(`${name}: y ${p.y} is outside ${TAG_Y[0]} to ${TAG_Y[1]} (clear of the top edge and of the caption)`);
    }
    add('format', 'Text says what is spoken', !tagFaults.length, tagFaults.length ? tagFaults.join('; ') : 'every text on the picture uses words of its line, appears on its first spoken word, leaves with the line and sits straight');

    // ---- music of its own (owner: "same music"): a track made for this video, named after it, never shared
    const ownMusic = toon.music === toon.slug && String(toon.musicPrompt ?? '').length >= 40;
    add('format', 'Own music', ownMusic, ownMusic ? `its own track "${toon.music}" (made from "musicPrompt" with: node pipeline/toon-music.mjs --slug ${toon.slug})` : `"music" must be "${toon.slug}" (this video's own track) with a "musicPrompt" of 40+ characters; it is "${toon.music ?? 'none'}"`);
    // ---- the hook hits at once
    const first = HL[0];
    const said = first.frames / TOON_FPS - 0.14;
    if (!f6) add('retention', '1 Hook: said in 2 s', said <= ENGAGE.hookSeconds + 0.05, `"${first.line.text}" takes ${said.toFixed(1)} s (at most ${ENGAGE.hookSeconds})`);
    const moving = motionSpans(L);
    const firstMove = moving.filter(([a, b]) => b - a > 1)[0]?.[0] ?? Infinity; // a real movement, not the opening cut
    add('retention', '1 Hook: something big moves at once', firstMove / TOON_FPS <= ENGAGE.firstMotion, Number.isFinite(firstMove) ? `the first movement starts at ${(firstMove / TOON_FPS).toFixed(2)} s (within ${ENGAGE.firstMotion} s)` : 'nothing moves: start an event at "start" in the first scene');
    const open = longestGap(moving, 0, Math.min(L.total, ENGAGE.openSeconds * TOON_FPS));
    add('retention', '1 Hook: no still opening', open.seconds <= ENGAGE.openStill, `in the first ${ENGAGE.openSeconds} s the longest still is ${open.seconds.toFixed(1)} s (at most ${ENGAGE.openStill}), from ${open.from.toFixed(1)} s`);
    // ---- the picture never sits still for long
    const all = longestGap(moving, 0, L.total);
    if (!f6) add('format', 'Never still', all.seconds <= ENGAGE.still, `the longest stretch with no movement, cut, camera move or new thing is ${all.seconds.toFixed(1)} s (at most ${ENGAGE.still}), from ${all.from.toFixed(1)} s`);
  }
  const bodyTalk = L.lines.filter((p) => !PEOPLE.includes(p.line.who)).reduce((n, p) => n + p.frames, 0) / L.total;
  add('format', 'Body scene', bodyTalk >= 0.3, `body characters speak for ${Math.round(bodyTalk * 100)}% of the video (30% or more: they are the show)`);
  const long = lines.filter((l) => wordsOf(l.text).length > 20).map((l) => `${l.id} (${wordsOf(l.text).length})`);
  add('format', 'Short lines', !long.length, long.length ? `over 20 words: ${long.join(', ')}` : `the longest line is ${Math.max(...lines.map((l) => wordsOf(l.text).length))} words`);
  let run = 1;
  let maxRun = 1;
  let answerRun = 0;
  lines.forEach((l, i) => {
    run = i && lines[i - 1].who === l.who && lines[i - 1].shot === l.shot ? run + 1 : 1;
    if (f6 && l.answer) answerRun = Math.max(answerRun, run); else maxRun = Math.max(maxRun, run); // format 6: the answer block may run up to 6
  });
  add('format', 'Banter', maxRun <= 3 && answerRun <= F6.answerLines[1], `at most ${maxRun} lines in a row by one speaker (3 or fewer)${f6 ? `; the answer block ${answerRun} in a row (${F6.answerLines[1]} at most)` : ''}`);

  // ---------------------------------------------------------------- 4 medical accuracy
  const sources = toon.sources ?? [];
  const sIds = new Set(sources.map((s) => s.id));
  const weak = sources.filter((s) => !s.id || !s.label || !/^https:\/\//.test(s.url ?? '') || (s.note ?? '').length < 40).map((s) => s.id || '(no id)');
  add('accuracy', 'Sources are complete', sources.length > 0 && !weak.length, !sources.length ? 'no sources listed' : weak.length ? `id, label, https link and a note with the exact finding are required: ${weak.join(', ')}` : `${sources.length} source(s), each with its finding written out`);
  const off = sources.filter((s) => { try { const h = new URL(s.url).hostname.replace(/^www\./, ''); return !ALLOWED_SOURCES.some((re) => re.test(h)); } catch { return true; } }).map((s) => s.id);
  add('accuracy', 'Sources are allowed', !off.length, off.length ? `not a research database, WHO or a national health body: ${off.join(', ')}` : 'research databases, WHO and national health bodies only');
  if (v3) { // with no doctor to carry the facts, every line either names its source or is marked as plain talk
    const bare = lines.filter((l) => !l.chat && !(l.src ?? []).length).map((l) => l.id);
    add('accuracy', 'Every line is sourced or plain talk', !bare.length, bare.length ? `no "src" and not marked "chat": ${bare.join(', ')}` : 'every line names its source or is marked "chat" (it states no fact)');
  }
  const docBare = lines.filter((l) => l.who === 'doctor' && !l.chat && !(l.src ?? []).length).map((l) => l.id);
  add('accuracy', 'Doctor lines are sourced', !docBare.length, docBare.length ? `Dr. Mira states something without a source in: ${docBare.join(', ')} (add "src", or "chat": true if it states no fact)` : 'every statement by Dr. Mira names its source');
  const unknown = lines.flatMap((l) => (l.src ?? []).filter((id) => !sIds.has(id)).map((id) => `${l.id}->${id}`));
  if (unknown.length) add('accuracy', 'Source ids exist', false, `unknown source ids: ${unknown.join(', ')}`);
  const dosing = lines.filter((l) => DOSING.some((re) => re.test(l.text))).map((l) => l.id);
  add('accuracy', 'No dosing advice', !dosing.length, dosing.length ? `doses or "stop taking" in: ${dosing.join(', ')}` : 'no doses, no "stop taking your medicine"');
  const unused = sources.filter((s) => !lines.some((l) => (l.src ?? []).includes(s.id))).map((s) => s.id);
  if (unused.length) add('accuracy', 'Unused sources', true, `listed but not used by any line: ${unused.join(', ')}`, true);

  if (f6) checkFormat6(toon, L, {voiced: !!timings, known, add});

  return {ok: res.every((r) => r.pass), total, results: res, layout: L};
};

/** The script as a page the owner can read: the seven-point table first, then every line with its picture. */
export const scriptSheet = (toon, check) => {
  const L = check.layout;
  const out = [`# ${toon.title}`, '', `Toon script \`${toon.slug}\` · about ${check.total.toFixed(0)} seconds · ${L.segs.length} pictures`, ''];
  if (toon.hooks?.length) {
    out.push('## The hook: choices for the first line', '', '| | First line | Why |', '|---|---|---|');
    toon.hooks.forEach((h, i) => { const line = typeof h === 'string' ? h : h.line; out.push(`| ${'ABCDEF'[i]}${h.picked ? " (the owner's pick)" : line === (L.lines[0].line.cold ? L.lines[1] : L.lines[0]).line.text ? ' (in the script)' : ''} | ${line} | ${typeof h === 'string' ? '' : h.why ?? ''} |`); });
    out.push('');
  }
  if (toon.retention) {
    out.push('## Retention 7', '', '| Point | Line | Words |', '|---|---|---|');
    const names = toon.format >= 2
      ? {noIntro: '1 Hook', question: '2 Open question (asked)', answer: '3 Its answer (held back)', change3s: '4 3-sec change', twist: '5 Twist', bestLast: '6 Best last', loop: '7 Loop'}
      : {noIntro: '1 No intro', promise: '2 Promise', counting: '3 Counting', change3s: '4 3-sec change', twist: '5 Twist', bestLast: '6 Best last', loop: '7 Loop'};
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
// ================================================================== FORMAT 6: one story (engine v9)
// plans/engine-upgrade-2026-11-23/05-blueprint.md Part 5, script checks S1-S12 (the owner said yes to every decision,
// 2026-11-23). A script with "format": 6 gets these on top of the checks above; the scripts already out (format 5 and
// older) are checked exactly as before. Before voicing the times are estimates (WPS); after voicing they are the real word
// times, so the talk-speed check S6 only runs then.
export const F6 = {
  hookWords: 8, topicBy: 3.0, firstWord: [0.3, 1.2], questionBy: 6, answerFrom: 0.55,
  factsBefore: 3, factsWarnUpTo: 6, speakers: 4, linesEach: 3,
  answerWords: [35, 60], answerAt: [0.55, 0.8], answerLines: [3, 6],
  talking: [0.8, 0.93], pauses05: 3, pauses10: 2, beatMax: 3,
  bodyWps: [3.0, 3.6], doctorWps: [2.6, 3.0], doctorSlower: 0.3, lineWps: [2.4, 4.0],
  numbers: 1, sourceWords: 1, reactions: 2, sentence: [5, 7.5],
  bodyPlaces: [2, 4], rooms: 2, inside: 0.6, switches: 3, placeSeconds: 8,
  endCard: 6, endShare: 0.12, cards: 3, cardSeconds: [0.8, 1.2], flashes: 1, stops: 2, hold: 1.5,
  bpm: [130, 165],
};
/** The verbs (or "that's why") the answer block must use to give ONE thing to do. */
export const ACTION_WORDS = ['take', 'drink', 'cut', 'keep', 'ask', 'wait', 'see', 'stop', 'call', 'quit', 'wash', 'eat', 'sleep', 'walk', 'get', 'try', 'use', 'check'];
export const REACTION_WORDS = ['huh', 'whoa', 'hey', 'ow', 'ouch', 'ugh', 'hmm', 'oh', 'wow', 'yikes', 'eek', 'uh', 'phew', 'oops', 'aah', 'ah', 'yay', 'ew', 'gah', 'pfft'];
const SOURCE_WORDS = /\b(study|studies|trial|trials|research|researchers|who says|the who|scientists)\b/i;
const NUMBER_TOKEN = /^(\d[\d,.]*%?|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|percent|half|double|triple)$/;
/** Props that tell a state with a dial instead of drawing it on the organ (decision 9): never inside the body. */
export const GAUGE_PROPS = ['gauge', 'meter', 'clock', 'chip'];
/**
 * THE MUSIC TEMPLATE (decision 22): every video still gets a NEW track of its own, always from one family. A script's
 * `musicPrompt` starts from this; `musicPrompt6` fills it in. The family gate (`Music family` below, and earshot's scan of the
 * made track in toon-music-scan.mjs) wants "funk" and a tempo of 130-165 BPM in it.
 */
export const MUSIC_TEMPLATE = 'Playful funk instrumental, slap bass, tight light percussion, bright clavinet stabs, {bpm} BPM, no lead melody in the voice range, short rests between phrases; {colour}; from {answer} seconds a brighter, confident second half for the doctor\'s answer; no vocals, ends on a clean button.';
/** The template filled in: the topic's own colour (an instrument or a mood: "a cheeky muted trumpet", "a wobbly synth for the fizz"), the tempo, and the second the answer block starts. */
export const musicPrompt6 = ({colour, answerAt, bpm = 150}) => MUSIC_TEMPLATE.replace('{bpm}', String(Math.max(F6.bpm[0], Math.min(F6.bpm[1], Math.round(bpm))))).replace('{colour}', colour).replace('{answer}', String(Math.round(answerAt)));

const bareW = (w) => w.toLowerCase().replace(/[^a-z0-9%']/g, '');
const median = (xs) => { const v = [...xs].sort((a, b) => a - b); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : NaN; };

/**
 * The format-6 checks. `L` the layout (director.ts), `voiced` true when the word times are the real ones. Results go through
 * `add(group, point, pass, detail, warn)` like every other check.
 */
export const checkFormat6 = (toon, L, {voiced, known, add}) => {
  const T = L.total / TOON_FPS;
  const shots = toon.shots ?? [];
  const all = L.lines; // placed lines, in order
  const people = new Set([...PEOPLE, 'dad', 'narrator']);
  const isPerson = (who) => people.has(who);
  // every line's speech, in story seconds: its first word's start to its last word's end (voiced); before voicing the whole
  // estimated clip, as a voice clip's words fill it (the even-spread guess words leave 0.35 s gaps a clip that real clips do not)
  const speech = all.map((p) => {
    const t0 = p.from / TOON_FPS, n = wordsOf(p.line.text).length;
    if (!voiced || !p.words.length) return {p, a: t0, b: t0 + p.frames / TOON_FPS - GAP_OF(L) - Math.max(0, Math.min(3, p.line.beat ?? 0)), n};
    return {p, a: t0 + p.words[0].start, b: t0 + p.words[p.words.length - 1].end, n};
  });
  const answer = all.filter((p) => p.line.answer);
  const answerAt = answer.length ? answer[0].from / L.total : null;
  const title = keysOf(toon.title);
  const term = [toon.term, toon.topic].flat().filter(Boolean).map((x) => bareW(String(x)));
  const topicWords = new Set([...title, ...term]);
  const saysTopic = (w) => { const b = bareW(w); return topicWords.has(b) || topicWords.has(b.replace(/s$/, '')) || [...topicWords].some((t) => t.length > 4 && b.startsWith(t)); };

  // ---- S1 the hook is in the story
  const hook = all.find((p) => !p.line.cold) ?? all[0];
  const first = speech[0];
  // when the topic word is said: its real start (voiced), else its place in the line's estimated clip
  const topicAt = (() => { for (const sp of speech) for (const w of sp.p.words) if (saysTopic(w.w)) return voiced ? sp.p.from / TOON_FPS + w.start : sp.a + (w.start / Math.max(0.1, sp.p.words[sp.p.words.length - 1].end)) * (sp.b - sp.a); return null; })();
  const s1 = [];
  if (wordsOf(hook.line.text).length > F6.hookWords) s1.push(`${wordsOf(hook.line.text).length} words (at most ${F6.hookWords})`);
  if (!(first.a >= F6.firstWord[0] - 1e-6 && first.a <= F6.firstWord[1] + 1e-6)) s1.push(`the first word comes at ${first.a.toFixed(2)} s (${F6.firstWord[0]}-${F6.firstWord[1]} s: the picture and a sound hit first; set the first scene's "lead")`);
  if (topicAt === null || topicAt > F6.topicBy + 1e-6) s1.push(topicAt === null ? `the topic (${[...topicWords].join(', ')}) is never said` : `the topic is first said at ${topicAt.toFixed(1)} s (by ${F6.topicBy} s)`);
  add('format', 'S1 Hook in the story', !s1.length, s1.length ? `"${hook.line.text}": ${s1.join('; ')}` : `"${hook.line.text}": first word at ${first.a.toFixed(2)} s, the topic said at ${topicAt.toFixed(1)} s`);
  if (wordsOf(hook.line.text).some((w) => /^(you|your|you'll|you're|yours)$/.test(bare(w)))) add('format', 'S1 Hook in the story: no "you" to the camera', true, `"${hook.line.text}" says "you": fine between characters, not to the viewer (a note while the owner compares hook kinds)`, true);

  // ---- S2 one story: few facts before the answer
  const facts = (ps) => ps.filter((p) => !p.line.chat && (p.line.src ?? []).length);
  const before = facts(all.filter((p) => !p.line.answer && (!answer.length || p.from < answer[0].from)));
  const inAnswer = facts(answer);
  const nb = before.length;
  add('format', 'S2 One story', nb <= F6.factsWarnUpTo, `${nb} sourced fact line(s) before the answer block (${F6.factsBefore} or fewer; ${F6.factsBefore + 1}-${F6.factsWarnUpTo} is a note, over ${F6.factsWarnUpTo} fails)${nb ? `: ${before.map((p) => p.line.id).join(', ')}` : ''}; ${inAnswer.length} in the answer (2 or more). Extra facts go to the description`, nb > F6.factsBefore || (answer.length > 0 && inAnswer.length < 2));

  // ---- S3 the cast returns
  const count = {};
  for (const p of all) count[p.line.who] = (count[p.line.who] ?? 0) + 1;
  const speakers = Object.keys(count).filter((w) => w !== 'doctor' && w !== 'narrator');
  const once = Object.entries(count).filter(([w, n]) => w !== 'narrator' && n < F6.linesEach).map(([w, n]) => `${w} ${n}`);
  add('format', 'S3 Cast returns', speakers.length <= F6.speakers && !once.length, `${speakers.length} speaking character(s) besides the doctor (${F6.speakers} at most): ${Object.entries(count).map(([w, n]) => `${w} ${n}`).join(', ')}${once.length ? `; under ${F6.linesEach} lines: ${once.join(', ')} (make them silent or give them more)` : ''}`);

  // ---- S4 the answer block
  const s4 = [];
  if (!answer.length) s4.push('no answer block (mark 3-6 lines "answer": true)');
  else {
    const ids = all.map((p) => p.line.id);
    const idx = answer.map((p) => ids.indexOf(p.line.id));
    if (idx.some((v, i) => i && v !== idx[i - 1] + 1)) s4.push('the answer lines are not one block in a row');
    if (answer.length < F6.answerLines[0] || answer.length > F6.answerLines[1]) s4.push(`${answer.length} lines (${F6.answerLines.join('-')})`);
    const words = answer.reduce((n, p) => n + wordsOf(p.line.text).length, 0);
    if (words < F6.answerWords[0] || words > F6.answerWords[1]) s4.push(`${words} words (${F6.answerWords.join('-')})`);
    if (answerAt < F6.answerAt[0] || answerAt > F6.answerAt[1]) s4.push(`starts at ${Math.round(answerAt * 100)}% of the story (${F6.answerAt.map((x) => x * 100).join('-')}%)`);
    const text = answer.map((p) => p.line.text).join(' ');
    if (!wordsOf(text).some(saysTopic)) s4.push(`does not name the condition (a word of the title or the "term": ${[...topicWords].join(', ')})`);
    if (!wordsOf(text).some((w) => ACTION_WORDS.includes(bareW(w))) && !/that'?s why/i.test(text)) s4.push(`no one thing to do (${ACTION_WORDS.slice(0, 8).join(', ')}... or "that's why")`);
    const bareA = answer.filter((p) => !(p.line.src ?? []).length).map((p) => p.line.id);
    if (bareA.length) s4.push(`lines without a source: ${bareA.join(', ')}`);
    const care = answer.findIndex((p) => p.line.care);
    if (care < 0) s4.push('no care line (mark it "care": true)');
    else if (care < answer.length - 2) s4.push('the care line must be the last or second-last of the block');
  }
  add('format', 'S4 Answer block', !s4.length, s4.length ? s4.join('; ') : `${answer.length} lines, ${answer.reduce((n, p) => n + wordsOf(p.line.text).length, 0)} words by ${[...new Set(answer.map((p) => p.line.who))].join(', ')}, from ${Math.round(answerAt * 100)}% of the story; names the condition, gives one thing to do, sourced, care line in place`);

  // ---- S5 breath: talk, then stop and let the picture act
  const spans = [...speech].sort((x, y) => x.a - y.a);
  let talked = 0, end = -1;
  for (const sp of spans) { const a = Math.max(sp.a, end); if (sp.b > a) talked += sp.b - a; end = Math.max(end, sp.b); }
  const share = talked / T;
  const gaps = spans.slice(1).map((sp, i) => ({from: spans[i].b, to: sp.a, s: sp.a - spans[i].b})).filter((g) => g.s > 0);
  const g05 = gaps.filter((g) => g.s >= 0.5 - 1e-6).length, g10 = gaps.filter((g) => g.s >= 1.0 - 1e-6).length;
  const evF = L.shots.flatMap((sh, si) => (sh.shot.events ?? []).filter((e) => e.set || e.act || e.fx).map((e) => frameOf(L, si, e.at, e.word, e.delay) / TOON_FPS));
  const cardSpans = L.shots.filter((sh) => sh.shot.card !== undefined).map((sh) => [sh.from / TOON_FPS, (sh.from + sh.frames) / TOON_FPS]);
  const deadBeats = speech.filter((sp, i) => (sp.p.line.beat ?? 0) > 0 && i + 1 < speech.length).map((sp, i0) => {
    const i = speech.indexOf(sp); const to = speech[i + 1].a;
    const ok = evF.some((t) => t >= sp.b - 0.05 && t <= to) || cardSpans.some(([a, b]) => a < to && b > sp.b);
    return ok ? null : sp.p.line.id; void i0;
  }).filter(Boolean);
  const long = gaps.filter((g) => g.s > F6.beatMax && !cardSpans.some(([a, b]) => a >= g.from - 0.6 && b <= g.to + 0.6)).map((g) => `${g.s.toFixed(1)} s at ${g.from.toFixed(1)} s`);
  const s5 = [];
  if (share < F6.talking[0] || share > F6.talking[1]) s5.push(`someone talks ${Math.round(share * 100)}% of the story (${F6.talking.map((x) => x * 100).join('-')}%)`);
  if (g05 < F6.pauses05) s5.push(`${g05} pause(s) of 0.5 s or more (${F6.pauses05}+)`);
  if (g10 < F6.pauses10) s5.push(`${g10} pause(s) of 1 s or more (${F6.pauses10}+)`);
  if (deadBeats.length) s5.push(`a silent beat with no picture event after: ${deadBeats.join(', ')}`);
  if (long.length) s5.push(`a silence over ${F6.beatMax} s: ${long.join(', ')}`);
  add('format', 'S5 Breath', !s5.length, s5.length ? s5.join('; ') : `talking ${Math.round(share * 100)}% of the story; ${g05} pauses of 0.5 s+, ${g10} of 1 s+; every beat has a picture event`);

  // ---- S6 talk speed (real word times only) and no "..." inside a line
  const dots = all.filter((p) => /\.\.\.|…/.test(p.line.text.trim().replace(/(\.\.\.|…)$/, ''))).map((p) => p.line.id);
  if (dots.length) add('format', 'S6 No "..." inside a line', false, `split it into two lines by two speakers instead: ${dots.join(', ')}`);
  if (!voiced) add('format', 'S6 Talk speed', true, 'measured on the real word times after voicing (body 3.0-3.6 words/s, the doctor 2.6-3.0 and 0.3 slower)', true);
  else {
    const rate = speech.filter((sp) => sp.n >= 4 && sp.b > sp.a).map((sp) => ({who: sp.p.line.who, id: sp.p.line.id, w: sp.n / (sp.b - sp.a)}));
    const body = rate.filter((r) => r.who !== 'doctor' && !isPerson(r.who)).map((r) => r.w);
    const doc = rate.filter((r) => r.who === 'doctor').map((r) => r.w);
    const mb = median(body), md = median(doc);
    const s6 = [];
    if (body.length && (mb < F6.bodyWps[0] || mb > F6.bodyWps[1])) s6.push(`body lines ${mb.toFixed(2)} words/s (${F6.bodyWps.join('-')})`);
    if (doc.length && (md < F6.doctorWps[0] || md > F6.doctorWps[1])) s6.push(`the doctor ${md.toFixed(2)} words/s (${F6.doctorWps.join('-')})`);
    if (doc.length && body.length && mb - md < F6.doctorSlower - 1e-6) s6.push(`the doctor is only ${(mb - md).toFixed(2)} words/s slower than the body cast (${F6.doctorSlower}+)`);
    const off = rate.filter((r) => r.w < F6.lineWps[0] || r.w > F6.lineWps[1]).map((r) => `${r.id} ${r.w.toFixed(1)}`);
    if (off.length) s6.push(`lines outside ${F6.lineWps.join('-')} words/s: ${off.join(', ')}`);
    add('format', 'S6 Talk speed', !s6.length, s6.length ? s6.join('; ') : `body ${Number.isFinite(mb) ? mb.toFixed(2) : '-'} words/s, doctor ${Number.isFinite(md) ? md.toFixed(2) : '-'}`);
  }

  // ---- S7 numbers, source words, reactions, sentence length
  const tokens = all.flatMap((p) => wordsOf(p.line.text).map(bareW));
  const nums = tokens.filter((w) => NUMBER_TOKEN.test(w)).length;
  add('format', 'S7 Numbers said', nums <= F6.numbers + 1, `${nums} number(s) said aloud (${F6.numbers}, in the answer; ${F6.numbers + 1} is a note, more fails)`, nums > F6.numbers);
  const srcW = all.filter((p) => SOURCE_WORDS.test(p.line.text)).length;
  add('format', 'S7 Source words said', true, `"study / trial / WHO" said in ${srcW} line(s) (${F6.sourceWords} at most, only where honesty needs it; the sources go in the description)`, srcW > F6.sourceWords);
  const reacts = tokens.filter((w) => REACTION_WORDS.includes(w.replace(/'/g, ''))).length;
  add('format', 'S7 Reaction words', true, `${reacts} reaction word(s) (huh, whoa, ugh...: ${F6.reactions}+ keep it a scene, not a lecture)`, reacts < F6.reactions);
  const sentences = all.flatMap((p) => p.line.text.split(/[.!?]+/).map((x) => wordsOf(x).length).filter((n) => n > 0));
  const mean = sentences.reduce((a, b) => a + b, 0) / Math.max(1, sentences.length);
  add('format', 'S7 Sentence length', true, `${mean.toFixed(1)} words a sentence (${F6.sentence.join('-')})`, mean < F6.sentence[0] || mean > F6.sentence[1]);

  // ---- S8 places: few, inside the body, held long
  const kinds = L.shots.map((sh) => ({sh, kind: kindOf(sh.shot)}));
  const notCard = kinds.filter((k) => k.kind !== 'card');
  const bodyIds = [...new Set(notCard.filter((k) => k.kind !== 'room').map((k) => k.sh.shot.id))];
  const roomRuns = notCard.filter((k, i) => k.kind === 'room' && (i === 0 || notCard[i - 1].kind !== 'room')).length;
  const switches = notCard.filter((k, i) => i > 0 && (k.kind === 'room') !== (notCard[i - 1].kind === 'room')).length;
  const inside = kinds.filter((k) => k.kind === 'body' || k.kind === 'micro').reduce((n, k) => n + k.sh.frames, 0) / L.total;
  const held = bodyIds.map((id) => ({id, s: kinds.filter((k) => k.sh.shot.id === id).reduce((n, k) => n + k.sh.frames, 0) / TOON_FPS}));
  const short = held.filter((h) => h.s < F6.placeSeconds - 1e-6).map((h) => `${h.id} ${h.s.toFixed(1)} s`);
  const s8 = [];
  if (bodyIds.length < F6.bodyPlaces[0] || bodyIds.length > F6.bodyPlaces[1]) s8.push(`${bodyIds.length} body place(s) (${F6.bodyPlaces.join('-')})`);
  if (roomRuns > F6.rooms) s8.push(`${roomRuns} room scenes (one each side at most)`);
  if (switches > F6.switches) s8.push(`${switches} body/room switches (${F6.switches} at most)`);
  if (inside < F6.inside) s8.push(`inside the body ${Math.round(inside * 100)}% of the story (${F6.inside * 100}%+)`);
  if (short.length) s8.push(`a body place held under ${F6.placeSeconds} s: ${short.join(', ')}`);
  add('format', 'S8 Places', !s8.length, s8.length ? s8.join('; ') : `${bodyIds.length} body places (${held.map((h) => `${h.id} ${h.s.toFixed(1)} s`).join(', ')}), ${roomRuns} room scene(s), ${switches} switches, inside ${Math.round(inside * 100)}%`);

  // ---- S9 the end card (decision 25, option A)
  if (known.ctaSeconds) {
    const share9 = known.ctaSeconds / (T + known.ctaSeconds);
    add('format', 'S9 End card', known.ctaSeconds <= F6.endCard + 1e-6 && share9 <= F6.endShare + 1e-6, `the end card runs ${known.ctaSeconds.toFixed(1)} s, ${Math.round(share9 * 100)}% of the video (${F6.endCard} s and ${F6.endShare * 100}% at most: Joey says only the follow line)`);
  } else add('format', 'S9 End card', true, `measured once the narrator's clip exists (${F6.endCard} s and ${F6.endShare * 100}% of the video at most)`, true);

  // ---- S10 one real intruder
  add('format', 'S10 One real intruder', typeof toon.intruder === 'string' && toon.intruder.trim().length > 0, toon.intruder ? `the hero prop "${toon.intruder}" enters the body` : 'name the ONE real object that comes into the body ("intruder": "cigarette")');

  // ---- S11 no gauges inside the body
  const gauges = shots.filter((s) => ['body', 'micro'].includes(kindOf(s))).flatMap((s) => (s.props ?? []).filter((p) => GAUGE_PROPS.includes(p.kind)).map((p) => `${s.id}: ${p.kind}`));
  add('format', 'S11 No gauges inside the body', !gauges.length, gauges.length ? `draw the state ON the organ instead: ${gauges.join(', ')}` : 'the state is drawn on the organ (no gauge, meter, clock or chip in a body shot)');

  // ---- S12 time cards
  const s12 = [];
  const cards = shots.map((s, i) => ({s, i})).filter((x) => x.s.card !== undefined);
  if (cards.length > F6.cards) s12.push(`${cards.length} cards (${F6.cards} at most)`);
  const srcIds = new Set((toon.sources ?? []).map((x) => x.id));
  for (const {s, i} of cards) {
    const sec = s.seconds ?? 1.0;
    if (sec < F6.cardSeconds[0] - 1e-6 || sec > F6.cardSeconds[1] + 1e-6) s12.push(`${s.id}: ${sec} s (${F6.cardSeconds.join('-')})`);
    if (!s.same) s12.push(`${s.id}: name the shot whose framing comes back after it ("same")`);
    else {
      if (!shots.slice(0, i).some((x) => x.id === s.same)) s12.push(`${s.id}: "same" ${s.same} is not a shot before the card`);
      if (shots[i + 1]?.id !== s.same) s12.push(`${s.id}: the shot after the card must be ${s.same} again (the same framing, a new state), not ${shots[i + 1]?.id ?? 'nothing'}`);
    }
    if (!(s.src ?? []).length) s12.push(`${s.id}: the change across the card needs a source ("src")`);
    else for (const id of s.src) if (!srcIds.has(id)) s12.push(`${s.id}: unknown source "${id}"`);
  }
  add('format', 'S12 Time cards', !s12.length, s12.length ? s12.join('; ') : `${cards.length} card(s): ${cards.map(({s}) => `"${s.card}" back to ${s.same}`).join(', ') || 'none'}`);

  // ---- impacts, music stops, one action then a hold, the music family
  const flashes = shots.flatMap((s) => (s.events ?? []).filter((e) => e.fx).map((e) => ({s, e})));
  const onCut = flashes.filter(({e}) => e.at === 'start' && !e.delay).map(({s}) => s.id);
  add('format', 'Impacts: one flash at most', flashes.length <= F6.flashes && !onCut.length, `${flashes.length} flash(es) (${F6.flashes} at most, never on a cut${onCut.length ? `; on the cut into ${onCut.join(', ')}` : ''}); no screen shake on a flash`);
  const stopEv = L.shots.flatMap((sh, si) => (sh.shot.events ?? []).filter((e) => e.stop).map((e) => {
    const a = frameOf(L, si, e.at, e.word, e.delay) / TOON_FPS;
    const len = typeof e.stop === 'number' ? e.stop : 0.6;
    return {id: sh.shot.id, a, b: a + len, len};
  }));
  const wordsAt = voiced ? speech.flatMap((sp) => sp.p.words.map((w) => [sp.p.from / TOON_FPS + w.start, sp.p.from / TOON_FPS + w.end])) : speech.map((sp) => [sp.a, sp.b]);
  const onWord = stopEv.filter((x) => wordsAt.some(([a, b]) => a < x.b && b > x.a)).map((x) => `${x.id} at ${x.a.toFixed(1)} s`);
  const badLen = stopEv.filter((x) => x.len < 0.4 - 1e-6 || x.len > 0.8 + 1e-6).map((x) => `${x.id} ${x.len} s`);
  add('format', 'Music stops', stopEv.length <= F6.stops && !onWord.length && !badLen.length, `${stopEv.length} planned stop(s) (${F6.stops} at most, 0.4-0.8 s, never on a word)${onWord.length ? `; on a word: ${onWord.join(', ')}` : ''}${badLen.length ? `; length: ${badLen.join(', ')}` : ''}`);
  const crowd = [];
  L.shots.forEach((sh, si) => {
    const ts = [...new Set((sh.shot.events ?? []).filter((e) => e.set || e.act).map((e) => frameOf(L, si, e.at, e.word, e.delay)))].sort((a, b) => a - b).map((f) => f / TOON_FPS);
    ts.forEach((t, i) => { if (i && t - ts[i - 1] < F6.hold - 1e-6) crowd.push(`${sh.shot.id} at ${ts[i - 1].toFixed(1)} and ${t.toFixed(1)} s`); });
  });
  add('format', 'One action, then a hold', !crowd.length, crowd.length ? `two actions in one place closer than ${F6.hold} s: ${crowd.join('; ')}` : `every action in a place is followed by a hold of ${F6.hold} s or more (the render's picture checks measure the rest)`);
  const prompt = String(toon.musicPrompt ?? '');
  const bpm = Number(prompt.match(/(\d{2,3})\s*bpm/i)?.[1] ?? NaN);
  add('format', 'Music family', /funk/i.test(prompt) && bpm >= F6.bpm[0] && bpm <= F6.bpm[1], `the track's prompt ${/funk/i.test(prompt) ? 'is funk' : 'must say funk'} at ${Number.isFinite(bpm) ? `${bpm} BPM` : 'no tempo'} (${F6.bpm.join('-')} BPM; start from MUSIC_TEMPLATE)`);
};
const GAP_OF = (L) => L.gap ?? 0.14;
export {AUTO_SFX};
