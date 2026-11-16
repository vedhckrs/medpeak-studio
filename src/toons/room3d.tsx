// MedPeak Toons ROOMS, second style (owner, 2026-11-16: "remove thing from wall, keep clean minimal
// wall", "keep area clean where popup visual and text, no wall element disturb", "remove unnecessary
// thing in background", "make more 3d depth of room and wall but keep 2d style").
//
// A room is a BOX seen from the front and drawn flat: a back wall, two side walls and a floor whose
// lines all run to one point, a strip of ceiling. Same flat colours and thin outlines as before;
// the depth comes from the geometry, not from a new drawing style.
//   - The BACK WALL above the rail is plain. It is the pop-up area: bubbles, tags and objects come
//     up there and nothing may hang on it.
//   - The window (and the clinic's chart) are on the SIDE WALLS, seen at an angle.
//   - The wall's pattern (panels, tiles, stripes, dots) lives below the rail only.
//   - Furniture is low and stands along a side wall: one group per room.
// Every point goes through `project`, so a new piece of furniture is a few boxes, not a new drawing.
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, Layer} from './camera';
import {roomKind, type RoomLook, type RoomRole} from './director';
import {ChartIcon, ROOM_PALS} from './rooms';
import {STYLE} from './style';

const LINE = STYLE.roomLine;
const LW = STYLE.setLinePx;
const O = {stroke: LINE, strokeWidth: LW, strokeLinejoin: 'round' as const};
type V = [number, number];
type Side = 'left' | 'right';

/** The box on screen: the back wall's rectangle, the point every depth line runs to (at face height), the camera's distance from the back wall. */
export const BOX = {x0: 170, x1: 910, top: 56, floor: 1340, vx: 540, vy: 860, cam: 1500};
/** Room units are pixels on the back wall: X from the left wall, Y up from the floor, Z from the back wall toward the viewer. */
export const RW = BOX.x1 - BOX.x0;
export const RH = BOX.floor - BOX.top;
/** The rail: below it a wall may carry a pattern and furniture may stand; above it the back wall is plain. */
export const RAIL = 330;
/** The pop-up area on screen: the plain back wall above the heads. Nothing of the room is drawn inside it. */
export const POPUP_AREA = {x0: BOX.x0, x1: BOX.x1, y0: BOX.top + 30, y1: BOX.floor - RAIL - 20};
const EYE = BOX.floor - BOX.vy; // tops lower than this are seen from above
const ZS = 640; // the side walls are drawn this deep (they leave the picture sooner)
const ZF = 1150; // and the floor this deep

export const project = (X: number, Y: number, Z = 0): V => {
  const k = BOX.cam / (BOX.cam - Z);
  return [BOX.vx + (BOX.x0 + X - BOX.vx) * k, BOX.vy + (BOX.floor - Y - BOX.vy) * k];
};
const f1 = (n: number) => n.toFixed(1);
const open = (p: V[]) => `M${p.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')}`;
const shut = (...p: V[]) => `${open(p)} Z`;
const hash = (s: string) => Math.floor(random(s) * 1000);
// lighter and darker without changing the colour's hue (a blue wall's side walls stay blue)
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const A = rgb(a); const B = rgb(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`; };
const lighter = (c: string, t: number) => mix(c, '#ffffff', t);
const darker = (c: string, t: number) => mix(c, '#232a5c', t);

type WallId = 'back' | Side;
/** A point on a wall: u runs along it (X on the back wall, depth on a side wall), y is the height. */
const on = (w: WallId) => (u: number, y: number): V => (w === 'back' ? project(u, y, 0) : project(w === 'left' ? 0 : RW, y, u));
const lengthOf = (w: WallId) => (w === 'back' ? RW : ZS);
const quad = (m: (u: number, y: number) => V, u0: number, u1: number, y0: number, y1: number) => shut(m(u0, y0), m(u1, y0), m(u1, y1), m(u0, y1));

/** Which side wall has the window. A recipe that says "centre" (first style) gets a side from its own name, always the same one. */
export const windowSide = (look: RoomLook): Side => (look.window.side === 'left' || look.window.side === 'right' ? look.window.side : hash(`${look.palette}${look.layout}${look.window.style}`) % 2 ? 'left' : 'right');
const other = (s: Side): Side => (s === 'left' ? 'right' : 'left');
/** Which side wall the furniture stands along: at home the layout says it; in a clinic it stands under the chart, across from the window. */
export const furnitureSide = (look: RoomLook, role: RoomRole): Side => (role === 'home' ? (/-right$/.test(look.layout) ? 'right' : 'left') : other(windowSide(look)));

// ------------------------------------------------------------------ the window, on a side wall
/** The window's outline on its wall, as points (depth, height). */
const windowShape = (style: RoomLook['window']['style']): V[] => {
  if (style === 'wide') return [[110, 700], [430, 700], [430, 985], [110, 985]];
  if (style === 'round') return Array.from({length: 32}).map((_, i) => { const a = (i / 32) * Math.PI * 2; return [280 + Math.cos(a) * 150, 840 + Math.sin(a) * 150] as V; });
  if (style === 'arch') return [[160, 640], [410, 640], [410, 890], ...Array.from({length: 13}).map((_, i) => { const a = (i / 12) * Math.PI; return [285 + Math.cos(a) * 125, 890 + Math.sin(a) * 115] as V; }), [160, 890]];
  return [[170, 640], [400, 640], [400, 1005], [170, 1005]];
};
const SKIES = {day: ['#8fcdfb', '#dff3ff'], evening: ['#ff9d6c', '#ffe0a8'], night: ['#1b2350', '#3a3f7a']};
const Window: React.FC<{look: RoomLook; side: Side; pal: (typeof ROOM_PALS)[keyof typeof ROOM_PALS]; uid: string}> = ({look, side, pal, uid}) => {
  const shape = windowShape(look.window.style);
  const X = side === 'left' ? 0 : RW;
  const out = side === 'left' ? -20 : 20; // the glass sits this far out, in the thickness of the wall
  const wall = shape.map(([z, y]) => project(X, y, z));
  const glass = shape.map(([z, y]) => project(X + out, y, z));
  const zs = shape.map((p) => p[0]);
  const ys = shape.map((p) => p[1]);
  const [z0, z1, y0, y1] = [Math.min(...zs), Math.max(...zs), Math.min(...ys), Math.max(...ys)];
  const g = (z: number, y: number) => project(X + out, y, z);
  const night = look.time === 'night' || look.window.view === 'night';
  const sky = SKIES[night ? 'night' : look.time === 'evening' ? 'evening' : 'day'];
  const top = Math.min(...glass.map((p) => p[1]));
  const bottom = Math.max(...glass.map((p) => p[1]));
  const ground = look.window.view === 'city' ? '#aab4d6' : look.window.view === 'hills' ? '#9bd18a' : '#7fc97a';
  const sun = g(z0 + (z1 - z0) * 0.62, y0 + (y1 - y0) * 0.72);
  return (
    <g>
      <defs>
        <clipPath id={`wo${uid}`}><path d={shut(...wall)} /></clipPath>
        <linearGradient id={`ws${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={bottom}><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
      </defs>
      {/* the opening shows the thickness of the wall along its far edge and its top */}
      <path d={shut(...wall)} fill={darker(pal.wall, 0.42)} />
      <g clipPath={`url(#wo${uid})`}>
        <path d={shut(...glass)} fill={`url(#ws${uid})`} />
        <g clipPath={`url(#wo${uid})`}>
          {!night && <path d={shut(g(z0, y0), g(z1, y0), g(z1, y0 + (y1 - y0) * 0.3), g((z0 + z1) / 2, y0 + (y1 - y0) * 0.4), g(z0, y0 + (y1 - y0) * 0.26))} fill={ground} opacity={look.time === 'evening' ? 0.75 : 1} />}
          {night ? (
            <>
              <circle cx={sun[0]} cy={sun[1]} r={26} fill="#f6f0d2" />
              <circle cx={sun[0] + 11} cy={sun[1] - 7} r={23} fill={sky[0]} />
              {[[0.2, 0.86], [0.42, 0.6], [0.8, 0.9], [0.3, 0.44], [0.72, 0.5]].map(([a, b], i) => { const p = g(z0 + (z1 - z0) * a, y0 + (y1 - y0) * b); return <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="#ffffff" opacity={0.85} />; })}
            </>
          ) : (
            <circle cx={sun[0]} cy={sun[1]} r={30} fill={look.time === 'evening' ? '#ffd27a' : '#fff6c9'} opacity={0.9} />
          )}
          {/* a shine across the glass */}
          <path d={shut(g(z0 + (z1 - z0) * 0.12, y1), g(z0 + (z1 - z0) * 0.3, y1), g(z0 + (z1 - z0) * 0.08, y0 + (y1 - y0) * 0.45), g(z0, y0 + (y1 - y0) * 0.62))} fill="#ffffff" opacity={0.16} />
        </g>
        {/* bars */}
        {[open([g((z0 + z1) / 2, y0), g((z0 + z1) / 2, y1)]), open([g(z0, (y0 + y1) / 2), g(z1, (y0 + y1) / 2)])].map((d, i) => (
          <g key={i}><path d={d} stroke={LINE} strokeWidth={7 + LW * 1.4} /><path d={d} stroke={pal.trim} strokeWidth={7} /></g>
        ))}
      </g>
      <path d={shut(...wall)} fill="none" stroke={LINE} strokeWidth={14 + LW * 2} strokeLinejoin="round" />
      <path d={shut(...wall)} fill="none" stroke={pal.trim} strokeWidth={14} strokeLinejoin="round" />
      {/* the sill, coming into the room */}
      {look.window.style !== 'round' && (() => {
        const inn = side === 'left' ? 34 : -34;
        const a = project(X, y0 - 14, z0 - 22);
        const b = project(X, y0 - 14, z1 + 22);
        const c = project(X + inn, y0 - 14, z1 + 22);
        const e = project(X + inn, y0 - 14, z0 - 22);
        const c2 = project(X + inn, y0 - 36, z1 + 22);
        const b2 = project(X, y0 - 36, z1 + 22);
        const e2 = project(X + inn, y0 - 36, z0 - 22);
        return <g><path d={shut(e, c, c2, e2)} fill={darker(pal.trim, 0.1)} {...O} /><path d={shut(b, c, c2, b2)} fill={darker(pal.trim, 0.18)} {...O} /><path d={shut(a, b, c, e)} fill={pal.trim} {...O} /></g>;
      })()}
    </g>
  );
};

// ------------------------------------------------------------------ the clinic's chart, on the other side wall
const SideChart: React.FC<{kind: NonNullable<RoomLook['chart']>; side: Side; accent: string}> = ({kind, side, accent}) => {
  const m = on(side);
  const [z0, z1, y0, y1] = [150, 430, 640, 1010];
  const c = m((z0 + z1) / 2, 810);
  const dz = m((z0 + z1) / 2 + 1, 810);
  const dy = m((z0 + z1) / 2, 809);
  const dir = side === 'left' ? -1 : 1; // keep the drawing the right way round on either wall
  const s = 1.05;
  return (
    <g>
      <path d={quad(m, z0 + 8, z1 + 8, y0 - 12, y1 - 12)} fill="#1d2b4f" opacity={0.16} />
      <path d={quad(m, z0, z1, y0, y1)} fill="#ffffff" {...O} />
      <path d={quad(m, z0 + 16, z1 - 16, y1 - 52, y1 - 16)} fill={accent} />
      <g transform={`matrix(${((dz[0] - c[0]) * dir * s).toFixed(3)} ${((dz[1] - c[1]) * dir * s).toFixed(3)} ${((dy[0] - c[0]) * s).toFixed(3)} ${((dy[1] - c[1]) * s).toFixed(3)} ${f1(c[0])} ${f1(c[1])})`}><ChartIcon kind={kind} /></g>
      {[[y0 + 30, 0.8], [y0 + 52, 0.55]].map(([y, k], i) => <path key={i} d={quad(m, z0 + 30, z0 + 30 + (z1 - z0 - 60) * k, y, y + 10)} fill="#c8d6e5" />)}
    </g>
  );
};

// ------------------------------------------------------------------ furniture: boxes
type Face = (u: number, v: number) => V;
/**
 * A box standing in the room. It shows its front, the side that faces the middle of the room, and
 * its top when that is below eye level. `deco` draws on those faces (u, v from 0 to 1: across and up;
 * on the top: across and toward the viewer).
 */
const Box3: React.FC<{x: number; y?: number; z: number; w: number; h: number; d: number; fill: string; shadow?: boolean; deco?: (f: {side: Face; front: Face; top: Face}) => React.ReactNode}> = ({x, y = 0, z, w, h, d, fill, shadow = false, deco}) => {
  const left = x + w / 2 < RW / 2; // it stands left of the middle: we see its right side
  const xs = left ? x + w : x;
  const side: Face = (u, v) => project(xs, y + v * h, z + u * d);
  const front: Face = (u, v) => project(x + u * w, y + v * h, z + d);
  const top: Face = (u, v) => project(x + u * w, y + h, z + v * d);
  const face = (f: Face) => shut(f(0, 0), f(1, 0), f(1, 1), f(0, 1));
  const g = left ? 1 : -1;
  return (
    <g>
      {shadow && <path d={shut(project(xs, 0, z), project(xs + g * 30, 0, z + 12), project(xs + g * 30, 0, z + d + 30), project(left ? x : x + w, 0, z + d + 30), project(left ? x : x + w, 0, z + d), project(xs, 0, z + d))} fill="#1d2b4f" opacity={0.16} />}
      {y + h < EYE && <path d={face(top)} fill={lighter(fill, 0.3)} {...O} />}
      <path d={face(side)} fill={darker(fill, 0.1)} {...O} />
      <path d={face(front)} fill={fill} {...O} />
      {deco?.({side, front, top})}
    </g>
  );
};
const rect = (f: Face, u0: number, u1: number, v0: number, v1: number) => shut(f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1));

const Furniture3: React.FC<{look: RoomLook; role: RoomRole; pal: (typeof ROOM_PALS)[keyof typeof ROOM_PALS]; bare?: boolean}> = ({look, role, pal, bare = false}) => {
  const kind = roomKind(role, look);
  const f = furnitureSide(look, role);
  /** x of a piece `w` wide standing `gap` from the furniture wall */
  const at = (w: number, gap = 0, s: Side = f) => (s === 'left' ? gap : RW - w - gap);
  const thin = {stroke: LINE, strokeWidth: LW * 0.75, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const doors = (n: number) => ({side}: {side: Face}) => (
    <g>
      {Array.from({length: n}).map((_, i) => { const u0 = 0.05 + (i * 0.9) / n; const u1 = u0 + 0.9 / n - 0.03; return <g key={i}><path d={rect(side, u0, u1, 0.08, 0.9)} {...thin} /><path d={open([side(i % 2 ? u0 + 0.05 : u1 - 0.05, 0.5), side(i % 2 ? u0 + 0.05 : u1 - 0.05, 0.64)])} stroke={pal.accent} strokeWidth={5} strokeLinecap="round" /></g>; })}
    </g>
  );
  const wood = '#c79a63';
  // A clinic has two people, one near each side wall: its furniture is one LOW piece in the middle
  // of the back wall, between them, and never taller than the rail.
  const mid = (w: number) => RW / 2 - w / 2;
  const frontDoors = (n: number) => ({front}: {front: Face}) => (
    <g>
      {Array.from({length: n}).map((_, i) => { const u0 = 0.05 + (i * 0.9) / n; const u1 = u0 + 0.9 / n - 0.03; const hx = i % 2 ? u0 + 0.06 : u1 - 0.06; return <g key={i}><path d={rect(front, u0, u1, 0.08, 0.9)} {...thin} /><path d={open([front(hx, 0.5), front(hx, 0.64)])} stroke={pal.accent} strokeWidth={5} strokeLinecap="round" /></g>; })}
    </g>
  );
  if (kind === 'clinic' && bare) return null;
  if (kind === 'clinic' && look.layout === 'exam-bed') {
    return (
      <g>
        <Box3 x={mid(190)} z={10} w={190} h={150} d={300} fill={darker(pal.trim, 0.08)} shadow deco={({front}) => <path d={rect(front, 0.08, 0.92, 0.14, 0.8)} {...thin} />} />
        <Box3 x={mid(198)} y={150} z={6} w={198} h={44} d={308} fill={pal.accent} />
        <Box3 x={mid(140)} y={194} z={20} w={140} h={26} d={80} fill="#ffffff" />
      </g>
    );
  }
  if (kind === 'clinic' && look.layout === 'shelves') {
    const cols = [pal.accent, '#ffc93c', pal.rug, '#ea4a55', '#7a63d1'];
    return (
      <Box3 x={mid(250)} z={0} w={250} h={300} d={90} fill={pal.trim} shadow deco={({front}) => (
        <g>
          {[0.36, 0.68].map((v) => <path key={v} d={open([front(0.03, v), front(0.97, v)])} {...thin} />)}
          {[0.05, 0.4, 0.72].map((v0, r) => Array.from({length: 8}).map((_, i) => { const u0 = 0.06 + i * 0.105 + (r % 2) * 0.02; const hh = 0.19 + ((hash(`${look.palette}${r}${i}`) % 7) / 100); return i === 5 + (r % 2) ? null : <path key={`${r}${i}`} d={rect(front, u0, u0 + 0.085, v0, v0 + hh)} fill={cols[(i + r * 2) % 5]} stroke={LINE} strokeWidth={LW * 0.6} />; }))}
        </g>
      )} />
    );
  }
  if (kind === 'clinic' && look.layout === 'desk') {
    return (
      <g>
        <Box3 x={mid(260) + 4} z={30} w={16} h={220} d={150} fill={darker(wood, 0.1)} shadow />
        <Box3 x={mid(260) + 240} z={30} w={16} h={220} d={150} fill={darker(wood, 0.1)} shadow />
        <Box3 x={mid(270)} y={220} z={20} w={270} h={18} d={172} fill={wood} />
        <Box3 x={mid(24)} y={238} z={70} w={24} h={22} d={20} fill="#8f9bb8" />
        <Box3 x={mid(124)} y={258} z={72} w={124} h={72} d={12} fill="#3a4460" deco={({front}) => (
          <g><path d={rect(front, 0.06, 0.94, 0.1, 0.9)} fill="#bfe6ff" /><path d={open([front(0.14, 0.45), front(0.34, 0.45), front(0.44, 0.72), front(0.56, 0.22), front(0.66, 0.45), front(0.86, 0.45)])} fill="none" stroke={pal.accent} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" /></g>
        )} />
      </g>
    );
  }
  if (kind === 'clinic') {
    // 'cabinet': a low cupboard with a worktop
    return (
      <g>
        <Box3 x={mid(230)} z={0} w={230} h={270} d={140} fill={pal.trim} shadow deco={frontDoors(2)} />
        <Box3 x={mid(242)} y={270} z={0} w={242} h={16} d={150} fill={darker(pal.wall2, 0.2)} />
      </g>
    );
  }
  if (kind === 'kitchen') {
    return (
      <g>
        <Box3 x={at(150)} z={0} w={150} h={290} d={470} fill={pal.trim} shadow deco={doors(3)} />
        <Box3 x={at(160)} y={290} z={0} w={160} h={16} d={478} fill={darker(pal.floor2, 0.12)} deco={({top}) => <path d={rect(top, 0.14, 0.86, 0.36, 0.7)} fill="#3a4460" />} />
        <Box3 x={at(74, 42)} y={306} z={210} w={74} h={44} d={74} fill="#d6453f" deco={({side}) => <path d={open([side(0, 1), side(1, 1)])} stroke="#8c2a2a" strokeWidth={6} strokeLinecap="round" />} />
      </g>
    );
  }
  if (kind === 'bathroom') {
    const o = other(f);
    return (
      <g>
        <Box3 x={at(60, 34)} z={170} w={60} h={232} d={60} fill="#ffffff" shadow />
        <Box3 x={at(132)} y={232} z={124} w={132} h={48} d={150} fill="#ffffff" deco={({top}) => <path d={rect(top, 0.2, 0.86, 0.2, 0.8)} fill="#d8ecf8" stroke={LINE} strokeWidth={LW * 0.6} />} />
        <Box3 x={at(196, 0, o)} z={60} w={196} h={184} d={410} fill="#ffffff" shadow deco={({top, side}) => <g><path d={rect(top, 0.12, 0.88, 0.07, 0.93)} fill="#d8ecf8" stroke={LINE} strokeWidth={LW * 0.6} /><path d={open([side(0.02, 0.86), side(0.98, 0.86)])} {...thin} /></g>} />
      </g>
    );
  }
  if (kind === 'living') {
    return (
      <g>
        <Box3 x={at(56)} z={60} w={56} h={292} d={390} fill={darker(pal.rug, 0.1)} shadow />
        <Box3 x={at(196)} z={40} w={196} h={200} d={30} fill={darker(pal.rug, 0.18)} shadow />
        <Box3 x={at(196)} z={70} w={196} h={136} d={370} fill={pal.rug} deco={({top}) => <path d={open([top(0.3, 0.5), top(1, 0.5)])} {...thin} />} />
        <Box3 x={at(196)} z={440} w={196} h={200} d={30} fill={darker(pal.rug, 0.18)} shadow />
      </g>
    );
  }
  // bedroom: a bed along the wall, its head at the back wall
  return (
    <g>
      <Box3 x={at(224)} z={0} w={224} h={300} d={16} fill={darker(wood, 0.08)} />
      <Box3 x={at(224)} z={16} w={224} h={108} d={452} fill={wood} shadow />
      <Box3 x={at(224)} y={108} z={16} w={224} h={46} d={452} fill="#f4f1e8" />
      <Box3 x={at(150, 36)} y={154} z={30} w={150} h={30} d={100} fill="#ffffff" />
      <Box3 x={at(232, -4)} y={108} z={190} w={232} h={56} d={284} fill={pal.rug} deco={({top}) => <path d={open([top(0, 0.12), top(1, 0.12)])} stroke="#ffffff" strokeWidth={6} opacity={0.5} />} />
    </g>
  );
};

// ------------------------------------------------------------------ the pattern of a wall, below the rail
const LowerWall: React.FC<{w: WallId; look: RoomLook; pal: (typeof ROOM_PALS)[keyof typeof ROOM_PALS]; tone: (c: string) => string}> = ({w, look, pal, tone}) => {
  const m = on(w);
  const L = lengthOf(w);
  const plain = look.wall === 'stripes' || look.wall === 'dots';
  const step = 70;
  const n = Math.ceil(L / step);
  return (
    <g>
      <path d={quad(m, 0, L, 0, RAIL)} fill={tone(plain ? pal.wall : look.wall === 'tiles' ? pal.soft : pal.wall2)} />
      {look.wall === 'wainscot' && Array.from({length: Math.ceil(L / 140)}).map((_, i) => <path key={i} d={quad(m, 22 + i * 140, Math.min(L, 118 + i * 140), 56, RAIL - 46)} fill="none" stroke={tone(pal.line)} strokeWidth={4.5} strokeLinejoin="round" />)}
      {look.wall === 'tiles' && (
        <g stroke={tone(pal.line)} strokeWidth={3.4} fill="none">
          {Array.from({length: n + 1}).map((_, i) => <path key={i} d={open([m(Math.min(L, i * step), 0), m(Math.min(L, i * step), RAIL)])} />)}
          {[82, 165, 248].map((y) => <path key={y} d={open([m(0, y), m(L, y)])} />)}
        </g>
      )}
      {look.wall === 'stripes' && Array.from({length: n}).map((_, i) => (i % 2 ? null : <path key={i} d={quad(m, i * step, Math.min(L, (i + 1) * step), 0, RAIL)} fill={tone(pal.line)} opacity={0.8} />))}
      {look.wall === 'dots' && Array.from({length: n}).flatMap((_, i) => [70, 165, 260].map((y, r) => { const u = i * step + 35 + (r % 2) * 35; if (u > L - 12) return null; const c = m(u, y); const e = m(u + 11, y); const t = m(u, y + 11); return <ellipse key={`${i}${r}`} cx={c[0]} cy={c[1]} rx={Math.abs(e[0] - c[0])} ry={Math.abs(t[1] - c[1])} fill={tone(pal.line)} />; }))}
    </g>
  );
};

// ------------------------------------------------------------------ the room
/** One room in the second style, built from the same recipe as before. `role` = clinic or home. */
export const Room3D: React.FC<{look: RoomLook; role: RoomRole; t: number; bare?: boolean}> = ({look, role, bare = false}) => {
  const uid = useId().replace(/:/g, '');
  const pal = ROOM_PALS[look.palette] ?? ROOM_PALS.mint;
  const kind = roomKind(role, look);
  const time = look.time ?? 'day';
  const ws = windowSide(look);
  const lit = other(ws); // the wall across from the window takes its light; the window's own wall is in shade
  const toneOf = (w: WallId) => (c: string) => (w === 'back' ? c : w === lit ? lighter(c, 0.16) : darker(c, 0.14));
  const corner = (w: WallId) => (w === 'left' ? BOX.x0 : BOX.x1);
  const seed = `${kind}${look.palette}${look.layout}${look.window.style}`;
  const boards = Math.round(RW / 70);
  return (
    <AbsoluteFill style={{background: lighter(pal.wall, 0.5)}}>
      <Layer p={1}>
        <Canvas>
          <defs>
            <linearGradient id={`bw${uid}`} x1={ws === 'left' ? '0' : '1'} y1="0" x2={ws === 'left' ? '1' : '0'} y2="0"><stop offset="0" stopColor={darker(pal.wall, 0.05)} /><stop offset="0.5" stopColor={pal.wall} /><stop offset="1" stopColor={lighter(pal.wall, 0.12)} /></linearGradient>
            <linearGradient id={`fl${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1={BOX.floor} x2="0" y2={1920}><stop offset="0" stopColor={pal.floor} /><stop offset="1" stopColor={pal.floor2} /></linearGradient>
            <linearGradient id={`cl${uid}`} gradientUnits="userSpaceOnUse" x1={BOX.x0} y1="0" x2={BOX.x0 + 70} y2="0"><stop offset="0" stopColor="#1d2b4f" stopOpacity="0.16" /><stop offset="1" stopColor="#1d2b4f" stopOpacity="0" /></linearGradient>
            <linearGradient id={`cr${uid}`} gradientUnits="userSpaceOnUse" x1={BOX.x1} y1="0" x2={BOX.x1 - 70} y2="0"><stop offset="0" stopColor="#1d2b4f" stopOpacity="0.16" /><stop offset="1" stopColor="#1d2b4f" stopOpacity="0" /></linearGradient>
            <linearGradient id={`sl${uid}`} gradientUnits="userSpaceOnUse" x1={BOX.x0} y1="0" x2={BOX.x0 - 90} y2="0"><stop offset="0" stopColor="#1d2b4f" stopOpacity="0.2" /><stop offset="1" stopColor="#1d2b4f" stopOpacity="0" /></linearGradient>
            <linearGradient id={`sr${uid}`} gradientUnits="userSpaceOnUse" x1={BOX.x1} y1="0" x2={BOX.x1 + 90} y2="0"><stop offset="0" stopColor="#1d2b4f" stopOpacity="0.2" /><stop offset="1" stopColor="#1d2b4f" stopOpacity="0" /></linearGradient>
            <linearGradient id={`fa${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1={BOX.floor} x2="0" y2={BOX.floor + 70}><stop offset="0" stopColor="#1d2b4f" stopOpacity="0.22" /><stop offset="1" stopColor="#1d2b4f" stopOpacity="0" /></linearGradient>
          </defs>
          {/* the ceiling */}
          <path d={shut(project(0, RH, 0), project(RW, RH, 0), project(RW, RH, ZS), project(0, RH, ZS))} fill={lighter(pal.wall, 0.55)} {...O} />
          {/* the back wall: plain above the rail (the pop-up area) */}
          <path d={quad(on('back'), 0, RW, RAIL, RH)} fill={`url(#bw${uid})`} />
          <LowerWall w="back" look={look} pal={pal} tone={toneOf('back')} />
          {/* the side walls */}
          {(['left', 'right'] as Side[]).map((w) => (
            <g key={w}>
              <path d={quad(on(w), 0, ZS, RAIL, RH)} fill={toneOf(w)(pal.wall)} />
              <LowerWall w={w} look={look} pal={pal} tone={toneOf(w)} />
              <path d={quad(on(w), 0, ZS, 0, RH)} fill={`url(#s${w === 'left' ? 'l' : 'r'}${uid})`} />
            </g>
          ))}
          <path d={quad(on('back'), 0, 70, 0, RH)} fill={`url(#cl${uid})`} />
          <path d={quad(on('back'), RW - 70, RW, 0, RH)} fill={`url(#cr${uid})`} />
          {/* rail, cornice and skirting run round the three walls */}
          {(['left', 'right', 'back'] as WallId[]).map((w) => (
            <g key={w}>
              <path d={quad(on(w), 0, lengthOf(w), RAIL, RAIL + 16)} fill={toneOf(w)(pal.trim)} {...O} />
              <path d={quad(on(w), 0, lengthOf(w), RH - 24, RH)} fill={toneOf(w)(pal.trim)} {...O} />
              <path d={quad(on(w), 0, lengthOf(w), 0, 30)} fill={toneOf(w)(pal.trim)} {...O} />
            </g>
          ))}
          {/* the corners */}
          {(['left', 'right'] as Side[]).map((w) => <path key={w} d={`M${corner(w)} ${BOX.top} V${BOX.floor}`} stroke={LINE} strokeWidth={LW} opacity={0.7} />)}
          <Window look={look} side={ws} pal={pal} uid={uid} />
          {kind === 'clinic' && <SideChart kind={look.chart ?? 'body'} side={lit} accent={pal.accent} />}
          {/* the floor, its lines running to the same point as the walls */}
          <path d={shut(project(0, 0, 0), project(RW, 0, 0), project(RW, 0, ZF), project(0, 0, ZF))} fill={`url(#fl${uid})`} />
          {look.floor === 'wood' && (
            <g stroke={pal.floor2} strokeWidth={3} opacity={0.6}>
              {Array.from({length: boards + 1}).map((_, i) => <path key={i} d={open([project((i * RW) / boards, 0, 0), project((i * RW) / boards, 0, ZF)])} />)}
              {Array.from({length: boards}).flatMap((_, i) => [0, 1, 2].map((j) => { const z = 60 + ((hash(`${seed}${i}${j}`) % 100) / 100) * 120 + j * 300; return <path key={`${i}${j}`} d={open([project((i * RW) / boards, 0, z), project(((i + 1) * RW) / boards, 0, z)])} />; }))}
            </g>
          )}
          {look.floor === 'checker' && Array.from({length: 7}).flatMap((_, i) => Array.from({length: 10}).map((__, j) => ((i + j) % 2 ? null : <path key={`${i}${j}`} d={shut(project(i * 100, 0, j * 100), project((i + 1) * 100, 0, j * 100), project((i + 1) * 100, 0, (j + 1) * 100), project(i * 100, 0, (j + 1) * 100))} fill={pal.floor2} opacity={0.5} />)))}
          {look.floor === 'carpet' && Array.from({length: 70}).map((_, i) => { const c = project(random(`cx${i}`) * RW, 0, 20 + random(`cz${i}`) * 820); return <circle key={i} cx={c[0]} cy={c[1]} r={3 + random(`cr${i}`) * 3} fill={pal.floor2} opacity={0.4} />; })}
          <path d={shut(project(0, 0, 0), project(RW, 0, 0), project(RW, 0, 80), project(0, 0, 80))} fill={`url(#fa${uid})`} />
          {/* the window's light on the floor */}
          {(() => { const a = ws === 'left' ? 70 : RW - 70; const b = ws === 'left' ? 400 : RW - 400; return <path d={shut(project(a, 0, 150), project(b, 0, 200), project(b, 0, 520), project(a, 0, 470))} fill={time === 'night' ? '#cfd8ff' : time === 'evening' ? '#ffb37a' : '#fff6dc'} opacity={time === 'night' ? 0.1 : 0.2} />; })()}
          <Furniture3 look={look} role={role} pal={pal} bare={bare} />
        </Canvas>
        {/* the time of day colours everything */}
        <AbsoluteFill style={{background: time === 'night' ? 'linear-gradient(#1a2452 0%, #232a5c 100%)' : time === 'evening' ? 'linear-gradient(#ff9d6c 0%, rgba(255,157,108,0) 70%)' : `radial-gradient(ellipse at ${ws === 'left' ? 12 : 88}% 24%, #fff6dc 0%, rgba(255,246,220,0) 62%)`, opacity: time === 'night' ? 0.36 : 0.2, mixBlendMode: time === 'night' ? 'multiply' : 'normal'}} />
      </Layer>
    </AbsoluteFill>
  );
};
