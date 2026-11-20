/**
 * MedPeak Toons, look v8: the shared pieces for SCENES (a full 1080 x 1920 video frame).
 * A scene is a background (a room, or the inside of the body filling the whole frame) with v8 characters
 * and props standing in it. Scenes are drawn with the same kit as the cast (kit.tsx): one outline, flat
 * colour with one darker tone, no gradients, no glow, no blur.
 *
 * Captions are NOT part of a scene (the player adds them, in the band y 1380..1560): keep that band free
 * of faces and of anything the viewer must read.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FONT, INK} from './kit';

export const SCENE_W = 1080;
export const SCENE_H = 1920;
/** Where the caption will sit: keep faces and labels out of it. */
export const CAPTION_BAND: [number, number] = [1380, 1560];

/** The frame of one scene. Children are absolutely placed in frame pixels. */
export const Scene: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, background: bg, overflow: 'hidden', fontFamily: FONT}}>{children}</div>
);

/**
 * A full-frame SVG layer in frame pixels (viewBox 0 0 1080 1920): draw the background of a scene in it
 * (walls, floor, furniture, tissue) with the kit's Shape, OUTLINE and INLINE.
 */
export const Layer: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>{children}</svg>
);

/**
 * A v8 figure (anything drawn in the 200-unit figure space: an organ, a cell, a germ, a prop, an animal)
 * standing in a scene. (x, y) is where its centre goes, size its box in frame pixels.
 */
export const Put: React.FC<{x: number; y: number; size: number; rot?: number; flip?: boolean; children: React.ReactNode}> = ({x, y, size, rot = 0, flip, children}) => (
  <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">
    <g transform={`rotate(${rot}) ${flip ? 'scale(-1 1)' : ''}`}>{children}</g>
  </svg>
);

/** The small white label that names a place or a part ("NERVE", "SKIN"): black border, black capitals. */
export const Label: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 30, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, background: '#ffffff', border: `3px solid ${INK}`, borderRadius: 4, padding: `${size * 0.16}px ${size * 0.45}px`, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 1, color: INK, whiteSpace: 'nowrap'}}>{text.toUpperCase()}</div>
);

/** The number tag of a script ("2-3 MONTHS", "15 MINUTES"): a bold yellow block, tilted a little. */
export const Tag: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 64, rot = -4}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, background: CLOTH.yellow, border: `4px solid ${INK}`, borderRadius: 10, padding: `${size * 0.12}px ${size * 0.4}px`, fontFamily: FONT, fontWeight: 900, fontSize: size, color: INK, whiteSpace: 'nowrap'}}>{text.toUpperCase()}</div>
);

/** A thought or speech bubble outline in a Layer (frame pixels): a rounded cloud with a tail toward (tx, ty). */
export const Bubble: React.FC<{x: number; y: number; w: number; h: number; tx: number; ty: number}> = ({x, y, w, h, tx, ty}) => {
  const r = Math.min(w, h) * 0.32;
  const bx = x + (tx < x ? -w * 0.18 : w * 0.18);
  return (
    <g>
      <path d={`M ${bx - 26} ${y + h / 2 - 6} L ${tx} ${ty} L ${bx + 26} ${y + h / 2 - 6} Z`} fill="#ffffff" {...EDGE_IN} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} fill="#ffffff" {...EDGE_IN} />
      <path d={`M ${bx - 23} ${y + h / 2 - 2} L ${bx + 23} ${y + h / 2 - 2}`} stroke="#ffffff" strokeWidth={6} />
    </g>
  );
};
