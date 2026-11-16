// MedPeak Toons camera (v6): a multiplane camera with lenses.
// The picture is built from layers at different depths (far wall, mid, the plane the characters
// stand on, foreground). When the camera moves, far layers move less and near layers move more
// (parallax), and a lens blurs what is out of focus (depth of field). Shot sizes, lenses and
// moves are named like on a film set, so a script can simply say "cu 85 push".
// See skill/medpeak-health/references/toons-camera.md.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {ScaleCtx} from './ink';

export const W = 1080;
export const H = 1920;

// ------------------------------------------------------------------ lenses
/**
 * bg / fg = blur in screen pixels of the farthest background and of the foreground;
 * depth  = how strongly the layers separate when the camera moves (wide lenses stretch depth,
 *          long lenses flatten it);  vig = darkening toward the corners.
 */
export const LENSES = {
  '18': {label: '18 mm ultra-wide', bg: 0, fg: 1.5, depth: 1.3, vig: 0.3, use: 'the whole place; everything sharp; strong depth; for openings and big reveals'},
  '24': {label: '24 mm wide', bg: 0.8, fg: 3, depth: 1.15, vig: 0.24, use: 'the scene with everyone in it; walking and action'},
  '35': {label: '35 mm', bg: 2, fg: 5, depth: 1, vig: 0.2, use: 'the everyday story lens: two characters talking, medium shots'},
  '50': {label: '50 mm', bg: 4, fg: 8, depth: 0.88, vig: 0.17, use: 'natural single shots: chest up, calm explanation'},
  '85': {label: '85 mm portrait', bg: 8, fg: 13, depth: 0.72, vig: 0.22, use: 'close-ups: the face sharp, the background soft; emotion'},
  '135': {label: '135 mm tele', bg: 12, fg: 18, depth: 0.58, vig: 0.28, use: 'extreme close-ups: eyes, a single detail; background melted'},
  macro: {label: 'macro', bg: 15, fg: 20, depth: 0.5, vig: 0.32, use: 'tiny things made huge: a germ, a drop, a crack in a tooth'},
} as const;
export type LensName = keyof typeof LENSES;

// ------------------------------------------------------------------ shot sizes and moves
export const SHOTS = {
  ews: 'extreme wide: the whole set, characters small (where are we?)',
  wide: 'wide: everyone head to toe (who is here?)',
  full: 'full: one character head to toe',
  two: 'two-shot: speaker and listener together',
  ms: 'medium: waist up (talking, gestures)',
  mcu: 'medium close-up: chest up (the default talking shot)',
  cu: 'close-up: the face (emotion)',
  ecu: 'extreme close-up: the eyes or mouth (shock, a secret)',
  ots: 'dirty single: the speaker, with the blurred listener at the edge of the frame',
  low: 'hero shot: the speaker high in the frame, a little tilted (power, anger)',
} as const;
export type ShotName = keyof typeof SHOTS;
export const MOVES = {
  static: 'locked off, with a barely visible creep (calm, deadpan)',
  push: 'slow push-in (growing importance, tension)',
  pull: 'slow pull-back (reveal, relief, the end)',
  truck: 'slide sideways: the layers part and the set feels deep (openings)',
  tilt: 'travel up the character to the face (introductions)',
  crash: 'crash zoom: a fast punch in with an overshoot (shock, a joke)',
  whip: 'whip pan from the previous picture with motion blur (fast banter)',
  dutch: 'tilted horizon that settles (panic, dizziness)',
  shake: 'a short impact shake that dies out (a hit, a shout)',
  rack: 'focus pull: the picture starts soft on the speaker and snaps sharp',
} as const;
export type MoveName = keyof typeof MOVES;

/** Everything the camera is doing on one frame. */
export type Cam = {zoom: number; cx: number; cy: number; rot: number; lens: LensName; sx: number; sy: number; whip: number; soft: number};
export const CAM0: Cam = {zoom: 1, cx: W / 2, cy: H / 2, rot: 0, lens: '35', sx: 0, sy: 0, whip: 0, soft: 0};
export const CamCtx = createContext<Cam>(CAM0);

/** Keep the camera inside the set (a tilted frame needs a bigger margin). */
export const clampCam = (c: Cam): Cam => {
  const m = 1 + Math.abs(c.rot) * 0.035;
  const hw = (W / 2 / c.zoom) * m;
  const hh = (H / 2 / c.zoom) * m;
  return {...c, cx: hw >= W / 2 ? W / 2 : Math.max(hw, Math.min(W - hw, c.cx)), cy: hh >= H / 2 ? H / 2 : Math.max(hh, Math.min(H - hh, c.cy))};
};

/** The camera: zooms and turns the character plane; layers inside read it for parallax and focus. */
export const Camera: React.FC<Partial<Cam> & {children: React.ReactNode}> = ({children, ...partial}) => {
  const c = clampCam({...CAM0, ...partial});
  return (
    <CamCtx.Provider value={c}>
      <ScaleCtx.Provider value={c.zoom}>
        {c.whip > 0.5 && (
          <svg width={0} height={0} style={{position: 'absolute'}}>
            <filter id="toon-whip" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${c.whip.toFixed(1)} 0`} /></filter>
          </svg>
        )}
        <AbsoluteFill style={{filter: c.whip > 0.5 ? 'url(#toon-whip)' : c.soft > 0.3 ? `blur(${c.soft.toFixed(1)}px)` : undefined}}>
          <AbsoluteFill style={{transform: `translate(${(W / 2 - c.cx + c.sx).toFixed(2)}px, ${(H / 2 - c.cy + c.sy).toFixed(2)}px) rotate(${c.rot.toFixed(3)}deg) scale(${c.zoom.toFixed(4)})`, transformOrigin: `${c.cx.toFixed(2)}px ${c.cy.toFixed(2)}px`}}>
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
        <AbsoluteFill style={{background: `radial-gradient(ellipse 78% 70% at 50% 46%, rgba(24,12,36,0) 58%, rgba(24,12,36,${LENSES[c.lens].vig}) 100%)`, pointerEvents: 'none'}} />
      </ScaleCtx.Provider>
    </CamCtx.Provider>
  );
};

/**
 * A layer of the set at depth `p`: 1 = the plane the characters stand on, less = farther away
 * (moves less, blurs with the lens), more = foreground (moves more, blurs more).
 */
export const Layer: React.FC<{p?: number; children: React.ReactNode}> = ({p = 1, children}) => {
  const c = useContext(CamCtx);
  if (p === 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const lens = LENSES[c.lens];
  const q = 1 - (1 - p) * lens.depth; // the lens stretches or flattens the depth
  const zp = Math.max(0.2, 1 + (c.zoom - 1) * q);
  const px = W / 2 + (c.cx - W / 2) * q;
  const py = H / 2 + (c.cy - H / 2) * q;
  const k = zp / c.zoom;
  const blur = p < 1 ? (lens.bg * Math.min(1, (1 - p) / 0.6)) : lens.fg * Math.min(1, (p - 1) / 0.3);
  const on = c.zoom > 1.12 || p > 1 ? blur : blur * Math.max(0, (c.zoom - 1) / 0.12); // wide shots stay sharp
  return (
    <AbsoluteFill style={{transform: `translate(${(c.cx - px * k).toFixed(2)}px, ${(c.cy - py * k).toFixed(2)}px) scale(${k.toFixed(4)})`, transformOrigin: '0 0', filter: on > 0.4 ? `blur(${(on / zp).toFixed(2)}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

/** A full-frame SVG canvas for set drawing (does not clip, so tilts and shakes never show an edge). */
export const Canvas: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>
);
