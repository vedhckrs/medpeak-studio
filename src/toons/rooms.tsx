// MedPeak Toons ROOM KIT: every video gets its own clinic and its own home (owner, 2026-11-16:
// "each video a different background of clinic and a different background of home, unique").
// A room is BUILT from a recipe in the script (director.ts: RoomLook): a colour scheme, a wall
// treatment, a floor, a window (shape, side, view), a furniture layout, a wall chart, a time of day.
// 100% code-drawn. To grow the kit: add a palette, a view, a window or a layout here and its name
// to the lists in director.ts; every script can use it at once.
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, H, Layer, W} from './camera';
import {roomKind, type RoomLook, type RoomRole} from './director';
import {blob, taperedPath} from './ink';
import {STYLE} from './style';

const LINE = STYLE.roomLine;
const LW = STYLE.setLinePx;
const O = {stroke: LINE, strokeWidth: LW, strokeLinejoin: 'round' as const};
const wrap = (v: number, m: number) => ((v % m) + m) % m;
const hash = (s: string) => Math.floor(random(s) * 1000);
const FLOOR_TOP = 1340; // where the wall meets the floor
/** The floor line the characters stand on, in every built room. */
export const ROOM_FLOOR = 1500;

// ------------------------------------------------------------------ colour schemes
type Pal = {wall: string; wall2: string; line: string; trim: string; floor: string; floor2: string; accent: string; rug: string; soft: string};
export const ROOM_PALS: Record<RoomLook['palette'], Pal> = {
  mint: {wall: '#cdf1e8', wall2: '#a6dccf', line: '#b9e5da', trim: '#f6f1e7', floor: '#e4c193', floor2: '#c99e6c', accent: '#2ec4b6', rug: '#2ec4b6', soft: '#e9fffb'},
  sky: {wall: '#d8ecfb', wall2: '#b3d4f0', line: '#c3def5', trim: '#ffffff', floor: '#e3e7ee', floor2: '#bfc8d6', accent: '#3f8fd6', rug: '#3f8fd6', soft: '#eef7ff'},
  peach: {wall: '#ffe8d9', wall2: '#fbcbb0', line: '#fdd9c4', trim: '#fff8ee', floor: '#dcb88e', floor2: '#b98d60', accent: '#ef7d57', rug: '#ef7d57', soft: '#fff3ea'},
  lavender: {wall: '#ebe5fb', wall2: '#cdc2f0', line: '#dbd2f6', trim: '#fbf8ff', floor: '#e2d5c4', floor2: '#bfae96', accent: '#7a63d1', rug: '#7a63d1', soft: '#f5f1ff'},
  butter: {wall: '#fff4cf', wall2: '#f6de96', line: '#fbeab2', trim: '#fffdf2', floor: '#cfa57a', floor2: '#a97f55', accent: '#e0a021', rug: '#2ec4b6', soft: '#fffbe8'},
  sage: {wall: '#e1ecd9', wall2: '#bfd2b0', line: '#d0e0c5', trim: '#f8f6ec', floor: '#d8c3a1', floor2: '#b79d77', accent: '#5c9a54', rug: '#5c9a54', soft: '#f1f8ec'},
  blush: {wall: '#fde5ea', wall2: '#f5bfca', line: '#f9d2da', trim: '#fff7f9', floor: '#e3d6c8', floor2: '#c2b19f', accent: '#d9567a', rug: '#d9567a', soft: '#fff1f4'},
  stone: {wall: '#eaedf0', wall2: '#cad1d9', line: '#dadfe5', trim: '#ffffff', floor: '#bcc7cf', floor2: '#97a5b0', accent: '#2ec4b6', rug: '#ffc93c', soft: '#f6f8fa'},
  nightblue: {wall: '#4a5796', wall2: '#333e74', line: '#5564a6', trim: '#e8e2f0', floor: '#75648a', floor2: '#54476b', accent: '#ffc857', rug: '#8a6fd1', soft: '#c9cdf0'},
  cream: {wall: '#fff2de', wall2: '#f2d8b3', line: '#f8e5c8', trim: '#ffffff', floor: '#c99b6b', floor2: '#a67a4c', accent: '#e2574c', rug: '#e2574c', soft: '#fff8ec'},
  terracotta: {wall: '#f8d5c3', wall2: '#e8ac90', line: '#f0c1aa', trim: '#fff5ec', floor: '#b5835a', floor2: '#8f6341', accent: '#2a9d8f', rug: '#2a9d8f', soft: '#fde9df'},
  forest: {wall: '#d7e8d5', wall2: '#abcba8', line: '#c2dabf', trim: '#f6f3e6', floor: '#b08a5e', floor2: '#8a693f', accent: '#f2a541', rug: '#f2a541', soft: '#eaf5e8'},
  lilac: {wall: '#eee4f8', wall2: '#cfbceb', line: '#dfd0f2', trim: '#fdfaff', floor: '#d9c7ae', floor2: '#b7a285', accent: '#ff8fab', rug: '#ff8fab', soft: '#f8f1fd'},
  sunny: {wall: '#fff7bd', wall2: '#fbe37e', line: '#fdee9e', trim: '#fffef2', floor: '#d8b98f', floor2: '#b89466', accent: '#3fa7d6', rug: '#3fa7d6', soft: '#fffbdc'},
  slate: {wall: '#dae0e8', wall2: '#b0bbc9', line: '#c6cfda', trim: '#f7f9fb', floor: '#909caa', floor2: '#707c8c', accent: '#ff7f50', rug: '#ff7f50', soft: '#eef1f5'},
  rose: {wall: '#ffe3e8', wall2: '#f7bcc7', line: '#fbd0d8', trim: '#fff8fa', floor: '#caa98a', floor2: '#a68565', accent: '#6c8ee8', rug: '#6c8ee8', soft: '#fff0f3'},
};

// ------------------------------------------------------------------ the window
const WIN_X = {left: 262, centre: 540, right: 818};
type Win = {d: string; cx: number; cy: number; box: [number, number, number, number]; bars: string; sill: [number, number, number] | null};
const windowOf = (look: RoomLook): Win => {
  const cx = WIN_X[look.window.side];
  switch (look.window.style) {
    case 'wide': { const [x, y, w, h] = [cx - 220, 250, 440, 330]; return {d: `M${x} ${y} H${x + w} V${y + h} H${x} Z`, cx, cy: y + h / 2, box: [x, y, w, h], bars: `M${x + w / 3} ${y} V${y + h} M${x + (2 * w) / 3} ${y} V${y + h}`, sill: [x - 26, y + h + 16, w + 52]}; }
    case 'arch': { const [x, y, w, h] = [cx - 160, 180, 320, 500]; return {d: `M${x} ${y + 160} A160 160 0 0 1 ${x + w} ${y + 160} V${y + h} H${x} Z`, cx, cy: y + h / 2, box: [x, y, w, h], bars: `M${cx} ${y} V${y + h} M${x} ${y + 160} H${x + w}`, sill: [x - 26, y + h + 16, w + 52]}; }
    case 'round': { const r = 180; const cy = 420; return {d: `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`, cx, cy, box: [cx - r, cy - r, r * 2, r * 2], bars: `M${cx} ${cy - r} V${cy + r} M${cx - r} ${cy} H${cx + r}`, sill: null}; }
    default: { const [x, y, w, h] = [cx - 170, 200, 340, 480]; return {d: `M${x} ${y} H${x + w} V${y + h} H${x} Z`, cx, cy: y + h / 2, box: [x, y, w, h], bars: `M${cx} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`, sill: [x - 26, y + h + 16, w + 52]}; }
  }
};

const Cloud: React.FC<{x: number; y: number; s: number; o?: number}> = ({x, y, s, o = 0.95}) => (
  <g transform={`translate(${x.toFixed(1)} ${y}) scale(${s})`} opacity={o}>
    <path d="M-70 20 C-96 20 -96 -14 -66 -16 C-64 -48 -14 -56 0 -28 C22 -50 66 -34 60 -6 C88 -6 88 20 62 20 Z" fill="#ffffff" />
  </g>
);
/** What is outside: seen through the window only. */
const View: React.FC<{look: RoomLook; win: Win; t: number; uid: string}> = ({look, win, t, uid}) => {
  const [x, y, w, h] = win.box;
  const night = look.time === 'night' || look.window.view === 'night';
  const eve = look.time === 'evening' && !night;
  const sky = night ? ['#1b2350', '#3a3f7a'] : eve ? ['#ff9d6c', '#ffe0a8'] : ['#9fd6ff', '#e4f5ff'];
  const drift = (i: number, sp: number) => x - 140 + wrap(i * 190 + t * sp, w + 280);
  const view = night ? 'night' : look.window.view;
  return (
    <g>
      <defs><linearGradient id={`rv${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
      <rect x={x - 80} y={y - 80} width={w + 160} height={h + 160} fill={`url(#rv${uid})`} />
      {view === 'night' && (
        <g>
          {Array.from({length: 16}).map((_, i) => <circle key={i} cx={x + random(`rs${i}`) * w} cy={y + random(`rsy${i}`) * h * 0.8} r={2 + random(`rsr${i}`) * 3} fill="#fff8d6" opacity={0.5 + 0.5 * Math.sin(t * 2 + i * 1.9)} />)}
          <circle cx={x + w * 0.66} cy={y + h * 0.3} r={Math.min(w, h) * 0.15} fill="#fff3bf" />
          <circle cx={x + w * 0.66 + Math.min(w, h) * 0.07} cy={y + h * 0.3 - Math.min(w, h) * 0.04} r={Math.min(w, h) * 0.13} fill={sky[0]} />
          <Cloud x={drift(0, 9)} y={y + h * 0.5} s={1.1} o={0.3} />
        </g>
      )}
      {view === 'garden' && (
        <g>
          <Cloud x={drift(0, 12)} y={y + h * 0.22} s={1.1} o={eve ? 0.7 : 0.95} />
          <Cloud x={drift(2, 8)} y={y + h * 0.4} s={0.8} o={eve ? 0.5 : 0.8} />
          <path d={blob(w * 0.7, h * 0.3, 'rvh', 9, 0.1, x + w * 0.4, y + h * 1.02)} fill="#8fd08c" />
          <g transform={`rotate(${Math.sin(t * 0.8) * 1.6} ${x + w * 0.72} ${y + h})`}>
            <rect x={x + w * 0.7} y={y + h * 0.58} width={w * 0.05} height={h * 0.5} fill="#8a6a4a" />
            <path d={blob(w * 0.24, h * 0.24, 'rvt', 10, 0.12, x + w * 0.72, y + h * 0.52)} fill="#5fb56a" />
            <path d={blob(w * 0.14, h * 0.13, 'rvt2', 9, 0.12, x + w * 0.68, y + h * 0.46)} fill="#7fcf80" opacity={0.8} />
          </g>
        </g>
      )}
      {view === 'city' && (
        <g>
          <Cloud x={drift(1, 10)} y={y + h * 0.2} s={1} o={eve ? 0.6 : 0.9} />
          {[[0.02, 0.5, 0.16], [0.2, 0.34, 0.14], [0.36, 0.56, 0.2], [0.58, 0.28, 0.15], [0.75, 0.46, 0.14], [0.9, 0.6, 0.14]].map(([fx, fy, fw], i) => (
            <g key={i}>
              <rect x={x + fx * w} y={y + fy * h} width={fw * w} height={h} fill={i % 2 ? '#7f8fc4' : '#9aa7d6'} />
              {Array.from({length: 6}).map((__, j) => <rect key={j} x={x + fx * w + 10 + (j % 2) * (fw * w * 0.42)} y={y + fy * h + 16 + Math.floor(j / 2) * 44} width={fw * w * 0.26} height={22} fill={eve || random(`rw${i}${j}`) > 0.6 ? '#ffe08a' : '#dfe6fb'} opacity={0.9} />)}
            </g>
          ))}
        </g>
      )}
      {view === 'hills' && (
        <g>
          <circle cx={x + w * 0.28} cy={y + h * 0.3} r={Math.min(w, h) * 0.13} fill={eve ? '#ff7a59' : '#ffe08a'} />
          <circle cx={x + w * 0.28} cy={y + h * 0.3} r={Math.min(w, h) * 0.2} fill={eve ? '#ff7a59' : '#ffe08a'} opacity={0.25 + 0.06 * Math.sin(t * 1.3)} />
          <path d={`M${x - 60} ${y + h * 0.7} Q${x + w * 0.3} ${y + h * 0.42} ${x + w * 0.62} ${y + h * 0.66} T${x + w + 60} ${y + h * 0.56} V${y + h + 60} H${x - 60} Z`} fill="#a9d8b0" />
          <path d={`M${x - 60} ${y + h * 0.84} Q${x + w * 0.4} ${y + h * 0.62} ${x + w * 0.74} ${y + h * 0.8} T${x + w + 60} ${y + h * 0.74} V${y + h + 60} H${x - 60} Z`} fill="#7fc48c" />
          {[0, 1].map((i) => { const bx = drift(i * 2, 22 + i * 6); const by = y + h * (0.22 + i * 0.1) + Math.sin(t * 2 + i) * 6; return <path key={i} d={`M${bx - 16} ${by} Q${bx - 8} ${by - 10} ${bx} ${by} Q${bx + 8} ${by - 10} ${bx + 16} ${by}`} fill="none" stroke="#55608c" strokeWidth={3.4} strokeLinecap="round" />; })}
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ things on the wall
const Clock: React.FC<{x: number; y: number; r: number; t: number; rim: string}> = ({x, y, r, t, rim}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={6} cy={8} r={r} fill="#1d2b4f" opacity={0.16} />
    <circle r={r} fill="#ffffff" stroke={rim} strokeWidth={r * 0.14} />
    <circle r={r} fill="none" {...O} />
    {Array.from({length: 12}).map((_, i) => <path key={i} d={`M0 ${-r * 0.82} V${-r * (i % 3 === 0 ? 0.64 : 0.72)}`} stroke="#55608c" strokeWidth={i % 3 === 0 ? 4 : 2.4} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
    <path d={`M0 0 V${-r * 0.42}`} stroke="#2a2440" strokeWidth={6} strokeLinecap="round" transform="rotate(-58)" />
    <path d={`M0 0 V${-r * 0.66}`} stroke="#2a2440" strokeWidth={4.4} strokeLinecap="round" transform={`rotate(${(t * 6) % 360})`} />
    <path d={`M0 ${r * 0.14} V${-r * 0.7}`} stroke="#ea4a55" strokeWidth={2.2} strokeLinecap="round" transform={`rotate(${Math.floor(t) * 6})`} />
    <circle r={5} fill="#ea4a55" />
  </g>
);
/** The organ on a clinic chart, drawn around (0, 0) in a box of about 220 x 250 units. */
export const ChartIcon: React.FC<{kind: NonNullable<RoomLook['chart']>}> = ({kind}) => (
  <g>
      {kind === 'tooth' && (
        <g>
          <path d="M-70 -92 C-40 -112 -14 -98 0 -86 C14 -98 40 -112 70 -92 C96 -70 86 -14 70 26 C62 60 58 104 44 112 C26 118 20 60 0 60 C-20 60 -26 118 -44 112 C-58 104 -62 60 -70 26 C-86 -14 -96 -70 -70 -92 Z" fill="#fffdf6" stroke="#8f97b3" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-50 -70 C-62 -40 -56 -6 -46 20" fill="none" stroke="#dfe6f5" strokeWidth={9} strokeLinecap="round" />
          <path d="M-30 -4 Q0 22 30 -4" fill="none" stroke="#2f86b0" strokeWidth={5} strokeLinecap="round" />
          <circle cx={-24} cy={-34} r={8} fill="#2f86b0" /><circle cx={24} cy={-34} r={8} fill="#2f86b0" />
        </g>
      )}
      {kind === 'stomach' && (
        <g>
          <path d="M-14 -120 V-66" stroke="#f2a3a8" strokeWidth={26} strokeLinecap="round" />
          <path d="M-30 -70 C-10 -96 70 -92 84 -30 C96 30 50 96 -10 96 C-50 96 -66 76 -96 78 C-110 60 -84 38 -62 34 C-34 26 -46 -30 -30 -70 Z" fill="#ff8f9c" stroke="#8c3848" strokeWidth={4} strokeLinejoin="round" />
          <path d="M10 -44 C40 -30 52 10 30 50 M-14 -20 C6 -4 8 30 -12 54" fill="none" stroke="#e86f82" strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {kind === 'foodpipe' && (
        <g>
          <circle cx={0} cy={-104} r={30} fill="#ffd2c4" {...O} />
          <path d="M-60 -64 C-60 -84 60 -84 60 -64 L52 110 C52 124 -52 124 -52 110 Z" fill="#ffd2c4" {...O} />
          <path d="M0 -96 V10" stroke="#ef6f80" strokeWidth={16} strokeLinecap="round" />
          <path d={blob(34, 26, 'rcs', 9, 0.1, 6, 40)} fill="#ff8f9c" stroke="#8c3848" strokeWidth={3} />
          <g transform="translate(0 -34) rotate(-30)"><rect x={-7} y={-16} width={14} height={32} rx={7} fill="#fffdf6" stroke="#55608c" strokeWidth={2} /><path d="M-7 0 V-9 A7 7 0 0 1 7 -9 V0 Z" fill="#19b8a6" /></g>
        </g>
      )}
      {kind === 'heart' && (
        <g>
          <path d="M0 96 C-110 20 -110 -70 -50 -84 C-22 -90 -6 -70 0 -54 C6 -70 22 -90 50 -84 C110 -70 110 20 0 96 Z" fill="#ff6f7d" stroke="#8c3848" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-8 -60 C-12 -96 4 -116 22 -122 M12 -62 C22 -92 44 -100 62 -98" fill="none" stroke="#c9364a" strokeWidth={12} strokeLinecap="round" />
          <path d="M-50 -40 C-66 -10 -50 24 -24 50" fill="none" stroke="#ffb3bd" strokeWidth={9} strokeLinecap="round" opacity={0.8} />
        </g>
      )}
      {kind === 'lungs' && (
        <g>
          <path d="M0 -120 V-40 M0 -40 L-26 -8 M0 -40 L26 -8" fill="none" stroke="#f2a3a8" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-18 -44 C-70 -70 -110 10 -100 76 C-96 104 -40 100 -22 76 C-10 56 -12 -10 -18 -44 Z" fill="#ffa6b0" stroke="#8c3848" strokeWidth={4} strokeLinejoin="round" />
          <path d="M18 -44 C70 -70 110 10 100 76 C96 104 40 100 22 76 C10 56 12 -10 18 -44 Z" fill="#ffa6b0" stroke="#8c3848" strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
      {kind === 'body' && (
        <g>
          <circle cx={0} cy={-90} r={38} fill="#ffd2c4" {...O} />
          <path d="M-56 -34 C-56 -52 56 -52 56 -34 L48 112 C48 126 -48 126 -48 112 Z" fill="#ffd2c4" {...O} />
          <path d="M-22 -10 C-38 -10 -40 20 -26 28 C-18 32 -12 26 0 12 C12 26 18 32 26 28 C40 20 38 -10 22 -10 C12 -10 6 -2 0 2 C-6 -2 -12 -10 -22 -10 Z" fill="#ff6f7d" stroke="#8c3848" strokeWidth={2} />
        </g>
      )}
  </g>
);
/** The clinic's wall chart: one organ, big and simple, matched to the video's topic. */
const Chart: React.FC<{kind: NonNullable<RoomLook['chart']>; x: number; y: number; accent: string}> = ({kind, x, y, accent}) => (
  <g transform={`translate(${x - 150} ${y})`}>
    <rect x={12} y={14} width={300} height={430} rx={16} fill="#1d2b4f" opacity={0.16} />
    <rect width={300} height={430} rx={16} fill="#ffffff" {...O} />
    <rect x={18} y={18} width={264} height={46} rx={10} fill={accent} />
    <rect x={34} y={34} width={150} height={14} rx={7} fill="#ffffff" opacity={0.85} />
    <g transform="translate(150 214)"><ChartIcon kind={kind} /></g>
    {[376, 396].map((yy, i) => <rect key={yy} x={40} y={yy} width={i ? 150 : 220} height={11} rx={5.5} fill="#c8d6e5" />)}
  </g>
);
/** A picture for a home wall: a small landscape or a few bold shapes, in the room's own colours. */
const Picture: React.FC<{x: number; y: number; pal: Pal; seed: string; w?: number; h?: number}> = ({x, y, pal, seed, w = 250, h = 300}) => {
  const k = hash(seed) % 3;
  return (
    <g transform={`translate(${x - w / 2} ${y})`}>
      <rect x={10} y={12} width={w} height={h} rx={10} fill="#1d2b4f" opacity={0.16} />
      <rect width={w} height={h} rx={10} fill={pal.trim} {...O} />
      <rect x={18} y={18} width={w - 36} height={h - 36} rx={4} fill={pal.soft} stroke="#d9cdb4" strokeWidth={2} />
      {k === 0 && <g><circle cx={w * 0.66} cy={h * 0.36} r={w * 0.12} fill={pal.accent} /><path d={`M18 ${h * 0.7} Q${w * 0.3} ${h * 0.46} ${w * 0.56} ${h * 0.66} T${w - 18} ${h * 0.58} V${h - 18} H18 Z`} fill={pal.rug} opacity={0.75} /></g>}
      {k === 1 && <g><rect x={w * 0.2} y={h * 0.22} width={w * 0.32} height={h * 0.4} rx={8} fill={pal.accent} opacity={0.85} /><circle cx={w * 0.64} cy={h * 0.6} r={w * 0.17} fill={pal.rug} opacity={0.8} /><path d={`M${w * 0.24} ${h * 0.78} H${w * 0.76}`} stroke="#55608c" strokeWidth={5} strokeLinecap="round" /></g>}
      {k === 2 && <g><path d={`M${w * 0.5} ${h * 0.24} C${w * 0.8} ${h * 0.3} ${w * 0.72} ${h * 0.62} ${w * 0.5} ${h * 0.78} C${w * 0.28} ${h * 0.62} ${w * 0.2} ${h * 0.3} ${w * 0.5} ${h * 0.24} Z`} fill="#5fb56a" /><path d={`M${w * 0.5} ${h * 0.34} V${h * 0.82}`} stroke="#3f7f46" strokeWidth={4} strokeLinecap="round" /></g>}
    </g>
  );
};
const Certificate: React.FC<{x: number; y: number; accent: string}> = ({x, y, accent}) => (
  <g transform={`translate(${x - 80} ${y})`}>
    <rect x={8} y={10} width={160} height={200} rx={10} fill="#1d2b4f" opacity={0.16} />
    <rect width={160} height={200} rx={10} fill="#f7ecd2" {...O} />
    <rect x={14} y={14} width={132} height={172} rx={4} fill="#fffdf6" stroke="#d9c79a" strokeWidth={2} />
    <rect x={34} y={34} width={92} height={10} rx={5} fill={accent} />
    {[62, 80, 98].map((yy) => <rect key={yy} x={34} y={yy} width={92} height={7} rx={3.5} fill="#c8d6e5" />)}
    <circle cx={80} cy={142} r={18} fill="#ffc93c" stroke="#b9892c" strokeWidth={2.4} />
    <path d="M71 154 L65 178 L80 168 L95 178 L89 154 Z" fill="#ea4a55" />
  </g>
);
const Shelf: React.FC<{x: number; y: number; pal: Pal; seed: string}> = ({x, y, pal, seed}) => (
  <g transform={`translate(${x - 130} ${y})`}>
    <rect x={0} y={112} width={260} height={18} rx={6} fill={pal.trim} {...O} />
    <path d="M30 130 L20 166 M230 130 L240 166" stroke={LINE} strokeWidth={5} strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => { const hh = 60 + (hash(`${seed}${i}`) % 44); const c = [pal.accent, '#ffc93c', pal.rug, '#ea4a55', '#7a63d1'][(i + hash(seed)) % 5]; return <rect key={i} x={20 + i * 34} y={112 - hh} width={28} height={hh} rx={5} fill={c} stroke={LINE} strokeWidth={2.4} />; })}
    <path d={blob(26, 22, `${seed}p`, 9, 0.12, 220, 78)} fill="#5fb56a" stroke="#3f7f46" strokeWidth={2.4} />
    <rect x={204} y={92} width={32} height={22} rx={5} fill="#d98c5f" stroke={LINE} strokeWidth={2.4} />
  </g>
);
const Mirror: React.FC<{x: number; y: number; t: number; pal: Pal}> = ({x, y, t, pal}) => (
  <g transform={`translate(${x} ${y + 190})`}>
    <ellipse cx={6} cy={8} rx={126} ry={176} fill="#1d2b4f" opacity={0.16} />
    <ellipse rx={126} ry={176} fill={pal.trim} {...O} />
    <ellipse rx={104} ry={154} fill="#d8f0ff" stroke="#9fc8e6" strokeWidth={2.4} />
    <path d={`M${-60 + wrap(t * 22, 160) - 40} -110 l34 -30 M${-30 + wrap(t * 22, 160) - 40} -84 l52 -46`} stroke="#ffffff" strokeWidth={12} strokeLinecap="round" opacity={0.7} />
  </g>
);
const TowelRail: React.FC<{x: number; y: number; pal: Pal}> = ({x, y, pal}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-110 0 H110" stroke="#aeb9c7" strokeWidth={12} strokeLinecap="round" />
    <path d="M-110 0 H110" stroke="#f1f4f8" strokeWidth={4} strokeLinecap="round" />
    <path d="M-70 -4 H50 V150 Q-10 164 -70 150 Z" fill={pal.accent} {...O} />
    <path d="M-70 110 H50" stroke="#ffffff" strokeWidth={8} opacity={0.7} />
    <path d="M-70 126 H50" stroke="#ffffff" strokeWidth={4} opacity={0.6} />
  </g>
);

// ------------------------------------------------------------------ things on the floor
const Plant: React.FC<{x: number; y: number; t: number; kind: number; pot: string}> = ({x, y, t, kind, pot}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={252} rx={70} ry={12} fill="#1d2b4f" opacity={0.18} />
    {kind % 3 === 0 && [-34, -14, 8, 30].map((dx, i) => <g key={i} transform={`rotate(${dx * 0.5 + Math.sin(t * 0.9 + i) * 2} 0 150)`}><path d={`M${dx * 0.3} 160 C${dx - 26} 90 ${dx - 16} 10 ${dx} -40 C${dx + 16} 10 ${dx + 26} 90 ${dx * 0.3} 160 Z`} fill={i % 2 ? '#3f9c74' : '#5fb98a'} stroke="#2a6b4f" strokeWidth={2.6} /></g>)}
    {kind % 3 === 1 && [[-46, 60, 44], [40, 44, 48], [-8, -6, 56], [30, 100, 36], [-36, 116, 34]].map(([dx, dy, r], i) => <g key={i} transform={`rotate(${Math.sin(t * 0.8 + i * 1.3) * 2.4} 0 160)`}><path d="M0 160 Q0 100 0 60" stroke="#3f7f46" strokeWidth={5} transform={`translate(${dx * 0.4} 0)`} /><path d={blob(r, r * 0.9, `rpl${i}`, 9, 0.12, dx, dy)} fill={i % 2 ? '#4fae6a' : '#74c98a'} stroke="#2f7a48" strokeWidth={2.6} /></g>)}
    {kind % 3 === 2 && [-50, -24, 0, 24, 50].map((dx, i) => <g key={i} transform={`rotate(${dx * 0.7 + Math.sin(t * 1.1 + i) * 2.4} 0 160)`}><path d={`M0 160 C${-10} 80 ${-6} 10 0 -30 C6 10 10 80 0 160 Z`} fill={i % 2 ? '#2f8f6a' : '#49ad82'} stroke="#226a4d" strokeWidth={2.4} /></g>)}
    <path d="M-56 150 H56 L44 250 H-44 Z" fill={pot} {...O} />
    <path d="M-62 138 H62 V160 H-62 Z" fill={pot} {...O} />
    <path d="M-40 176 V236" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.35} />
  </g>
);
const HeartMonitor: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const ph = wrap(t * 0.7, 1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={80} y={170} width={16} height={230} fill="#aeb9c7" {...O} />
      <path d="M30 400 H146" stroke="#8f9bb0" strokeWidth={14} strokeLinecap="round" />
      <rect x={0} y={0} width={176} height={180} rx={16} fill="#eef2f7" {...O} />
      <rect x={16} y={16} width={144} height={104} rx={8} fill="#143a37" />
      <path d={`M20 70 H${50 + ph * 20} l8 -30 l10 54 l8 -34 l6 10 H156`} fill="none" stroke="#5df2c8" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={34} cy={148} r={9} fill="#ea4a55" /><rect x={56} y={140} width={56} height={16} rx={8} fill="#2ec4b6" /><rect x={122} y={140} width={34} height={16} rx={8} fill="#c8d6e5" />
    </g>
  );
};
/** The furniture of one arrangement, drawn for the "left" version (the "right" one is mirrored). */
const Furniture: React.FC<{look: RoomLook; role: RoomRole; pal: Pal; t: number}> = ({look, role, pal, t}) => {
  const kind = roomKind(role, look);
  const seed = `${kind}${look.palette}${look.layout}`;
  const base = look.layout.replace(/-(left|right)$/, '');
  const pot = ['#e98d5f', '#f2c14e', pal.accent, '#d9567a'][hash(seed) % 4];
  const wood = '#b98557';
  const B = FLOOR_TOP; // furniture stands against the wall: its feet are a little below the skirting
  const body = (() => {
    switch (base) {
      case 'exam-bed':
        return (
          <g>
            <HeartMonitor x={4} y={B - 380} t={t} />
            <g transform={`translate(360 ${B - 190})`}>
              <rect x={20} y={70} width={320} height={150} rx={10} fill={pal.trim} {...O} />
              <path d="M40 220 V262 M320 220 V262" stroke={LINE} strokeWidth={12} strokeLinecap="round" />
              <rect x={0} y={34} width={360} height={48} rx={22} fill={pal.accent} {...O} />
              <rect x={10} y={40} width={340} height={12} rx={6} fill="#ffffff" opacity={0.35} />
              <rect x={8} y={2} width={104} height={44} rx={20} fill="#ffffff" {...O} />
              <rect x={150} y={30} width={150} height={56} fill="#ffffff" opacity={0.9} stroke="#c8d6e5" strokeWidth={2} />
              <rect x={60} y={110} width={110} height={84} rx={8} fill={pal.soft} stroke={LINE} strokeWidth={2.4} /><rect x={190} y={110} width={110} height={84} rx={8} fill={pal.soft} stroke={LINE} strokeWidth={2.4} />
            </g>
            <Plant x={1000} y={B - 190} t={t} kind={hash(seed)} pot={pot} />
          </g>
        );
      case 'cabinet':
        return (
          <g>
            <Plant x={80} y={B - 190} t={t} kind={hash(seed) + 1} pot={pot} />
            <g transform={`translate(370 ${B - 230})`}>
              <rect x={0} y={40} width={340} height={230} rx={10} fill={pal.trim} {...O} />
              <rect x={-12} y={22} width={364} height={30} rx={10} fill="#dfe6ee" {...O} />
              <rect x={18} y={70} width={146} height={180} rx={8} fill={pal.soft} stroke={LINE} strokeWidth={2.4} /><rect x={176} y={70} width={146} height={180} rx={8} fill={pal.soft} stroke={LINE} strokeWidth={2.4} />
              <circle cx={150} cy={160} r={7} fill={pal.accent} /><circle cx={190} cy={160} r={7} fill={pal.accent} />
              <path d="M210 24 V-20 Q210 -40 236 -40 H250 V-24" fill="none" stroke="#9fb3c8" strokeWidth={12} strokeLinecap="round" />
              <ellipse cx={236} cy={30} rx={70} ry={12} fill="#c8d6e5" stroke={LINE} strokeWidth={2.4} />
              <rect x={24} y={-44} width={50} height={68} rx={12} fill="#ffffff" opacity={0.9} {...O} /><rect x={24} y={-52} width={50} height={16} rx={6} fill={pal.accent} {...O} />
              <rect x={86} y={-30} width={44} height={54} rx={10} fill="#ffffff" opacity={0.9} {...O} /><rect x={86} y={-38} width={44} height={14} rx={6} fill="#ffc93c" {...O} />
              <circle cx={49} cy={-6} r={12} fill="#f3f6fb" /><circle cx={108} cy={2} r={10} fill="#ffd9e0" />
            </g>
            <g transform={`translate(950 ${B - 60})`}>
              <rect x={0} y={60} width={150} height={30} rx={10} fill="#dfe6ee" {...O} />
              <rect x={62} y={-250} width={26} height={316} fill="#c8d6e5" {...O} />
              <rect x={20} y={-300} width={110} height={64} rx={12} fill="#ffffff" {...O} /><path d="M40 -268 H110" stroke={pal.accent} strokeWidth={8} strokeLinecap="round" />
            </g>
          </g>
        );
      case 'shelves':
        return (
          <g>
            <g transform={`translate(-30 ${B - 760})`}>
              <rect x={0} y={0} width={220} height={800} rx={10} fill={wood} {...O} />
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={16} y={20 + i * 194} width={188} height={170} rx={6} fill="#8f623c" opacity={0.55} />
                  {[0, 1, 2, 3].map((j) => { const hh = 80 + (hash(`${seed}${i}${j}`) % 70); const c = [pal.accent, '#ffffff', '#ffc93c', pal.rug, '#ea4a55'][(i + j + hash(seed)) % 5]; return <rect key={j} x={26 + j * 44} y={20 + i * 194 + 170 - hh} width={36} height={hh} rx={5} fill={c} stroke={LINE} strokeWidth={2.4} />; })}
                </g>
              ))}
              <path d="M96 232 h28 M110 218 v28" stroke="#ea4a55" strokeWidth={9} strokeLinecap="round" />
            </g>
            <g transform={`translate(540 ${B - 110})`}>
              <ellipse cx={0} cy={0} rx={70} ry={18} fill={pal.accent} {...O} />
              <path d="M0 16 V120 M-50 164 L0 120 L50 164" fill="none" stroke="#8f9bb0" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g transform={`translate(540 ${B - 560})`}>
              <rect x={-44} y={0} width={88} height={130} rx={14} fill="#ffffff" {...O} /><rect x={-28} y={18} width={56} height={56} rx={8} fill={pal.accent} opacity={0.8} /><rect x={-10} y={126} width={20} height={26} rx={6} fill="#c8d6e5" {...O} />
            </g>
            <Plant x={1000} y={B - 190} t={t} kind={hash(seed) + 2} pot={pot} />
          </g>
        );
      case 'desk':
        return (
          <g>
            <Plant x={70} y={B - 190} t={t} kind={hash(seed) + 1} pot={pot} />
            <g transform={`translate(350 ${B - 200})`}>
              <rect x={0} y={60} width={380} height={24} rx={8} fill={wood} {...O} />
              <rect x={14} y={84} width={120} height={170} rx={8} fill="#c99466" {...O} /><path d="M36 124 H112 M36 170 H112 M36 216 H112" stroke="#8f623c" strokeWidth={5} strokeLinecap="round" />
              <path d="M350 84 V254" stroke={LINE} strokeWidth={12} strokeLinecap="round" />
              <rect x={170} y={-70} width={170} height={112} rx={10} fill="#2b3350" {...O} /><rect x={182} y={-58} width={146} height={88} rx={4} fill="#9fd6ff" /><path d="M196 -20 l22 -18 l20 26 l24 -30 l28 22" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={240} y={42} width={30} height={20} fill="#55608c" /><rect x={200} y={54} width={110} height={10} rx={5} fill="#55608c" />
              <rect x={40} y={10} width={44} height={52} rx={8} fill={pal.accent} {...O} />{[0, 1, 2].map((i) => <path key={i} d={`M${52 + i * 10} 10 V${-16 - i * 6}`} stroke={['#ea4a55', '#ffc93c', '#3f8fd6'][i]} strokeWidth={6} strokeLinecap="round" />)}
            </g>
            <g transform={`translate(940 ${B - 300})`}>
              <rect x={0} y={0} width={170} height={340} rx={10} fill="#c8d0da" {...O} />
              {[0, 1, 2].map((i) => <g key={i}><rect x={14} y={16 + i * 106} width={142} height={92} rx={6} fill="#e6ebf1" stroke={LINE} strokeWidth={2.4} /><rect x={60} y={50 + i * 106} width={50} height={12} rx={6} fill="#8f9bb0" /></g>)}
            </g>
          </g>
        );
      case 'bed':
        return (
          <g>
            <g transform={`translate(-80 ${B - 340})`}>
              <rect x={0} y={0} width={70} height={390} rx={22} fill={wood} {...O} />
              <rect x={40} y={190} width={540} height={170} rx={26} fill="#ffffff" {...O} />
              <rect x={70} y={150} width={170} height={84} rx={36} fill="#ffffff" {...O} />
              <path d="M250 196 H580 V330 Q560 360 520 360 H250 Z" fill={pal.accent} {...O} />
              <path d="M250 232 H580" stroke="#ffffff" strokeWidth={10} opacity={0.5} />
              <path d={taperedPath([[300, 270], [400, 286], [520, 272]], 7)} fill="#1d2b4f" opacity={0.18} />
              <rect x={560} y={300} width={34} height={90} rx={10} fill={wood} {...O} />
            </g>
            <g transform={`translate(850 ${B - 230})`}>
              <rect x={0} y={60} width={170} height={210} rx={12} fill={wood} {...O} /><rect x={18} y={84} width={134} height={74} rx={8} fill="#c99466" stroke={LINE} strokeWidth={2.4} /><rect x={18} y={174} width={134} height={74} rx={8} fill="#c99466" stroke={LINE} strokeWidth={2.4} />
              <circle cx={85} cy={121} r={7} fill="#ffc93c" /><circle cx={85} cy={211} r={7} fill="#ffc93c" />
              <rect x={74} y={-80} width={22} height={140} fill="#b9892c" {...O} /><path d="M30 -80 L140 -80 L116 -190 L54 -190 Z" fill={look.time === 'night' ? '#ffe08a' : '#fff1bf'} {...O} />
              {look.time === 'night' && <ellipse cx={85} cy={-110} rx={190 + Math.sin(t * 1.4) * 8} ry={170} fill="#ffe08a" opacity={0.2} />}
            </g>
          </g>
        );
      case 'stove':
        return (
          <g>
            <rect x={-300} y={B - 190} width={W + 600} height={230} fill={pal.trim} {...O} />
            {Array.from({length: 8}).map((_, i) => <g key={i}><rect x={-120 + i * 170} y={B - 150} width={150} height={150} rx={8} fill={pal.soft} stroke={LINE} strokeWidth={2.4} /><rect x={-60 + i * 170} y={B - 132} width={30} height={10} rx={5} fill={pal.accent} /></g>)}
            <rect x={-300} y={B - 214} width={W + 600} height={32} rx={8} fill={wood} {...O} />
            <g transform={`translate(80 ${B - 214})`}>
              <rect x={0} y={-10} width={250} height={16} rx={6} fill="#3b4258" {...O} />
              <rect x={56} y={-96} width={140} height={90} rx={14} fill="#e24e42" {...O} /><rect x={44} y={-110} width={164} height={22} rx={10} fill="#c9382d" {...O} />
              <path d="M30 -78 H56 M196 -78 H222" stroke={LINE} strokeWidth={10} strokeLinecap="round" /><circle cx={126} cy={-118} r={9} fill="#3b4258" />
              {[0, 1, 2].map((i) => { const life = wrap(t * 0.4 + i * 0.33, 1); return <path key={i} d={`M${92 + i * 34} ${-130 - life * 120} q14 -18 0 -36 q-14 -18 0 -36`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.6 * (1 - life)} />; })}
            </g>
            <g transform={`translate(560 ${B - 214})`}>
              <path d="M0 -6 H150 L134 -64 H16 Z" fill="#ffffff" {...O} />
              {[[40, -72, '#ea4a55'], [78, -82, '#ffc93c'], [112, -72, '#5fb56a'], [60, -98, '#ff9f43']].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={24} fill={c as string} stroke={LINE} strokeWidth={2.4} />)}
            </g>
            <g transform={`translate(870 ${B - 720})`}>
              <rect x={0} y={0} width={260} height={760} rx={16} fill="#eef2f7" {...O} />
              <path d="M0 250 H260" stroke={LINE} strokeWidth={LW} /><rect x={24} y={80} width={14} height={120} rx={7} fill="#8f9bb0" /><rect x={24} y={300} width={14} height={160} rx={7} fill="#8f9bb0" />
              <rect x={90} y={60} width={56} height={56} rx={8} fill={pal.accent} transform="rotate(-6 118 88)" /><circle cx={190} cy={130} r={20} fill="#ffc93c" /><rect x={110} y={330} width={70} height={50} rx={6} fill="#ffffff" stroke="#c8d6e5" strokeWidth={2} transform="rotate(5 145 355)" />
            </g>
          </g>
        );
      case 'sink':
        return (
          <g>
            <g transform={`translate(110 ${B - 330})`}>
              <path d="M110 110 H190 L176 370 H124 Z" fill="#f4f7fb" {...O} />
              <path d="M0 40 H300 Q300 130 150 130 Q0 130 0 40 Z" fill="#ffffff" {...O} /><rect x={-8} y={20} width={316} height={30} rx={12} fill="#f4f7fb" {...O} />
              <path d="M150 20 V-40 Q150 -70 190 -70 H206 V-46" fill="none" stroke="#9fb3c8" strokeWidth={14} strokeLinecap="round" />
              {(() => { const d = wrap(t / 2.2, 1); return <circle cx={206} cy={-40 + d * 70} r={7} fill="#62baf7" opacity={d < 0.85 ? 0.9 : 0} />; })()}
              <rect x={40} y={-30} width={36} height={52} rx={10} fill={pal.accent} {...O} /><rect x={50} y={-48} width={16} height={22} rx={5} fill="#ffffff" {...O} />
            </g>
            <g transform={`translate(560 ${B - 230})`}>
              <path d="M0 40 H560 V200 Q540 250 480 250 H80 Q20 250 0 200 Z" fill="#ffffff" {...O} /><rect x={-14} y={22} width={590} height={34} rx={14} fill="#f4f7fb" {...O} />
              <path d="M60 250 V280 M500 250 V280" stroke={LINE} strokeWidth={14} strokeLinecap="round" />
              <path d="M-30 -700 H640" stroke="#aeb9c7" strokeWidth={12} strokeLinecap="round" />
              <path d={`M330 -700 C${350 + Math.sin(t * 0.9) * 6} -420 ${320 + Math.sin(t * 0.9 + 1) * 8} -180 340 30 H640 V-700 Z`} fill={pal.accent} opacity={0.92} {...O} />
              {[400, 470, 540, 610].map((x, i) => <path key={i} d={`M${x} -690 C${x + 10} -400 ${x - 8} -160 ${x + 4} 20`} fill="none" stroke="#ffffff" strokeWidth={7} opacity={0.3} />)}
            </g>
          </g>
        );
      default: // sofa
        return (
          <g>
            <g transform={`translate(-90 ${B - 300})`}>
              <rect x={0} y={60} width={560} height={250} rx={40} fill={pal.accent} {...O} />
              <rect x={30} y={0} width={500} height={170} rx={40} fill={pal.accent} {...O} />
              <rect x={56} y={150} width={220} height={90} rx={26} fill={pal.soft} stroke={LINE} strokeWidth={2.4} opacity={0.9} /><rect x={286} y={150} width={220} height={90} rx={26} fill={pal.soft} stroke={LINE} strokeWidth={2.4} opacity={0.9} />
              <rect x={90} y={70} width={110} height={100} rx={22} fill="#ffc93c" {...O} transform="rotate(-8 145 120)" />
              <path d="M40 310 V350 M520 310 V350" stroke={LINE} strokeWidth={14} strokeLinecap="round" />
            </g>
            <g transform={`translate(880 ${B - 620})`}>
              <path d="M40 0 L160 0 L190 130 L10 130 Z" fill="#fff1bf" {...O} /><rect x={92} y={130} width={16} height={480} fill="#8f9bb0" {...O} /><ellipse cx={100} cy={620} rx={80} ry={14} fill="#8f9bb0" {...O} />
            </g>
            <g transform={`translate(620 ${B - 150})`}><rect x={0} y={30} width={190} height={22} rx={8} fill={wood} {...O} /><path d="M20 52 V190 M170 52 V190" stroke={LINE} strokeWidth={10} strokeLinecap="round" /><rect x={50} y={-20} width={70} height={50} rx={10} fill={pal.rug} {...O} /></g>
          </g>
        );
    }
  })();
  return /-right$/.test(look.layout) ? <g transform={`translate(${W} 0) scale(-1 1)`}>{body}</g> : body;
};

// ------------------------------------------------------------------ what hangs on the wall, and where
/**
 * The band of wall that stays in view: below the app's own buttons at the top, above the hair of
 * the tallest character (Dr. Mira's curls start near y 545). Everything that hangs on a wall goes
 * here, so no chart or picture ends up behind a head (the first rooms hung them by the window only).
 */
export const WALL_BAND = {top: 130, bottom: 500};
export type WallItem = {kind: 'chart' | 'clock' | 'certificate' | 'picture' | 'shelf' | 'mirror' | 'towel'; x: number; y: number; s: number; r?: number; w?: number; h?: number; seed?: string; box: [number, number, number, number]};
/** The window's box [x0, y0, x1, y1], frame included. */
export const windowBox = (look: RoomLook): [number, number, number, number] => { const w = windowOf(look).box; return [w[0] - 17, w[1] - 17, w[0] + w[2] + 17, w[1] + w[3] + 17]; };
/** Every wall item of a room with the box it takes up [x0, y0, x1, y1]. The room draws from this list and the staging check measures it. */
export const wallItems = (look: RoomLook, role: RoomRole): WallItem[] => {
  const win = windowOf(look);
  const kind = roomKind(role, look);
  const seed = `${kind}${look.palette}${look.layout}${look.window.style}`;
  // where the wall is free beside the window: a wide place (a) for the chart or a picture, a narrow one (b) for the clock
  const hw = win.box[2] / 2 + 38;
  const side = look.window.side;
  const [a, b] = side === 'left' ? [win.cx + hw + 160, Math.min(972, win.cx + hw + 430)] : side === 'right' ? [win.cx - hw - 160, Math.max(108, win.cx - hw - 430)] : hash(seed) % 2 ? [Math.max(150, (win.cx - hw) / 2), (win.cx + hw + W) / 2] : [Math.min(W - 150, (win.cx + hw + W) / 2), (win.cx - hw) / 2];
  const fit = Math.min(1, side === 'centre' ? (win.cx - hw - 24) / 300 : 1); // a centre window leaves less wall on each side
  const top = WALL_BAND.top + 10;
  const out: WallItem[] = [];
  if (kind === 'clinic') {
    const s = Math.min(0.8, fit);
    // beside a side window the chart takes the place at the edge of the wall and the small things the
    // place by the window: thought bubbles and tags come up in the middle of the picture
    const [cx, kx] = side === 'centre' ? [a, b] : [b, a];
    out.push({kind: 'chart', x: cx, y: top, s, box: [cx - 150 * s, top, cx + 150 * s, top + 430 * s]});
    out.push({kind: 'clock', x: kx, y: top + 74, s: 1, r: 74, box: [kx - 74, top, kx + 74, top + 148]});
    out.push({kind: 'certificate', x: kx, y: top + 172, s: 0.85, box: [kx - 68, top + 172, kx + 68, top + 342]});
  }
  if (kind === 'kitchen') {
    out.push({kind: 'shelf', x: a, y: 300, s: 1, seed, box: [a - 130, 308, a + 130, 466]});
    out.push({kind: 'clock', x: b, y: 300, s: 1, r: 80, box: [b - 80, 220, b + 80, 380]});
  }
  if (kind === 'bedroom' || kind === 'living') {
    const [w, h] = [Math.round(220 * fit), Math.round(264 * fit)];
    out.push({kind: 'picture', x: a, y: top + 10, s: 1, w, h, seed, box: [a - w / 2, top + 10, a + w / 2, top + 10 + h]});
    out.push({kind: 'picture', x: b, y: top + 50, s: 1, w: 170, h: 170, seed: `${seed}2`, box: [b - 85, top + 50, b + 85, top + 220]});
  }
  if (kind === 'bathroom') {
    const mirrored = /-right$/.test(look.layout);
    const sinkX = mirrored ? W - 260 : 260;
    const free = Math.abs(sinkX - win.cx) > hw + 110; // the wall above the sink is free: the mirror hangs there
    const near = Math.abs(a - sinkX) < Math.abs(b - sinkX) ? a : b;
    const mx = free ? sinkX : near;
    const tx = free ? (mirrored ? W - 84 : 84) : near === a ? b : a;
    out.push({kind: 'mirror', x: mx, y: 320, s: 0.85, box: [mx - 107, 170, mx + 107, 470]});
    out.push({kind: 'towel', x: tx, y: 330, s: 0.62, box: [tx - 68, 326, tx + 68, 432]});
  }
  return out;
};

// ------------------------------------------------------------------ the room
/** One room, built from its recipe. `role` = clinic or home. */
export const Room: React.FC<{look: RoomLook; role: RoomRole; t: number}> = ({look, role, t}) => {
  const uid = useId().replace(/:/g, '');
  const pal = ROOM_PALS[look.palette] ?? ROOM_PALS.mint;
  const win = windowOf(look);
  const kind = roomKind(role, look);
  const time = look.time ?? 'day';
  const wallD = `M-300 -300 H${W + 300} V1420 H-300 Z ${win.d}`;
  const seed = `${kind}${look.palette}${look.layout}${look.window.style}`;
  return (
    <AbsoluteFill style={{background: pal.wall}}>
      <Layer p={0.35}><Canvas><View look={look} win={win} t={t} uid={uid} /></Canvas></Layer>
      <Layer p={0.82}>
        <Canvas>
          <defs>
            <linearGradient id={`rw${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.wall} /><stop offset="1" stopColor={pal.wall2} /></linearGradient>
            <clipPath id={`rc${uid}`}><path d={wallD} clipRule="evenodd" /></clipPath>
          </defs>
          <path d={wallD} fill={`url(#rw${uid})`} fillRule="evenodd" />
          <g clipPath={`url(#rc${uid})`}>
            {look.wall === 'stripes' && Array.from({length: 13}).map((_, i) => <rect key={i} x={-260 + i * 120} y={-300} width={60} height={1720} fill={pal.line} opacity={0.7} />)}
            {look.wall === 'dots' && Array.from({length: 150}).map((_, i) => { const r = Math.floor(i / 12); return <circle key={i} cx={-60 + (i % 12) * 110 + (r % 2) * 55} cy={-60 + r * 110} r={13} fill={pal.line} />; })}
            {look.wall === 'tiles' && (
              <g>
                <rect x={-300} y={640} width={W + 600} height={780} fill={pal.soft} opacity={0.6} />
                {Array.from({length: 17}).map((_, i) => <path key={i} d={`M${-180 + i * 90} 640 V1420`} stroke={pal.line} strokeWidth={4} />)}
                {Array.from({length: 9}).map((_, i) => <path key={`h${i}`} d={`M-300 ${640 + i * 90} H${W + 300}`} stroke={pal.line} strokeWidth={4} />)}
                <path d={`M-300 640 H${W + 300}`} stroke={pal.accent} strokeWidth={14} opacity={0.8} />
              </g>
            )}
            {look.wall === 'wainscot' && (
              <g>
                <rect x={-300} y={1010} width={W + 600} height={410} fill={pal.wall2} />
                {Array.from({length: 9}).map((_, i) => <rect key={i} x={-150 + i * 170} y={1050} width={130} height={250} rx={8} fill="none" stroke={pal.line} strokeWidth={5} />)}
                <rect x={-300} y={996} width={W + 600} height={24} fill={pal.trim} {...O} />
              </g>
            )}
            {look.wall === 'paint' && <path d={`M-300 1090 H${W + 300} V1420 H-300 Z`} fill={pal.wall2} opacity={0.55} />}
          </g>
          {/* the window: frame, bars, glass shine, sill */}
          <path d={win.d} fill="#ffffff" opacity={0.1} />
          <path d={win.bars} stroke={pal.trim} strokeWidth={18} />
          <path d={win.bars} fill="none" stroke={LINE} strokeWidth={2} opacity={0.5} />
          <path d={win.d} fill="none" stroke={LINE} strokeWidth={34 + LW * 2} strokeLinejoin="round" />
          <path d={win.d} fill="none" stroke={pal.trim} strokeWidth={34} strokeLinejoin="round" />
          <path d={`M${win.box[0] + 30} ${win.box[1] + 60} l70 70 M${win.box[0] + 70} ${win.box[1] + 40} l70 70`} stroke="#ffffff" strokeWidth={13} strokeLinecap="round" opacity={0.45} />
          {win.sill && <rect x={win.sill[0]} y={win.sill[1]} width={win.sill[2]} height={34} rx={10} fill={pal.trim} {...O} />}
          {/* on the wall */}
          {wallItems(look, role).map((it, i) => {
            const scaled = (kids: React.ReactNode) => <g key={i} transform={`translate(${it.x} ${it.y}) scale(${it.s}) translate(${-it.x} ${-it.y})`}>{kids}</g>;
            if (it.kind === 'chart') return scaled(<Chart kind={look.chart ?? 'body'} x={it.x} y={it.y} accent={pal.accent} />);
            if (it.kind === 'clock') return <Clock key={i} x={it.x} y={it.y} r={it.r ?? 80} t={t} rim={pal.accent} />;
            if (it.kind === 'certificate') return scaled(<Certificate x={it.x} y={it.y} accent={pal.accent} />);
            if (it.kind === 'picture') return <Picture key={i} x={it.x} y={it.y} pal={pal} seed={it.seed ?? seed} w={it.w} h={it.h} />;
            if (it.kind === 'shelf') return <Shelf key={i} x={it.x} y={it.y} pal={pal} seed={it.seed ?? seed} />;
            if (it.kind === 'mirror') return scaled(<Mirror x={it.x} y={it.y - 190} t={t} pal={pal} />);
            return scaled(<TowelRail x={it.x} y={it.y} pal={pal} />);
          })}
          {/* light through the window, dust in it */}
          {time !== 'night' && (
            <g opacity={time === 'evening' ? 0.9 : 0.7}>
              <path d={`M${win.cx - 120} ${win.cy} L${win.cx - 420} 1420 H${win.cx - 40} L${win.cx + 120} ${win.cy} Z`} fill={time === 'evening' ? '#ffb37a' : '#fff6dc'} opacity={0.12 + 0.02 * Math.sin(t * 0.9)} />
              {Array.from({length: 18}).map((_, i) => { const fy = wrap(random(`rd${i}`) + t * 0.012 * (0.6 + random(`rds${i}`)), 1); return <circle key={i} cx={win.cx - 380 + random(`rdx${i}`) * 520 + Math.sin(t * 0.8 + i) * 12} cy={520 + fy * 860} r={1.8 + random(`rdr${i}`) * 2.2} fill="#fffbe6" opacity={0.75 * Math.min(1, Math.min(fy, 1 - fy) / 0.1)} />; })}
            </g>
          )}
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <defs><linearGradient id={`rf${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.floor} /><stop offset="1" stopColor={pal.floor2} /></linearGradient></defs>
          <rect x={-300} y={FLOOR_TOP} width={W + 600} height={900} fill={`url(#rf${uid})`} />
          {look.floor === 'wood' && (
            <g>
              {Array.from({length: 9}).map((_, i) => <line key={i} x1={-300} x2={W + 300} y1={FLOOR_TOP + 52 + i * i * 9 + i * 30} y2={FLOOR_TOP + 52 + i * i * 9 + i * 30} stroke={pal.floor2} strokeWidth={4} />)}
              {Array.from({length: 12}).map((_, i) => <line key={`v${i}`} x1={540 + (i - 5.5) * 150} x2={540 + (i - 5.5) * 330} y1={FLOOR_TOP} y2={2200} stroke={pal.floor2} strokeWidth={3} opacity={0.6} />)}
            </g>
          )}
          {look.floor === 'checker' && Array.from({length: 8}).flatMap((_, r) => {
            const y0 = FLOOR_TOP + r * r * 9 + r * 40;
            const y1 = FLOOR_TOP + (r + 1) * (r + 1) * 9 + (r + 1) * 40;
            const sc = (y: number) => 1 + (y - FLOOR_TOP) / 480;
            return Array.from({length: 14}).map((__, j) => ((r + j) % 2 ? null : <path key={`${r}-${j}`} d={`M${540 + (j - 7) * 150 * sc(y0)} ${y0} L${540 + (j - 6) * 150 * sc(y0)} ${y0} L${540 + (j - 6) * 150 * sc(y1)} ${y1} L${540 + (j - 7) * 150 * sc(y1)} ${y1} Z`} fill={pal.floor2} opacity={0.85} />));
          })}
          {look.floor === 'carpet' && <g>{Array.from({length: 90}).map((_, i) => <circle key={i} cx={random(`rk${i}`) * W} cy={FLOOR_TOP + 30 + random(`rky${i}`) * 560} r={3 + random(`rkr${i}`) * 3} fill={pal.floor2} opacity={0.5} />)}</g>}
          <rect x={-300} y={FLOOR_TOP - 16} width={W + 600} height={28} fill={pal.trim} {...O} />
          <path d={`M${win.cx - 380} ${FLOOR_TOP + 60} L${win.cx - 120} ${FLOOR_TOP} L${win.cx + 220} ${FLOOR_TOP} L${win.cx - 40} ${FLOOR_TOP + 60} Z`} fill="#fff4cc" opacity={time === 'night' ? 0 : 0.22} />
          <Furniture look={look} role={role} pal={pal} t={t} />
          {/* a rug under the characters */}
          {hash(seed) % 3 !== 2 ? (
            <g>
              <ellipse cx={540} cy={ROOM_FLOOR + 70} rx={470} ry={96} fill={pal.rug} opacity={0.3} />
              <ellipse cx={540} cy={ROOM_FLOOR + 70} rx={470} ry={96} fill="none" stroke={pal.rug} strokeWidth={4} strokeDasharray="16 14" opacity={0.6} />
              <ellipse cx={540} cy={ROOM_FLOOR + 70} rx={400} ry={74} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.4} />
            </g>
          ) : (
            <g>
              <path d={`M150 ${ROOM_FLOOR + 10} H930 L1010 ${ROOM_FLOOR + 150} H70 Z`} fill={pal.rug} opacity={0.32} />
              <path d={`M190 ${ROOM_FLOOR + 30} H890 L950 ${ROOM_FLOOR + 130} H130 Z`} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.4} />
            </g>
          )}
        </Canvas>
        {/* the time of day colours everything */}
        <AbsoluteFill style={{background: time === 'night' ? 'linear-gradient(#1a2452 0%, #232a5c 100%)' : time === 'evening' ? 'linear-gradient(#ff9d6c 0%, rgba(255,157,108,0) 70%)' : `radial-gradient(ellipse at ${((win.cx / W) * 100).toFixed(0)}% 22%, #fff6dc 0%, rgba(255,246,220,0) 60%)`, opacity: time === 'night' ? 0.36 : time === 'evening' ? 0.2 : 0.2, mixBlendMode: time === 'night' ? 'multiply' : 'normal'}} />
      </Layer>
    </AbsoluteFill>
  );
};

/** In front of the characters, out of focus: leaves in a clinic, a curtain edge at home. */
export const RoomFore: React.FC<{look: RoomLook; role: RoomRole; t: number}> = ({look, role, t}) => {
  const pal = ROOM_PALS[look.palette] ?? ROOM_PALS.mint;
  const left = look.window.side !== 'left';
  const flip = left ? undefined : `translate(${W} 0) scale(-1 1)`;
  if (role === 'clinic') {
    return (
      <Layer p={1.3}>
        <Canvas>
          <g transform={flip}>
            {[[-70, 1.9, 520, 14], [60, 0.6, 430, -6], [-150, 3, 380, 30]].map(([x, ph, h, lean], i) => (
              <g key={i} transform={`rotate(${lean + Math.sin(t * 0.8 + ph) * 2} ${x} ${H + 40})`}>
                <path d={`M${x} ${H + 60} C${x - 150} ${H - h * 0.4} ${x - 90} ${H - h} ${x} ${H - h - 30} C${x + 90} ${H - h} ${x + 150} ${H - h * 0.4} ${x} ${H + 60} Z`} fill={i === 1 ? '#2f9c74' : '#237f5e'} opacity={0.96} />
              </g>
            ))}
          </g>
        </Canvas>
      </Layer>
    );
  }
  return (
    <Layer p={1.3}>
      <Canvas>
        <g transform={flip}>
          <path d={`M-260 -200 H-40 C${-10 + Math.sin(t * 0.7) * 10} 500 ${-70 + Math.sin(t * 0.7 + 1) * 14} 1200 -30 ${H + 200} H-260 Z`} fill={pal.accent} opacity={0.9} />
          <path d={`M-120 -200 C${-100 + Math.sin(t * 0.7) * 8} 500 ${-140 + Math.sin(t * 0.7 + 1) * 10} 1200 -110 ${H + 200}`} fill="none" stroke="#ffffff" strokeWidth={14} opacity={0.18} />
        </g>
      </Canvas>
    </Layer>
  );
};
