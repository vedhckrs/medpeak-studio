/**
 * Rabies version 3: the body shots in the NEW microscopic world (micro3.tsx). The owner approved the five
 * places on 2026-11-20. Each shot may pass through two places with a zoom-through inside the shot, so the
 * picture changes often (the channel's motion rules), and every character moves: the Virus hops with
 * anticipation and squash, antibodies fly and swarm, white cells close in.
 *
 *   A   the highway: the Virus rides toward the far brain, turns to the viewer and taunts
 *   B   the bite (fang, saliva, the Virus rides a drop in) -> the door at "jump" (the key opens a lock)
 *   M2  the muscle (the Virus makes copies, the months pass) -> the highway at "faster" (the rush)
 *   E   the battle (the factory fires antibodies) -> the door at "wall" (antibodies block every lock)
 *   M3  the battle: the white-cell police squad grabs the Virus
 */
import React from 'react';
import {Put} from './scene';
import {Virus} from './germs';
import {Antibody, WhiteCell} from './cells';
import {BattlePlace, BitePlace, DIVE, DiveCtx, DOOR, DoorPlace, HighwayPlace, MusclePlace} from './micro3';
import {CharTag, IconBadge} from './hud';
import {active, blink, bodyFace, clamp01, go, lerp, pop, since, sway, talk, type Focus, type ShotDef, type ShotNow} from './play';

// ------------------------------------------------------------------ helpers
/** Inside a shot, pass from one place to the next with a zoom-through over `d` seconds starting at u = 0. */
const Swap: React.FC<{u: number; from: React.ReactNode; to: React.ReactNode; d?: number}> = ({u, from, to, d = 0.38}) => {
  if (u < 0) return <>{from}</>;
  const k = clamp01(u / d);
  if (k >= 1) return <>{to}</>;
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: `scale(${lerp(0.8, 1, e).toFixed(4)})`}}>{to}</div>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: `scale(${(1 + e * 1.5).toFixed(4)})`, opacity: 1 - clamp01((k - 0.3) / 0.6)}}>{from}</div>
      <div style={{position: 'absolute', inset: 0, background: '#ffffff', opacity: Math.max(0, 0.3 - Math.abs(k - 0.5)) * 1.1}} />
    </>
  );
};
/** A hop: 0 at rest; anticipation dip, up, land with a squash. Returns {dy, sq} for a hop that began `u` s ago. */
const hop = (u: number, h = 120, d = 0.55) => {
  if (u < 0 || u > d + 0.25) return {dy: 0, sq: 0};
  if (u < 0.08) return {dy: 0, sq: 0.1 * Math.sin((u / 0.08) * Math.PI)}; // dip (squash down)
  if (u < d) { const k = (u - 0.08) / (d - 0.08); return {dy: -Math.sin(k * Math.PI) * h, sq: -0.08 * Math.sin(k * Math.PI)}; } // up (stretch)
  const k = (u - d) / 0.25; return {dy: 0, sq: 0.12 * Math.sin(k * Math.PI) * (1 - k)}; // land
};
/** The Virus squashes with its own voice; a slow idle wobble otherwise. */
const voiceSq = (s: ShotNow) => { const k = talk(s, 'virus'); return k > 0 ? (k - 0.35) * 0.12 : 0; };
/** v4: how much the Virus moves: a little breath at rest, full while it speaks. */
const calm = (s: ShotNow) => 0.15 + 0.85 * active(s, 'virus');
const VirusAt: React.FC<{s: ShotNow; x: number; y: number; size: number; rot?: number; sq?: number; look?: [number, number]; rest?: string; seed?: number}> = ({s, x, y, size, rot = 0, sq = 0, look = [0.4, 0.2], rest = 'happy', seed = 1}) => {
  const face = bodyFace(s, 'virus', seed, rest);
  return <Put x={x} y={y} size={size} rot={rot} sq={sq + voiceSq(s)}><Virus mood={face.mood} mouth={face.mouth} look={look} /></Put>;
};
const virusFocus = (x: number, y: number, size: number): Focus => ({x, y: y - size * 0.05, r: size * 0.36});
/** v4: one smooth, eased, continuous push per shot (no punch). */
const slowPush = (x: number, y: number, z0: number, z1: number) => (s: ShotNow) => { const u = clamp01(s.t / s.dur); return {x, y, z: lerp(z0, z1, u * u * (3 - 2 * u))}; };

// =================================================================== A: the highway hook
const posA = (s: ShotNow) => {
  const t = s.t;
  const turn = go(since(s, 'A1', 'brain'), -0.1, 0.3); // turns to the viewer on "brain", then taunts
  const h = hop(since(s, 'A2', 'catch'), 90);
  const c = calm(s);
  return {x: 540 + sway(t, 2.2, 1) * 14 * c, y: 1330 + h.dy + Math.abs(Math.sin(t * 7)) * -10 * c, sq: h.sq, rot: lerp(0, -10, turn) + sway(t, 1.1, 2) * 4 * c, turn};
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const v = posA(s);
  return (
    <>
      <HighwayPlace t={s.t} speed={0.8} />
      <VirusAt s={s} x={v.x} y={v.y} size={430} rot={v.rot} sq={v.sq} rest="angry" look={v.turn > 0.5 ? [0.1, 0.2] : [0, -0.9]} />
    </>
  );
};

// =================================================================== B: the bite -> the door
const posB = (s: ShotNow) => {
  const dog = since(s, 'B1', 'dog');
  const fang = go(dog, -0.12, 0.18) - 0.35 * go(since(s, 'B1', 'scratch'), 0.3, 0.6);
  const ride = go(since(s, 'B1', 'need'), 0, 1.2); // the Virus rides a drop down into the skin
  return {fang: Math.max(0, fang), drops: dog > 0.2 ? 1 : 0, vx: 560 + Math.sin(s.t * 1.7) * 30, vy: lerp(560, 980, ride) + sway(s.t, 1.4, 3) * 8};
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const b = posB(s);
  const jump = since(s, 'B2', 'jump');
  const j = hop(jump - 0.4, 160, 0.6);
  const door = (
    <>
      <DoorPlace t={s.t} open={since(s, 'B2', 'nerve') > 0.25 ? 2 : -1} />
      <VirusAt s={s} x={lerp(240, DOOR.locks[2] - 10, go(jump, 0.4, 0.6))} y={DOOR.lockY - 190 + j.dy} size={250} sq={j.sq} rot={sway(s.t, 1.2, 4) * 5 * calm(s)} look={[0.6, 0.8]} />
    </>
  );
  const bite = (
    <>
      <BitePlace t={s.t} fang={b.fang} drops={b.drops} />
      {since(s, 'B1', 'scratch') > 0 && <VirusAt s={s} x={b.vx} y={b.vy} size={200} rot={sway(s.t, 1.6, 5) * 8 * calm(s)} look={[0.2, 0.8]} />}
    </>
  );
  return <Swap u={jump} from={bite} to={door} />;
};

// =================================================================== M2: the muscle -> the highway
const ShotM2: React.FC<{s: ShotNow}> = ({s}) => {
  const fast = since(s, 'B3', 'faster');
  const copies = [0, 1, 2, 3].map((i) => pop(s.t, 0.5 + i * 0.45, 0.35));
  const muscle = (
    <>
      <MusclePlace t={s.t} />
      <VirusAt s={s} x={540} y={830} size={300} rest="smug" look={[0.5, 0.3]} />
      {[[290, 760, -20], [800, 740, 15], [690, 990, 30], [380, 1000, -30]].map(([x, y, r], i) => copies[i] > 0.02 && (
        <Put key={i} x={lerp(540, x, Math.min(1, copies[i]))} y={lerp(830, y, Math.min(1, copies[i]))} size={150 * copies[i]} rot={r + sway(s.t, 1.3, i) * 10}><Virus mood={blink(s.t, i) > 0.5 ? 'closed' : 'wink'} mouth="smile" look={[(540 - x) / 300, 0]} /></Put>
      ))}
    </>
  );
  const highway = (
    <>
      <HighwayPlace t={s.t} speed={2.6} />
      <VirusAt s={s} x={540 + sway(s.t, 0.6, 2) * 20 * calm(s)} y={1330 + Math.abs(Math.sin(s.t * 9)) * -14 * calm(s)} size={380} rot={sway(s.t, 0.5, 1) * 6 * calm(s)} rest="happy" look={[0, -0.9]} />
    </>
  );
  return <Swap u={fast} from={muscle} to={highway} />;
};
const ScreenM2: React.FC<{s: ShotNow}> = ({s}) => {
  const u = since(s, 'B3', 'two');
  // v4: the calendar leaves when the picture switches to the highway ("faster")
  return u < 0 ? null : <IconBadge icon="calendar" t={u} x={540} y={420} out={u - since(s, 'B3', 'faster')} />;
};

// =================================================================== E: the battle -> the door with the wall
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const wall = since(s, 'E2', 'wall');
  const bonk = hop(since(s, 'E2', 'no') , 70, 0.4);
  const battle = (
    <>
      <BattlePlace t={s.t} />
      <VirusAt s={s} x={760 + sway(s.t, 1.1, 1) * 20 * calm(s)} y={560} size={250} rot={sway(s.t, 0.8, 2) * 10 * calm(s)} rest="scared" look={[-0.8, 0.6]} />
    </>
  );
  const door = (
    <>
      <DoorPlace t={s.t} />
      {DOOR.locks.map((x, i) => {
        const k = pop(wall, 0.05 + i * 0.08, 0.3);
        return k > 0.02 && <Put key={i} x={x} y={DOOR.lockY - 90 - (1 - Math.min(1, k)) * 300} size={150 * Math.min(1.1, k)} rot={sway(s.t, 1, i) * 6}><Antibody mood={blink(s.t, i + 3) > 0.5 ? 'closed' : 'angry'} mouth="grit" look={[0, -0.6]} /></Put>;
      })}
      <VirusAt s={s} x={DOOR.locks[2] - 10 + Math.sin(s.t * 30) * 6 * clamp01(1 - (since(s, 'E2', 'no') - 0.5))} y={DOOR.lockY - 330 + bonk.dy} size={250} sq={bonk.sq} rest="angry" look={[0, 0.8]} />
    </>
  );
  return <Swap u={wall} from={battle} to={door} />;
};
// v4: no shield here (the vaccine is not named in these lines; it pops on "shots" in the clinic)

// =================================================================== v4: name tags and the dive
/** How far the camera has dived into the shot (0..1, eased in and out over the whole shot). */
const diveOf = (s: ShotNow) => { const u = clamp01(s.t / Math.max(0.1, s.dur)); return u * u * (3 - 2 * u); };
/** The Scene with the dive set for its depth planes. */
const dived = (Scene: React.FC<{s: ShotNow}>): React.FC<{s: ShotNow}> => {
  const D: React.FC<{s: ShotNow}> = ({s}) => <DiveCtx.Provider value={diveOf(s)}><Scene s={s} /></DiveCtx.Provider>;
  return D;
};
/** A point in a depth plane (depth d) after the dive grows it about the frame centre. */
const inPlane = (s: ShotNow, x: number, y: number, d: number): [number, number, number] => {
  const k = 1 + diveOf(s) * (DIVE.far + d * (DIVE.near - DIVE.far));
  return [540 + (x - 540) * k, 960 + (y - 960) * k, k];
};
/** A name tag for a character at frame point (x, y), radius r, placed on the SCREEN through the shot's camera. */
const TagAt: React.FC<{s: ShotNow; id: string; label: string; x: number; y: number; r: number; t: number}> = ({s, id, label, x, y, r, t}) => {
  const c = V3_SHOTS[id].view!(s);
  return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} />;
};
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => { const v = posA(s); return <TagAt s={s} id="A" label="RABIES VIRUS" x={v.x} y={v.y} r={430 * 0.36} t={s.t - 0.35} />; };
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => {
  const dog = since(s, 'B1', 'dog');
  const nerve = since(s, 'B2', 'jump') - 0.5;
  // the bulb's left shoulder: room for the tag above it all through the dive, far from the Virus
  const [x, y, k] = inPlane(s, 330, 640, 0.35);
  return (
    <>
      {dog >= 0 && <IconBadge icon="dog" t={dog} x={790} y={420} size={300} out={1.9} />}
      {nerve >= 0 && <TagAt s={s} id="B" label="NERVE ENDING" x={x} y={y} r={105 * k} t={nerve} />}
    </>
  );
};
const ScreenE: React.FC<{s: ShotNow}> = ({s}) => {
  const [fx, fy, fk] = inPlane(s, 220, 1240, 0.35);
  // the antibodies are tagged where they stand still: the wall over the locks (the right one, clear of the Virus)
  const wall = since(s, 'E2', 'wall');
  return (
    <>
      <TagAt s={s} id="E" label="DEFENCE CELL" x={fx} y={fy} r={190 * fk} t={s.t - 0.85} />
      {wall > -900 && <TagAt s={s} id="E" label="ANTIBODY" x={DOOR.locks[4]} y={DOOR.lockY - 90} r={60} t={wall - 0.55} />}
    </>
  );
};
const ScreenM3: React.FC<{s: ShotNow}> = ({s}) => {
  // the LEFT police cell (the big one rises under the Virus: its tag would cover his face); after the zoom-in
  const grab = go(since(s, 'X1', 'freeze'), -0.2, 0.4);
  return <TagAt s={s} id="M3" label="WHITE BLOOD CELL" x={lerp(140, 360, grab)} y={lerp(620, 760, grab) + sway(s.t, 1.2, 0) * 6} r={330 * 0.4} t={s.t - 0.55} />;
};

// =================================================================== M3: the white-cell police
const ShotM3: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const grab = go(since(s, 'X1', 'freeze'), -0.2, 0.4);
  const shake = grab > 0.5 && since(s, 'E3') < 0.6 ? Math.sin(t * 26) * 5 : 0;
  const sulk = since(s, 'E3') >= 0;
  return (
    <>
      <BattlePlace t={t} factory={false} />
      <VirusAt s={s} x={560 + shake} y={820} size={260} rot={sulk ? -12 : shake} rest="sad" look={sulk ? [0, 0.8] : [-0.4, 0.2]} />
      {[[140, 620, false], [940, 620, true], [560, 1300, false]].map(([x0, y0, fl], i) => {
        const x = lerp(x0 as number, i === 2 ? 560 : i === 0 ? 360 : 760, grab), y = lerp(y0 as number, i === 2 ? 1090 : 760, grab);
        const wf = i === 2 ? bodyFace(s, 'whitecell', 4, 'angry') : {mood: blink(t, 10 + i) > 0.5 ? 'closed' as const : 'angry' as const, mouth: 'grit' as const};
        return <Put key={i} x={x} y={y + sway(t, 1.2, i) * 6} size={i === 2 ? 400 : 330} flip={!!fl} sq={i === 2 ? talk(s, 'whitecell') * 0.06 : 0}><WhiteCell mood={wf.mood} mouth={wf.mouth} look={[(560 - x) / 300, (820 - y) / 400]} /></Put>;
      })}
    </>
  );
};

export const V3_SHOTS: Record<string, ShotDef> = {
  A: {Scene: dived(ShotA), Screen: ScreenA, focus: (_w, s) => { const v = posA(s); return virusFocus(v.x, v.y, 430); }, view: slowPush(540, 1050, 1.0, 1.1)},
  B: {Scene: dived(ShotB), Screen: ScreenB, focus: () => ({x: 540, y: 800, r: 200}), view: slowPush(540, 900, 1.0, 1.08)},
  M2: {Scene: dived(ShotM2), Screen: ScreenM2, focus: () => ({x: 540, y: 830, r: 200}), view: slowPush(540, 960, 1.0, 1.07)},
  E: {Scene: dived(ShotE), Screen: ScreenE, focus: () => ({x: 600, y: 800, r: 200}), view: slowPush(540, 900, 1.0, 1.07)},
  M3: {Scene: dived(ShotM3), Screen: ScreenM3, focus: () => ({x: 560, y: 820, r: 200}), view: slowPush(560, 900, 1.04, 1.14)},
};
