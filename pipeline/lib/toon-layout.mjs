#!/usr/bin/env node
/**
 * MedPeak Toons, engine v9 phase 1 (2026-11-23): THE LAYOUT LOG. Where every face, eye, mouth, hand, tag, label,
 * burst, plate, caption word and the watermark IS on the screen, at every probe time of a v8 video, taken from the
 * real component tree (blueprint 05, Parts 4.3 and 4.12). The layout checks (toon-staging L1-L14, toon-motion M1-M5,
 * toon-camera) and the scoreboard (toon-score) read it; none of them reads the old engine any more for v8 videos.
 *
 *   node --import tsx pipeline/lib/toon-layout.mjs <slug> [--every 0.0333]   -> videos/<slug>/renders/layout.json
 *
 * How: each probe renders the shot's Scene and Screen with react-dom/server in Node (free, no browser, about 5 ms a
 * probe) inside a `LayoutCtx` collector (src/toons/v8/play.tsx). Components report with `useReport()` (since the engine
 * v9 integration of 2026-11-23 every one listed in 07-layout-log-wiring.md does: the kit's Eyes, Mouth, TinyArm and Fig,
 * the people rig, hud, act, cells, props and the anatomy stages), so the old shims are gone; what stays here only follows
 * the plain SVG and HTML transforms on the way down (a <g transform>, a nested <svg viewBox>, a moved <div>) for drawings
 * that do not push a FrameMove themselves. The camera is the player's own (video.tsx `frameState`: smoothing, shake,
 * punch, the v9 lock), and the player's screen layer (the caption word, the watermark) is the player's own component
 * (`PlayerScreen`), rendered here inside the same collector.
 *
 * Every item is in SCREEN pixels (after the camera), 1080 x 1920. Probe record:
 *   {t, shot, si, kind: 'body'|'room'|'card', cam: {x, y, z}, line, speaker, cast, items: [{kind, who, box, dir, ...}]}
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {args, isMain, readJson, videoDir} from './util.mjs';

const require = createRequire(import.meta.url);

// ------------------------------------------------------------------ shims (probe only; see the header)
// The JSX runtime is patched BEFORE any .tsx module is imported, so the compiled shots call the wrapper.
const SHIMS = new Map(); // component function -> (props, type) => element
const WRAPPED = new WeakMap();
const TAGS = new Map(); // 'svg' | 'g' | 'div' -> a wrapper that tells the log the element's transform
let jsxOrig = null;
const installJsx = () => {
  if (jsxOrig) return;
  const rt = require('react/jsx-runtime');
  jsxOrig = {jsx: rt.jsx, jsxs: rt.jsxs};
  const wrapType = (type) => {
    if (typeof type === 'string') return M && TAGS.has(type) ? TAGS.get(type) : type;
    if (typeof type !== 'function' || !SHIMS.has(type)) return type;
    let w = WRAPPED.get(type);
    if (!w) {
      const shim = SHIMS.get(type);
      w = (props) => shim(props, type);
      Object.defineProperty(w, 'name', {value: `Shim(${type.name})`});
      WRAPPED.set(type, w);
    }
    return w;
  };
  const React = require('react');
  const ce = React.createElement;
  React.createElement = (type, ...rest) => ce(wrapType(type), ...rest); // a file compiled with the classic JSX transform
  rt.jsx = (type, props, key) => jsxOrig.jsx(wrapType(type), props, key);
  rt.jsxs = (type, props, key) => jsxOrig.jsxs(wrapType(type), props, key);
  try {
    const dev = require('react/jsx-dev-runtime');
    const d0 = dev.jsxDEV;
    dev.jsxDEV = (type, ...rest) => d0(wrapType(type), ...rest);
  } catch { /* no dev runtime */ }
};
installJsx();

let M = null; // the loaded modules
const load = async () => {
  if (M) return M;
  const React = require('react');
  const {renderToStaticMarkup} = require('react-dom/server');
  const src = (p) => new URL(`../../src/${p}`, import.meta.url).href;
  const [play, scene, kit, people, hud, act, micro3, video, director] = await Promise.all([
    import(src('toons/v8/play.tsx')), import(src('toons/v8/scene.tsx')), import(src('toons/v8/kit.tsx')), import(src('toons/v8/people-rig.tsx')),
    import(src('toons/v8/hud.tsx')), import(src('toons/v8/act.tsx')), import(src('toons/v8/micro3.tsx')), import(src('toons/v8/video.tsx')), import(src('toons/director.ts')),
  ]);
  M = {React, renderToStaticMarkup, play, scene, kit, people, hud, act, micro3, video, director};
  installShims(M);
  return M;
};

const box = (x0, y0, x1, y1) => ({x0, y0, x1, y1});
const num = (v, d = 0) => { const n = typeof v === 'number' ? v : parseFloat(String(v ?? '')); return Number.isFinite(n) ? n : d; };
/** An SVG `transform` attribute as a matrix (translate, scale, rotate, matrix; left to right). */
export const svgTransform = (s, P) => {
  let m = P.IDENTITY;
  for (const [, fn, argStr] of String(s).matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = argStr.split(/[\s,]+/).filter(Boolean).map(Number);
    let n = P.IDENTITY;
    if (fn === 'translate') n = P.matTranslate(a[0] ?? 0, a[1] ?? 0);
    else if (fn === 'scale') n = P.matScale(a[0] ?? 1, a[1] ?? a[0] ?? 1);
    else if (fn === 'rotate') n = a.length >= 3 ? P.matMul(P.matTranslate(a[1], a[2]), P.matMul(P.matRotate(a[0]), P.matTranslate(-a[1], -a[2]))) : P.matRotate(a[0] ?? 0);
    else if (fn === 'matrix' && a.length === 6) n = a;
    m = P.matMul(m, n);
  }
  return m;
};
/** A CSS `transform` (px, deg; percentages of a known width/height) as a matrix. */
export const cssTransform = (s, w, h, P) => {
  let m = P.IDENTITY;
  const len = (v, size) => (String(v).trim().endsWith('%') ? (parseFloat(v) / 100) * (size ?? 0) : parseFloat(v) || 0);
  for (const [, fn, argStr] of String(s).matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = argStr.split(',').map((x) => x.trim()).filter(Boolean);
    let n = P.IDENTITY;
    if (fn === 'translate') n = P.matTranslate(len(a[0], w), len(a[1] ?? '0', h));
    else if (fn === 'translateX') n = P.matTranslate(len(a[0], w), 0);
    else if (fn === 'translateY') n = P.matTranslate(0, len(a[0], h));
    else if (fn === 'scale') n = P.matScale(parseFloat(a[0]), parseFloat(a[1] ?? a[0]));
    else if (fn === 'rotate') n = P.matRotate(parseFloat(a[0]) || 0);
    m = P.matMul(m, n);
  }
  return m;
};
const installShims = ({React, play, micro3}) => {
  const h = React.createElement;
  const {FrameMove} = play;
  // ---- every SVG and HTML transform on the way down (so a piece drawn inside a <g transform>, a nested <svg viewBox>
  // or a moved <div> reports where it really is). Put pushes its own transform (FrameMove), so its svg and g are skipped.
  const putsOwn = (children) => children && typeof children === 'object' && !Array.isArray(children) && children.type === FrameMove;
  const svgM = (p) => {
    const st = p.style ?? {};
    let m = play.matTranslate(num(st.left) + num(p.x), num(st.top) + num(p.y));
    if (p.viewBox) {
      const [vx, vy, vw, vh] = String(p.viewBox).split(/[\s,]+/).map(Number);
      const w = num(p.width, vw), hh = num(p.height, vh);
      const k = Math.min(w / vw, hh / vh);
      m = play.matMul(m, play.matMul(play.matTranslate((w - vw * k) / 2, (hh - vh * k) / 2), play.matMul(play.matScale(k), play.matTranslate(-vx, -vy))));
    }
    if (st.transform) m = play.matMul(m, cssTransform(st.transform, num(p.width), num(p.height), play));
    return m;
  };
  const divM = (p) => {
    const st = p.style ?? {};
    const w = typeof st.width === 'number' ? st.width : undefined, hh = typeof st.height === 'number' ? st.height : undefined;
    let m = play.matTranslate(num(st.left), num(st.top));
    if (st.transform) {
      const o = String(st.transformOrigin ?? '').split(/\s+/).filter(Boolean);
      const ox = o.length ? (o[0].endsWith('%') ? (parseFloat(o[0]) / 100) * (w ?? 0) : parseFloat(o[0]) || 0) : (w ?? 0) / 2;
      const oy = o.length > 1 ? (o[1].endsWith('%') ? (parseFloat(o[1]) / 100) * (hh ?? 0) : parseFloat(o[1]) || 0) : (hh ?? 0) / 2;
      m = play.matMul(m, play.matMul(play.matTranslate(ox, oy), play.matMul(cssTransform(st.transform, w, hh, play), play.matTranslate(-ox, -oy))));
    }
    return m;
  };
  const tag = (name, of, moves) => {
    const w = (props) => {
      if (!moves(props)) return jsxOrig.jsx(name, props);
      return jsxOrig.jsx(name, {...props, children: h(FrameMove, {m: of(props)}, props.children)});
    };
    Object.defineProperty(w, 'name', {value: `Tag(${name})`});
    TAGS.set(name, w);
  };
  tag('svg', svgM, (p) => !(p.children && putsOwn(p.children.props?.children)));
  tag('g', (p) => svgTransform(p.transform, play), (p) => !!p.transform && !putsOwn(p.children));
  tag('div', divM, (p) => { const st = p.style ?? {}; return !!(st.transform || num(st.left) || num(st.top)); });
  // (the dive's depth planes, micro3 `Depth`, are moved divs: the 'div' tag above follows them)
  void micro3;
};

// ------------------------------------------------------------------ the player's own layer, as the player draws it
/** body / micro / room / card: what kind of picture a shot is (the director's `kindOf`, src/toons/director.ts). */
export const kindOfShot = (shot) => M.director.kindOf(shot);
const toScreen = (b, cam) => ({x0: 540 + (b.x0 - cam.x) * cam.z, y0: 960 + (b.y0 - cam.y) * cam.z, x1: 540 + (b.x1 - cam.x) * cam.z, y1: 960 + (b.y1 - cam.y) * cam.z});
const r1 = (v) => Math.round(v * 10) / 10;
const rbox = (b) => [r1(b.x0), r1(b.y0), r1(b.x1), r1(b.y1)];
const iou = (a, b) => {
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)), iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const i = ix * iy, u = (a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - i;
  return u > 0 ? i / u : 0;
};

/**
 * Probe ONE moment of a shot: render `def.Scene` and `def.Screen` with a collector and return the items in screen
 * pixels. `cam` is the camera ({x, y, z} frame pixels, z = zoom); exported for tests (a synthetic shot).
 */
export const probeShot = async (def, s, cam = {x: 540, y: 960, z: 1}) => {
  const {React, renderToStaticMarkup, play} = await load();
  const h = React.createElement;
  const items = [];
  let n = 0;
  const sink = {add: (it) => items.push(it), next: () => `n${n++}`};
  renderToStaticMarkup(h(play.LayoutCtx.Provider, {value: sink}, h(def.Scene, {s})));
  if (def.Screen) renderToStaticMarkup(h(play.LayoutCtx.Provider, {value: sink}, h(play.ScreenSpace, null, h(def.Screen, {s}))));
  const out = items.map((it) => ({...it, box: it.space === 'frame' ? toScreen(it.box, cam) : it.box, dir: it.dir, tip: it.tip && (it.space === 'frame' ? [540 + (it.tip[0] - cam.x) * cam.z, 960 + (it.tip[1] - cam.y) * cam.z] : it.tip), src: it.src ?? 'report'}));
  // a shim item gives way to the component's own report of the same thing
  return out.filter((it) => it.src !== 'shim' || !out.some((o) => o.src === 'report' && o.kind === it.kind && iou(o.box, it.box) > 0.3));
};

/** Render a screen-space element (the player's caption and watermark) with a collector; its reports are screen pixels. */
const probeScreen = async (el) => {
  const {React, renderToStaticMarkup, play} = await load();
  const items = [];
  let n = 0;
  renderToStaticMarkup(React.createElement(play.LayoutCtx.Provider, {value: {add: (it) => items.push(it), next: () => `s${n++}`}}, el));
  return items;
};

/** Who each face and eye belongs to, when the drawing did not say: the cast member whose `focus` is nearest (only when focus tells them apart). */
const attribute = (items, def, s, cast, cam) => {
  if (!def.focus || cast.length < 1) return;
  const nobody = def.focus('__nobody__', s);
  const spots = cast.map((who) => ({who, f: def.focus(who, s)})).filter(({f}) => f && (f.x !== nobody.x || f.y !== nobody.y || cast.length === 1))
    .map(({who, f}) => ({who, x: 540 + (f.x - cam.x) * cam.z, y: 960 + (f.y - cam.y) * cam.z, r: f.r * cam.z}));
  if (!spots.length) return;
  for (const it of items) {
    if (it.who || !['face', 'eye', 'mouth'].includes(it.kind)) continue;
    const cx = (it.box.x0 + it.box.x1) / 2, cy = (it.box.y0 + it.box.y1) / 2;
    let best = null, bd = Infinity;
    for (const p of spots) { const d = Math.hypot(cx - p.x, cy - p.y); if (d < bd) { bd = d; best = p; } }
    if (best && bd < Math.max(80, best.r * 1.6)) { it.who = best.who; it.guess = true; }
  }
};

/**
 * The layout log of a whole video (the story; the end card is left out). `every` seconds between probes
 * (default 1/30: the motion checks compare one frame with the next at 30 fps).
 */
export const probeLayout = async (slug, opts = {}) => {
  const m = await load();
  const {video: V, director: D} = m;
  const dir = videoDir(slug);
  const toon = opts.toon ?? readJson(path.join(dir, 'toon.json'));
  const stored = opts.timings !== undefined ? opts.timings : readJson(path.join(dir, 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((sh) => (sh.lines ?? []).every((l) => stored.lines?.[l.id]?.text === l.text));
  const timings = voiced ? stored : null;
  const shots = V.V8_VIDEOS[toon.slug ?? slug];
  if (!shots) throw new Error(`${slug} is not a look v8 video (no shots in src/toons/v8/video.tsx V8_VIDEOS)`);
  const L = D.layoutToon(toon, timings);
  const story = L.total / D.TOON_FPS;
  const every = opts.every ?? 1 / 30;
  const cs = D.captionStyle(toon);
  const heads = new Map(); // v9: the act-3 watermark's head boxes, once a shot (the player's own `shotHeads`)
  const probes = [];
  const t0 = opts.from ?? 0, t1 = Math.min(story, opts.to ?? story);
  for (let k = 0; ; k++) {
    const sec = t0 + k * every;
    if (sec >= t1 - 1e-9) break;
    // the player's own decisions for this moment: the shot, the camera (smoothing, shake, punch, the v9 lock), the caption
    const st = V.frameState(L, toon, timings, sec);
    const {s, si} = st;
    const def = shots[s.id];
    const shot = L.shots[si].shot;
    const kind = kindOfShot(shot);
    const cam = st.cam;
    let items = def ? await probeShot(def, s, cam) : [];
    const cast = (shot.cast ?? []).map((c) => c.who);
    if (def) attribute(items, def, s, cast, cam);
    // the caption word and the watermark: the player's own screen layer, reporting in screen pixels
    if (D.isV9(toon) && !heads.has(si)) heads.set(si, V.shotHeads(L, toon, timings, si));
    items.push(...(await probeScreen(m.React.createElement(V.PlayerScreen, {L, toon, st, sec, heads: heads.get(si)}))).map((it) => ({...it, src: 'player'})));
    const line = s.cur;
    const speaker = line && s.t >= line.from && s.t < line.from + line.voice ? line.who : null;
    probes.push({
      t: +sec.toFixed(4), shot: s.id, si, kind, cam: {x: r1(cam.x), y: r1(cam.y), z: +cam.z.toFixed(4)},
      line: line?.id ?? null, speaker, cast,
      items: items.map((it) => {
        const o = {kind: it.kind, box: rbox(it.box)};
        if (it.who) o.who = it.who;
        if (it.guess) o.guess = true;
        if (it.dir) o.dir = it.dir.map((v) => +v.toFixed(3));
        if (it.tip) o.tip = it.tip.map(r1);
        if (it.target) o.target = it.target;
        if (it.owner) o.owner = it.owner;
        if (it.open !== undefined) o.open = it.open;
        if (it.id) o.id = it.id;
        if (it.text) o.text = it.text;
        if (it.body && !it.who) o.body = it.body;
        if (it.chain?.length) o.chain = it.chain;
        o.src = it.src;
        return o;
      }),
    });
  }
  return {version: LAYOUT_VERSION, slug: toon.slug ?? slug, title: toon.title, format: toon.format ?? 1, caption: toon.caption ?? 1, captionY: cs.y, every, story: +story.toFixed(3), voiced: !!timings,
    shots: L.shots.map((sh) => ({id: sh.shot.id, from: +(sh.from / D.TOON_FPS).toFixed(3), to: +((sh.from + sh.frames) / D.TOON_FPS).toFixed(3), kind: kindOfShot(sh.shot), set: sh.shot.set ?? null})),
    lines: L.lines.map((l) => ({id: l.line.id, who: l.line.who, si: l.si, from: +(l.from / D.TOON_FPS).toFixed(3), voice: +((l.words.at(-1)?.end ?? l.frames / D.TOON_FPS)).toFixed(3), text: l.line.text,
      words: l.words.map((w) => [w.w, +w.start.toFixed(3), +w.end.toFixed(3)]), src: l.line.src ?? null, chat: !!l.line.chat})),
    probes};
};

/** Bump when the log's shape changes: an older layout.json is probed again. */
export const LAYOUT_VERSION = 3; // 3 (2026-11-23): the components report themselves (no shims), the player's camera and screen layer
export const layoutPath = (slug) => path.join(videoDir(slug), 'renders', 'layout.json');
/** Probe and write videos/<slug>/renders/layout.json; returns the log. */
export const writeLayout = async (slug, opts = {}) => {
  const log = await probeLayout(slug, opts);
  fs.mkdirSync(path.dirname(layoutPath(slug)), {recursive: true});
  fs.writeFileSync(layoutPath(slug), JSON.stringify(log));
  return log;
};
/** The layout log of a video: read it when it is newer than the script, the timings and the shot code; else probe again. */
export const layoutOf = async (slug, opts = {}) => {
  const p = layoutPath(slug);
  if (!opts.fresh && fs.existsSync(p)) {
    const at = fs.statSync(p).mtimeMs;
    const dir = videoDir(slug);
    // the script, the timings, the shot code and the probe itself
    const v8 = new URL('../../src/toons/v8/', import.meta.url);
    const code = fs.readdirSync(v8).filter((f) => f.endsWith('.tsx')).map((f) => new URL(f, v8));
    const deps = [path.join(dir, 'toon.json'), path.join(dir, 'toon-timings.json'), ...code, new URL(import.meta.url), new URL('../../src/toons/director.ts', import.meta.url)].filter((f) => fs.existsSync(f));
    if (deps.every((f) => fs.statSync(f).mtimeMs <= at)) {
      const log = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (log.version === LAYOUT_VERSION && (!opts.every || Math.abs(log.every - opts.every) < 1e-6)) return log;
    }
  }
  return writeLayout(slug, opts);
};
/** Is this slug a look v8 video (its shots are code in src/toons/v8)? */
export const isV8 = async (slug) => { const {video} = await load(); return !!video.V8_VIDEOS[slug]; };

if (isMain(import.meta.url)) {
  const a = args();
  const slug = a._[0];
  if (!slug) { console.error('Give a slug: node --import tsx pipeline/lib/toon-layout.mjs <slug> [--every 0.0333]'); process.exit(2); }
  const t = Date.now();
  const log = await writeLayout(slug, {every: a.every ? Number(a.every) : undefined});
  const n = log.probes.reduce((k, p) => k + p.items.length, 0);
  const kinds = {};
  for (const p of log.probes) for (const it of p.items) kinds[it.kind] = (kinds[it.kind] ?? 0) + 1;
  console.log(`LAYOUT  ${slug}: ${log.probes.length} probes, ${n} items (${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', ')}), ${((Date.now() - t) / 1000).toFixed(1)} s -> ${path.relative(process.cwd(), layoutPath(slug))}`);
}
