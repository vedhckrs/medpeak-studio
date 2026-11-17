// MedPeak Toons character blueprint (see skill/medpeak-health/references/toons-blueprint.md).
// EVERY body character (organ, cell, germ, medicine...) is one Blueprint object built by
// makeCharacter(), so a new character automatically gets the house face, hands, arms, line and
// light. To add a character: write its Blueprint, add it to BLUEPRINTS in characters.tsx, render
// its model sheet (ToonSheet) and check it against the blueprint rules.
import React from 'react';
import {Contact, lineOf} from './ink';
import {Arm, type ArmSpec, armOf, type Emotion, Face, Leg} from './rig';
import {STYLE} from './style';

export type Family = 'organ' | 'cell' | 'germ' | 'medicine' | 'waste' | 'skeleton' | 'person';

/** Body acting, on top of the arm pose: all optional, all zero at rest. */
export type Act = {
  lean?: number; // degrees: the body leans (positive = toward screen right)
  tilt?: number; // degrees: the head tilts (people); bodies add it to the lean
  nod?: number; // -1..1: chin down (positive) or up
  turn?: number; // -1..1: the face turns left or right
  bob?: number; // units: the body drops (people bend their knees)
  shift?: number; // -1..1: weight on one leg (people)
  shrug?: number; // 0..1: shoulders up (people)
};

export type CharProps = {
  emotion?: Emotion;
  talk?: number;
  blink?: number;
  look?: {x: number; y: number};
  arms?: [ArmSpec, ArmSpec] | null; // [left, right]; null hides the arms
  squash?: number; // > 0 squashed (landing), < 0 stretched (jump); pivots on the ground point
  step?: number; // -1..1 leg swing for walking (only characters with legs)
  t?: number; // seconds, for small idle details (sloshing, tails)
  noLegs?: boolean;
  flip?: boolean; // face the other way
  act?: Act; // body acting: lean, nod, turn, bob, weight shift
};

/** What a blueprint's drawing functions receive. */
export type Ctx = {p: CharProps; t: number; color: string; line: string};

export type Blueprint = {
  name: string;
  family: Family;
  role: string; // one line: who this character is in a story
  color: string; // the main body colour (6-digit hex)
  accents?: {label: string; color: string}[]; // other colours, listed on the model sheet
  face: {x: number; y: number; size: number; skin?: string; eye?: string; lashes?: boolean}; // where the face sits, how big, eye colour
  arms: {l: [number, number]; r: [number, number]; len?: number; color?: string} | null; // shoulder points
  legs: {x?: number; y: number; gap: number; len?: number; color?: string; shoe?: string} | null; // only for travellers
  ground: {y: number; w: number}; // the lowest point (contact shadow, squash pivot, where it stands)
  rest?: [ArmSpec, ArmSpec]; // default arm pose
  back?: (c: Ctx) => React.ReactNode; // drawn behind the arms: tubes, tails, spikes
  body: (c: Ctx) => React.ReactNode; // the main shapes
  front?: (c: Ctx) => React.ReactNode; // over the face: hats, bows, helmets
};

export type Character = React.FC<CharProps> & {blueprint: Blueprint};

/** The blueprint rules that code can check. A character that breaks one fails loudly at render. */
export const checkBlueprint = (bp: Blueprint) => {
  const bad: string[] = [];
  const hex = (c: string) => /^#[0-9a-fA-F]{6}$/.test(c);
  if (!hex(bp.color)) bad.push(`color must be a 6-digit hex, got ${bp.color}`);
  for (const a of bp.accents ?? []) if (!hex(a.color)) bad.push(`accent "${a.label}" must be a 6-digit hex`);
  if (bp.face.skin && !hex(bp.face.skin)) bad.push('face.skin must be a 6-digit hex');
  if (bp.face.size < 0.7 || bp.face.size > 1.25) bad.push(`face.size ${bp.face.size} is outside 0.7-1.25 (eyes must span about 40-55% of the body)`);
  if (bp.legs && bp.family === 'organ') bad.push('organs stay in place: no legs (only travellers get legs)');
  if (bp.role.length < 20) bad.push('role must say who this character is in a story');
  if (bp.ground.y < 40 || bp.ground.y > 100) bad.push(`ground.y ${bp.ground.y} must be the lowest point of the drawing (40-100)`);
  if (bad.length) throw new Error(`Toons blueprint "${bp.name}" breaks the house rules:\n- ${bad.join('\n- ')}`);
};

export const makeCharacter = (bp: Blueprint): Character => {
  checkBlueprint(bp);
  const C = ((p: CharProps) => {
    const c: Ctx = {p, t: p.t ?? 0, color: bp.color, line: lineOf(bp.color)};
    const sq = p.squash ?? 0;
    const act = p.act ?? {};
    const arms = p.arms === null ? null : p.arms ?? bp.rest ?? [112, 68];
    const arm = (i: 0 | 1, front: boolean) => {
      if (!bp.arms || !arms) return null;
      if (!STYLE.bodyLimbs) return null; // clean 2D: body characters are anatomy, no arms or hands
      const sp = armOf(arms[i]);
      if (!!sp.front !== front) return null;
      const [x, y] = i === 0 ? bp.arms.l : bp.arms.r;
      return <Arm key={`a${i}`} x={x} y={y} spec={sp} color={bp.arms.color ?? bp.color} len={bp.arms.len} />;
    };
    const legs = STYLE.bodyLimbs && !p.noLegs && bp.legs ? bp.legs : null;
    const g = bp.ground.y;
    return (
      <g transform={`translate(0 ${g + (act.bob ?? 0)}) rotate(${((act.lean ?? 0) + (act.tilt ?? 0) * 0.5).toFixed(2)}) scale(${(p.flip ? -1 : 1) * (1 + sq * 0.12)} ${1 - sq * 0.12}) translate(0 ${-g})`}>
        <Contact y={g} w={bp.ground.w} />
        {bp.back?.(c)}
        {legs && ([-1, 1] as const).map((side) => (
          <Leg key={side} side={side} x={(legs.x ?? 0) + side * legs.gap} y={legs.y} len={legs.len} color={legs.color ?? bp.color} shoe={legs.shoe ?? lineOf(bp.color, 0.5)} step={p.step} />
        ))}
        {arm(0, false)}
        {arm(1, false)}
        {bp.body(c)}
        <g transform={`translate(${bp.face.x} ${bp.face.y + (act.nod ?? 0) * 3})`}>
          <Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} size={bp.face.size} skin={bp.face.skin ?? bp.color} iris={bp.face.eye} lashes={bp.face.lashes} turn={(act.turn ?? 0) * 0.8} />
        </g>
        {bp.front?.(c)}
        {arm(0, true)}
        {arm(1, true)}
      </g>
    );
  }) as Character;
  C.displayName = bp.name;
  C.blueprint = bp;
  return C;
};
