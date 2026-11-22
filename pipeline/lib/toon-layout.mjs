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
 * probe) inside a `LayoutCtx` collector (src/toons/v8/play.tsx). Components report with `useReport()`; `Put` already
 * does. Until the kit, people, hud and act files report for themselves (07-layout-log-wiring.md), a SHIM here reports
 * for them from their own props (Eyes, Mouth, PersonAt, HeadAt, TinyArm, Burst, CharTag, IconBadge) and carries the
 * dive planes' transform (Depth). A shim item is dropped as soon as the component reports the same thing itself.
 * The player's own layer (the caption word, the watermark) is measured here from the same rules the player uses.
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
const installShims = ({React, play, kit, people, hud, act, micro3}) => {
  const h = React.createElement;
  const {useReport, circleBox, FrameMove} = play;
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
  // a person's own pieces (the rig's eyes and mouth) belong to that person: the person's shim reports the face once
  const PersonCtx = React.createContext(null);
  /** A shim that reports, then draws the real component (wrapped by `wrap` when given). */
  const reporter = (fn, wrap) => (props, type) => {
    const report = useReport();
    const inPerson = React.useContext(PersonCtx);
    for (const r of fn(props, inPerson) ?? []) report({...r, src: 'shim'});
    const el = jsxOrig.jsx(type, props);
    return wrap ? wrap(props, el) : el;
  };
  const asPerson = (props, el) => h(PersonCtx.Provider, {value: props.spec.id}, h(FrameMove, {m: play.IDENTITY, who: props.spec.id, body: true}, el));
  if (kit.Eyes) SHIMS.set(kit.Eyes, reporter(({x, y, r = 13, gap = 0, look = [0, 0], mood = 'open'}, inPerson) => {
    const cx = [x - r - gap / 2, x + r + gap / 2];
    const open = mood !== 'closed';
    return [
      ...cx.map((c) => ({kind: 'eye', box: circleBox(c, y, r), dir: look, open})),
      ...(inPerson ? [] : [{kind: 'face', box: box(x - 2 * r - gap / 2 - 0.3 * r, y - 1.4 * r, x + 2 * r + gap / 2 + 0.3 * r, y + 2.6 * r), dir: look, open}]),
    ];
  }));
  if (kit.Mouth) SHIMS.set(kit.Mouth, reporter(({x, y, w = 14, kind = 'smile'}) => [{kind: 'mouth', box: box(x - w / 2, y - w / 2, x + w / 2, y + w * 0.8), open: ['open', 'big', 'o'].includes(kind)}]));
  if (kit.TinyArm) SHIMS.set(kit.TinyArm, reporter(({to, w = 5.5, hand = 'mitten'}) => (hand === 'none' ? [] : [{kind: 'hand', box: circleBox(to[0], to[1], w * 2), open: hand === 'open'}])));
  const handOpen = (pose, side) => {
    const p = typeof pose === 'object' && pose ? pose : null;
    const hand = p && (p[side]?.hand ?? p.pose?.[side]?.hand);
    return hand === 'open';
  };
  if (people.PersonAt) SHIMS.set(people.PersonAt, reporter(({spec, x, y, scale, view, pose, facing, bob, look}) => {
    const o = {x, y, scale, view, pose, facing, bob};
    const hd = people.headAt(spec, o);
    const hands = people.handAt(spec, o);
    const hr = 0.32 * spec.build.R * scale;
    const who = spec.id;
    return [
      {kind: 'head', who, box: circleBox(hd.x, hd.y, hd.r)},
      {kind: 'face', who, box: box(hd.x - 0.55 * hd.r, hd.y - 0.45 * hd.r, hd.x + 0.55 * hd.r, hd.y + 0.6 * hd.r), dir: look ?? [0, 0.05], id: look ? 'look' : 'default-look'},
      {kind: 'hand', who, box: circleBox(hands.R.palm[0], hands.R.palm[1], hr), id: 'R', open: handOpen(pose, 'R')},
      {kind: 'hand', who, box: circleBox(hands.L.palm[0], hands.L.palm[1], hr), id: 'L', open: handOpen(pose, 'L')},
    ];
  }, asPerson));
  if (people.HeadAt) SHIMS.set(people.HeadAt, reporter(({spec, x, y, px, look}) => [
    {kind: 'head', who: spec.id, box: circleBox(x, y, px)},
    {kind: 'face', who: spec.id, box: box(x - 0.75 * px, y - 0.55 * px, x + 0.75 * px, y + 0.75 * px), dir: look ?? [0, 0.05]},
  ], asPerson));
  if (act.Burst) SHIMS.set(act.Burst, reporter(({t, t0, x, y, r = 120, dur = 0.32}) => {
    const u = (t - t0) / dur;
    return u < 0 || u > 1 ? [] : [{kind: 'fx', box: circleBox(x, y, r * 1.15), id: `burst@${t0.toFixed(2)}@${Math.round(x)},${Math.round(y)}`}];
  }));
  if (hud.CharTag) SHIMS.set(hud.CharTag, reporter(({label, x, y, r, t, dur = hud.TAG_SECONDS}) => {
    if (t < 0 || t > dur) return [];
    const {side, bx, by, w, h: hh} = hud.tagBox(label, x, y, r);
    const from = side === 'up' ? [bx, by + hh / 2] : side === 'down' ? [bx, by - hh / 2] : side === 'left' ? [bx + w / 2, by] : [bx - w / 2, by];
    const ang = Math.atan2(y - from[1], x - from[0]);
    const tip = [x - Math.cos(ang) * (r + 18), y - Math.sin(ang) * (r + 18)];
    return [{kind: 'tag', box: box(bx - w / 2, by - hh / 2, bx + w / 2, by + hh / 2 + 7), owner: label, text: label, tip, id: `tag:${label}`, target: [x, y, r]}];
  }));
  if (hud.IconBadge) SHIMS.set(hud.IconBadge, reporter(({icon, t, x = 540, y = 300, size = 330, out}) => (t < 0 || (out !== undefined && t - out > 0.25) ? [] : [{kind: 'icon', box: circleBox(x, y, size / 2), id: `icon:${icon}`}])));
  // (the dive's depth planes, micro3 `Depth`, are moved divs: the 'div' tag above follows them)
  void micro3;
};

// ------------------------------------------------------------------ the player's own layer, as the player draws it
/** The watermark's three places (src/toons/v8/hud.tsx WM_AT; keep in step until the player reports it itself). */
const WM_AT = [{x: 960, y: 178, align: 'right'}, {x: 96, y: 1330, align: 'left'}, {x: 540, y: 178, align: 'center'}];
const WM_W = 14 * 26 * 0.56, WM_H = 32;
const wmBox = (act) => {
  const p = WM_AT[Math.max(0, Math.min(2, act))];
  const x0 = p.align === 'right' ? p.x - WM_W : p.align === 'center' ? p.x - WM_W / 2 : p.x;
  return box(x0, p.y - WM_H / 2, x0 + WM_W, p.y + WM_H / 2);
};
const ROOMS = new Set(['home', 'clinic']);
/** body / room / card: what kind of picture a shot is (the director's `kindOf` will replace this). */
export const kindOfShot = (shot) => (shot.card !== undefined || shot.kind === 'card' ? 'card' : ROOMS.has(shot.set ?? '') || shot.kind === 'room' ? 'room' : shot.kind === 'micro' ? 'micro' : 'body');
const clampCam = (c) => {
  const hw = 540 / c.z, hh = 960 / c.z;
  return {z: c.z, x: Math.min(1080 - hw, Math.max(hw, c.x)), y: Math.min(1920 - hh, Math.max(hh, c.y))};
};
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
  // the three acts of the watermark (the player's rule in video.tsx)
  const isRoom = (i) => ROOMS.has(L.shots[i].shot.set ?? '');
  const actStarts = L.shots.map((_, i) => i).filter((i) => i === 0 || isRoom(i) !== isRoom(i - 1)).map((i) => L.shots[i].from / D.TOON_FPS);
  const acts = actStarts.length === 3 ? actStarts : [0, story / 3, (2 * story) / 3];
  const clean = (w) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
  const probes = [];
  const t0 = opts.from ?? 0, t1 = Math.min(story, opts.to ?? story);
  for (let k = 0; ; k++) {
    const sec = t0 + k * every;
    if (sec >= t1 - 1e-9) break;
    const {s, si} = V.shotNow(L, toon, timings, sec);
    const def = shots[s.id];
    const shot = L.shots[si].shot;
    const kind = kindOfShot(shot);
    const cam = def?.view ? clampCam(def.view(s)) : {x: 540, y: 960, z: 1, approx: true};
    let items = def ? await probeShot(def, s, cam) : [];
    const cast = (shot.cast ?? []).map((c) => c.who);
    if (def) attribute(items, def, s, cast, cam);
    // the caption word (the player's WordCaption: centred on x 540 at y cs.y, one word, the key word bigger)
    const f30 = sec * D.TOON_FPS;
    const cur = L.lines.find((l) => l.si === si && f30 >= l.from && f30 < l.from + l.frames);
    if (cur) {
      const tl = (f30 - cur.from) / D.TOON_FPS;
      const wi = cur.words.findIndex((w, i) => tl >= w.start && tl < (cur.words[i + 1]?.start ?? w.end + 0.25));
      if (wi >= 0) {
        const w = clean(cur.words[wi].w);
        const key = (cur.line.key ?? clean(cur.words[cur.words.length - 1]?.w ?? '')).toLowerCase().replace(/[!?'’]/g, '');
        const isKey = w.toLowerCase().replace(/[!?'’]/g, '') === key;
        const size = (isKey ? 132 : 108) * cs.scale, stroke = (isKey ? 14 : 12) * cs.scale;
        const ww = w.length * size * 0.7 + stroke * 2, hh = size * 1.0 + stroke * 2;
        items.push({kind: 'caption', box: box(540 - ww / 2, cs.y - hh / 2, 540 + ww / 2, cs.y + hh / 2 + 10 * cs.scale), text: w, src: 'player'});
      }
    }
    const act = acts.filter((a) => sec >= a).length - 1;
    if (sec - acts[act] >= 0) items.push({kind: 'watermark', box: wmBox(act), src: 'player', id: `act${act}`});
    const line = s.cur;
    const speaker = line && s.t >= line.from && s.t < line.from + line.voice ? line.who : null;
    probes.push({
      t: +sec.toFixed(4), shot: s.id, si, kind, cam: {x: r1(cam.x), y: r1(cam.y), z: +cam.z.toFixed(4), ...(cam.approx ? {approx: true} : {})},
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
export const LAYOUT_VERSION = 2;
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
