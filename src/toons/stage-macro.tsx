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
  const face: MacroFace['face'] = ['scared', 'shocked'].includes(f.emotion) ? 'shock' : ['sad', 'sick'].includes(f.emotion) ? 'sad' : fallback === 'shock' && f.emotion === 'neutral' ? 'shock' : 'smug';
  return {face, talk: f.talk, blink: f.blink};
};
/** Where the hero's face is, for a state (head check, staging check). Its face room stays above the caption line. */
export const macroSpotsAt = (state: Record<string, number> = {}) => {
  const v = Math.round(state.view ?? 0);
  const y = v === 0 ? entryHeroY(state.slide ?? 0.6) : v === 1 ? 900 : 980;
  const s = v === 0 ? 1.55 : v === 1 ? 1.6 : 1.9;
  return {virus: {x: 540, y: y - 28 * s, faceW: 120 * s, headH: 190 * s, size: 300 * s}};
};
export const MACRO_SPOTS = {virus: {x: 540, y: 860, faceW: 186, headH: 295, size: 465}};
/** For the staging check: the hero's whole body is its room (nothing of ours may sit on it). */
export const macroThings = (state: Record<string, number> = {}) => {
  const v = Math.round(state.view ?? 0);
  const sp = macroSpotsAt(state).virus;
  const s = v === 0 ? 1.55 : v === 1 ? 1.6 : 1.9;
  const cy = sp.y + 28 * s;
  return {faces: [{who: 'virus', x0: 540 - 82 * s, y0: cy - 120 * s, x1: 540 + 82 * s, y1: cy + 100 * s}], things: [] as {id: string; text?: boolean; x0: number; y0: number; x1: number; y1: number}[]};
};

export const MacroStage: React.FC<Props> = ({t, state = {}, faces = {}}) => {
  const v = Math.round(state.view ?? 0);
  const me = faces.virus;
  return (
    <AbsoluteFill>
      {v === 0 && <MacroEntry t={t} slide={clamp01(state.slide ?? 0.6)} face={faceOf(me)} />}
      {v === 1 && <MacroInside t={t} speed={state.speed ?? 1} face={faceOf(me)} />}
      {v === 2 && <MacroCaught t={t} grip={clamp01(state.grip ?? 1)} face={faceOf(me, 'shock')} />}
    </AbsoluteFill>
  );
};
