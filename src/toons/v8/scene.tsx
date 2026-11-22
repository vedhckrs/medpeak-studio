/**
 * MedPeak Toons, look v8: the shared pieces for SCENES (a full 1080 x 1920 video frame).
 * A scene is a background (a room, or the inside of the body filling the whole frame) with v8 characters
 * and props standing in it. Scenes are drawn with the same kit as the cast (kit.tsx): one outline, flat
 * colour with one darker tone, no gradients, no glow, no blur.
 *
 * Captions are NOT part of a scene (the player adds them on the screen): keep the caption band free of faces and
 * of anything the viewer must read. The band depends on the video's caption style (`captionBandOf`).
 *
 * Engine v9, phase 1 (2026-11-23): `Put`, `Label`, `Tag` and `Bubble` report where they are to the layout log
 * (play.tsx, `useReport`); outside a probe that costs nothing and changes nothing on the page.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FONT, INK} from './kit';
import {FrameMove, matMul, matRotate, matScale, matTranslate, useReport, type Mat, type ReportKind} from './play';

export const SCENE_W = 1080;
export const SCENE_H = 1920;
/** Where the FIRST caption style sits (videos before 2026-11-22): keep faces and labels out of it. */
export const CAPTION_BAND: [number, number] = [1380, 1560];
/**
 * The caption band of a video, top and bottom in screen pixels (the caption is laid after the camera): `caption: 2`
 * (2026-11-22 on: y 1374, 40% smaller) is 1324-1434, the first style 1380-1560 (blueprint 05, Part 4.7). The picture
 * checks mask a padded band (pipeline/lib/toon_picture.py).
 */
export const captionBandOf = (caption?: number): [number, number] => (caption === 2 ? [1324, 1434] : CAPTION_BAND);

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

/** The transform of a Put: its 200-unit figure space into the parent's pixels (the same order as the SVG below). */
export const putMatrix = (x: number, y: number, size: number, rot = 0, flip = false, sq = 0): Mat => {
  let m = matMul(matTranslate(x, y), matScale(size / 200));
  if (rot) m = matMul(m, matRotate(rot));
  if (flip) m = matMul(m, matScale(-1, 1));
  if (sq) m = matMul(m, matMul(matTranslate(0, 90), matMul(matScale(1 + sq, 1 - sq), matTranslate(0, -90))));
  return m;
};

/**
 * A v8 figure (anything drawn in the 200-unit figure space: an organ, a cell, a germ, a prop, an animal)
 * standing in a scene. (x, y) is where its centre goes, size its box in frame pixels.
 * `who` (optional) names the character for the layout log and `kind` says what it is ('body' by default, 'prop' for a
 * held or placed thing); neither changes the drawing.
 */
export const Put: React.FC<{x: number; y: number; size: number; rot?: number; flip?: boolean; sq?: number; who?: string; kind?: ReportKind; children: React.ReactNode}> = ({x, y, size, rot = 0, flip, sq = 0, who, kind = 'body', children}) => (
  <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">
    <g transform={`rotate(${rot}) ${flip ? 'scale(-1 1)' : ''} ${sq ? `translate(0 90) scale(${(1 + sq).toFixed(3)} ${(1 - sq).toFixed(3)}) translate(0 -90)` : ''}`}>
      <FrameMove m={putMatrix(x, y, size, rot, !!flip, sq)} who={who} body><PutBox kind={kind} />{children}</FrameMove>
    </g>
  </svg>
);
/** A Put's own box (its 200-unit figure square) in the layout log, reported from inside it so it carries the figure's `body`. */
const PutBox: React.FC<{kind: ReportKind}> = ({kind}) => {
  useReport()({kind, box: {x0: -100, y0: -100, x1: 100, y1: 100}, id: 'put'});
  return null;
};

/** The width of a line of capitals in the caption font, roughly (for the layout log's text boxes). */
const textW = (text: string, size: number) => text.length * size * 0.68;

/** The small white label that names a place or a part ("NERVE", "SKIN"): black border, black capitals. */
export const Label: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 30, rot = 0}) => {
  const report = useReport();
  const w = textW(text, size) + size * 0.9 + 6, h = size * 1.32 + 6;
  report({kind: 'label', box: {x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2}, text});
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, background: '#ffffff', border: `3px solid ${INK}`, borderRadius: 4, padding: `${size * 0.16}px ${size * 0.45}px`, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 1, color: INK, whiteSpace: 'nowrap'}}>{text.toUpperCase()}</div>;
};

/** The number tag of a script ("2-3 MONTHS", "15 MINUTES"): a bold yellow block, tilted a little. */
export const Tag: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 64, rot = -4}) => {
  const report = useReport();
  const w = textW(text, size) + size * 0.8 + 8, h = size * 1.24 + 8;
  report({kind: 'plate', box: {x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2}, text});
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, background: CLOTH.yellow, border: `4px solid ${INK}`, borderRadius: 10, padding: `${size * 0.12}px ${size * 0.4}px`, fontFamily: FONT, fontWeight: 900, fontSize: size, color: INK, whiteSpace: 'nowrap'}}>{text.toUpperCase()}</div>;
};

/** A thought or speech bubble outline in a Layer (frame pixels): a rounded cloud with a tail toward (tx, ty). */
export const Bubble: React.FC<{x: number; y: number; w: number; h: number; tx: number; ty: number}> = ({x, y, w, h, tx, ty}) => {
  const report = useReport();
  report({kind: 'bubble', box: {x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2}, tip: [tx, ty]});
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
