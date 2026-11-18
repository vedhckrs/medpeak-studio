/**
 * MedPeak Toons - THE MACRO STAGE (set `macro`). The owner's hero visual (2026-11-18: "macro shot is my hero
 * visual: start (hook), mid and last"): an extreme close-up drawn as its own detailed scene. A script picks
 * which macro with `state.view` and plays it with the dials:
 *   view 0 = entry  (rabies: saliva in the cut)    slide: 0 the hero in the drop, 1 deep in the cut
 *   view 1 = inside (rabies: inside a nerve fibre) speed: how fast it rides up (0 stops it)
 *   view 2 = caught (rabies: the catchers)          grip: 0 the catchers far out, 1 gripping the spikes
 * The hero is the stage character `virus`; it talks, blinks and changes its face like any other.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {type ArmSpec, type Emotion} from './rig';
import {entryHeroY, MacroCaught, MacroEntry, MacroInside, type MacroFace} from './look-macro';

type StageFace = {emotion: Emotion; talk: number; blink: number; look: {x: number; y: number}; arms: [ArmSpec, ArmSpec] | null; squash: number; lean: number; nod: number};
type Props = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; label?: string};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const faceOf = (f?: StageFace, fallback: MacroFace['face'] = 'smug'): MacroFace => {
  if (!f) return {face: fallback, talk: 0, blink: 0};
  const face: MacroFace['face'] = f.emotion === 'angry' ? 'evil' : ['scared', 'shocked'].includes(f.emotion) ? 'shock' : ['sad', 'sick'].includes(f.emotion) ? 'sad' : fallback === 'shock' && f.emotion === 'neutral' ? 'shock' : 'smug';
  return {face, talk: f.talk, blink: f.blink};
};
/** Where the hero's face is, for a state (head check, staging check). Its face room stays above the caption line. */
export const macroSpotsAt = (state: Record<string, number> = {}) => {
  const v = Math.round(state.view ?? 0);
  const y = v === 0 ? entryHeroY(state.slide ?? 0.6) : v === 1 ? 900 : 980;
  const s = v === 0 ? 1.55 : v === 1 ? 1.6 : 1.9;
  // the defender that speaks in the caught view (top left); it only exists there
  return {virus: {x: 540, y: y - 28 * s, faceW: 120 * s, headH: 190 * s, size: 300 * s}, whitecell: {x: 200, y: 505, faceW: 150, headH: 200, size: 280}};
};
export const MACRO_SPOTS = {virus: {x: 540, y: 860, faceW: 186, headH: 295, size: 465}, whitecell: {x: 200, y: 505, faceW: 150, headH: 200, size: 280}};
/** For the staging check: the hero's whole body is its room (nothing of ours may sit on it). */
export const macroThings = (state: Record<string, number> = {}) => {
  const v = Math.round(state.view ?? 0);
  const sp = macroSpotsAt(state).virus;
  const s = v === 0 ? 1.55 : v === 1 ? 1.6 : 1.9;
  const cy = sp.y + 28 * s;
  return {faces: [{who: 'virus', x0: 540 - 82 * s, y0: cy - 120 * s, x1: 540 + 82 * s, y1: cy + 100 * s}], things: [] as {id: string; text?: boolean; x0: number; y0: number; x1: number; y1: number}[]};
};

/**
 * The bite (dial `snap`, the hook: owner 2026-11-18, "weak hook"): a dog's jaws shut across the whole
 * frame and open again. 0 = open and out of frame, 0.5 = shut, 1 = open again. The dog is drawn
 * whole (eyes, nose, fur): two pink bars with teeth did not read as a dog. A script shuts it on the
 * very first frame, HOLDS it shut for about a second (at 0.3 s it was a flicker), then lets go.
 */
const Jaws: React.FC<{snap: number}> = ({snap}) => {
  const shut = 1 - Math.abs(2 * clamp01(snap) - 1); // 0 open, 1 shut
  if (shut <= 0.001) return null;
  const INK = '#2b1a17';
  const teeth = (dir: 1 | -1) => {
    // a row of fangs: two long canines and smaller teeth between them, tips toward the middle
    const sizes = [150, 250, 120, 110, 110, 120, 250, 150];
    const w = 1240 / sizes.length;
    return sizes.map((h, i) => {
      const x = -80 + i * w;
      return <path key={i} d={`M${x + 8} 0 Q${x + w * 0.5} ${dir * h * 1.25} ${x + w - 8} 0 Z`} fill="#fff6dc" stroke={INK} strokeWidth={9} strokeLinejoin="round" />;
    });
  };
  const travel = (1 - shut) * 1100;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {/* the inside of the mouth, behind the teeth: dark once the jaws are nearly shut */}
      {shut > 0.6 && <rect x={-200} y={700} width={1480} height={520} fill="#3a0d19" opacity={Math.min(1, (shut - 0.6) / 0.25)} />}
      <g transform={`translate(0 ${-travel})`}>
        {/* the dog's face, seen from the front: fur, two furious eyes, a big wet nose, the upper lip pulled back off the fangs */}
        <rect x={-200} y={-900} width={1480} height={1500} fill="#c98c55" />
        <path d="M-200 -900 H160 Q230 -200 120 330 Q-40 380 -200 300 Z M1280 -900 H920 Q850 -200 960 330 Q1120 380 1280 300 Z" fill="#9c6438" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
        {[-1, 1].map((k) => (
          <g key={k} transform={`translate(${540 + k * 215} 150)`}>
            <ellipse cx={0} cy={0} rx={98} ry={84} fill="#ffffff" stroke={INK} strokeWidth={9} />
            <circle cx={-k * 22} cy={22} r={36} fill={INK} />
            <path d={`M${-k * 130} -40 L${k * 120} -128 L${k * 132} -50 Z`} fill="#9c6438" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          </g>
        ))}
        <path d="M540 300 C470 300 380 330 380 400 C380 470 470 500 540 500 C610 500 700 470 700 400 C700 330 610 300 540 300 Z" fill={INK} />
        <ellipse cx={480} cy={372} rx={34} ry={16} fill="#6b4a45" />
        <path d="M540 500 V560 M452 268 L500 292 M628 268 L580 292 M470 236 L506 262 M610 236 L574 262" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
        {[[250, 420], [300, 380], [830, 420], [780, 380]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#7d5130" />)}
        <path d="M-200 540 Q540 640 1280 540 V770 H-200 Z" fill="#e8798a" stroke={INK} strokeWidth={9} />
        <g transform="translate(0 752)">{teeth(1)}</g>
      </g>
      <g transform={`translate(0 ${travel})`}>
        <rect x={-200} y={1380} width={1480} height={1500} fill="#c98c55" stroke={INK} strokeWidth={9} />
        <path d="M-200 1400 Q540 1280 1280 1400 V1160 H-200 Z" fill="#e8798a" stroke={INK} strokeWidth={9} />
        <g transform="translate(0 1168)">{teeth(-1)}</g>
      </g>
    </svg>
  );
};

export const MacroStage: React.FC<Props> = ({t, state = {}, faces = {}}) => {
  const v = Math.round(state.view ?? 0);
  const me = faces.virus;
  return (
    <AbsoluteFill>
      {v === 0 && <MacroEntry t={t} slide={clamp01(state.slide ?? 0.6)} face={faceOf(me)} />}
      {v === 1 && <MacroInside t={t} speed={state.speed ?? 1} face={faceOf(me)} />}
      {v === 2 && <MacroCaught t={t} grip={clamp01(state.grip ?? 1)} face={faceOf(me, 'shock')} cell={faces.whitecell ? {talk: faces.whitecell.talk, blink: faces.whitecell.blink} : undefined} />}
      <Jaws snap={state.snap ?? 0} />
    </AbsoluteFill>
  );
};
