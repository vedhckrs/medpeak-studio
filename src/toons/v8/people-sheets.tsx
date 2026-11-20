// MedPeak Toons v8: the people approval sheets (lineup, one model sheet per person, hands).
import React from 'react';
import {Board, Caption, Panel, Ground, SKIN} from './kit';
import {PersonAt, HeadAt, HandAt, CAST, castById, EXPRS, HAND_KINDS, type PersonSpec, type PoseName, type Expr, type HandKind} from './people-rig';

const unitsTall = (s: PersonSpec) => s.build.heads * 2.15 * s.build.R;

// ------------------------------------------------------------------ test: Dr. Mira big
export const DoctorTest: React.FC = () => {
  const s = castById('doctor');
  const sc = 820 / unitsTall(s);
  return (
    <Board kicker="Test" title="Dr. Mira, turnaround">
      {(['front', 'three-quarter', 'side'] as const).map((v, i) => (
        <React.Fragment key={v}>
          <Ground x={330 + i * 620} y={1010} w={300} />
          <PersonAt spec={s} view={v} x={330 + i * 620} y={1010} scale={sc} />
        </React.Fragment>
      ))}
    </Board>
  );
};

// ------------------------------------------------------------------ A: the lineup
const ROLE: Record<string, string> = {};
export const PeopleLineup: React.FC = () => {
  const ground = 906;
  const sc = 1.56;
  const xs = CAST.map((_, i) => 56 + 113 + i * 226);
  return (
    <Board kicker="People · the cast" title="The MedPeak family, at true heights" note="One rig, one line, one eye: 8 people who read as one family, told apart by height, build, hair and clothes.">
      <Panel x={56} y={170} w={1808} h={864} label="The cast" />
      {CAST.map((s, i) => (
        <React.Fragment key={s.id}>
          <Ground x={xs[i]} y={ground} w={Math.min(unitsTall(s) * sc * 0.42, 180)} />
          <PersonAt spec={s} x={xs[i]} y={ground} scale={sc} />
          <Caption x={xs[i]} y={ground + 26} name={s.name} note={ROLE[s.id] ?? s.role} w={216} size={22} />
        </React.Fragment>
      ))}
    </Board>
  );
};

// ------------------------------------------------------------------ B: one model sheet per person
const SHEET_POSES: PoseName[] = ['rest', 'explain', 'point', 'thumbs', 'think', 'worried'];
const SHEET_EXPRS: Expr[] = ['neutral', 'happy', 'talking', 'worried', 'surprised', 'angry'];
const POSE_VIEW: Record<PoseName, 'front' | 'three-quarter'> = {rest: 'three-quarter', explain: 'front', point: 'three-quarter', thumbs: 'front', think: 'three-quarter', worried: 'front', clipboard: 'three-quarter', sit: 'three-quarter', wave: 'front'};
const POSE_LABEL: Record<PoseName, string> = {rest: 'rest', explain: 'explains', point: 'points', thumbs: 'thumbs up', think: 'thinks', worried: 'worried', clipboard: 'clipboard', sit: 'sits, with her clipboard', wave: 'waves'};

export const PersonSheet: React.FC<{id: string}> = ({id}) => {
  const s = castById(id);
  const isBaby = id === 'baby';
  const isDoc = id === 'doctor';
  // turnaround panel
  const tx = 56, tw = 900, ty = 168, th = 444;
  const tall = unitsTall(s);
  const bigSc = Math.min(380 / castById('dad').build.heads / 2.15 / castById('dad').build.R * 1.0, 1) ;
  const sc1 = Math.min(338 / (tall + 0.42 * s.build.R), isBaby ? 1.8 : 1.5);
  void bigSc;
  const ground1 = ty + th - 48;
  const views = isBaby ? (['front', 'three-quarter'] as const) : (['front', 'three-quarter', 'side'] as const);
  // expressions panel
  const ex = 980, ew = 884;
  const exprs: Expr[] = isBaby ? ['neutral', 'happy', 'surprised', 'crying', 'sleepy', 'talking'] : SHEET_EXPRS;
  // poses panel
  const py = 630, ph = 406;
  const poses: PoseName[] = isBaby ? [] : isDoc ? ['explain', 'point', 'thumbs', 'think', 'worried', 'clipboard', 'sit'] : SHEET_POSES;
  const pSc = Math.min(342 / (tall + 0.42 * s.build.R), 1.3);
  const pGround = py + ph - 46;
  const slot = (1808 - 40) / Math.max(1, poses.length);
  return (
    <Board kicker={`People · model sheet`} title={`${s.name}: ${s.role.split(':')[0].replace(/^the /, '')}`} note={s.role.split(':')[1]?.trim()}>
      <Panel x={tx} y={ty} w={tw} h={th} label={isBaby ? 'Front and three-quarter' : 'Turnaround'} />
      {views.map((v, i) => {
        const cx = tx + tw / (views.length * 2) + (i * tw) / views.length;
        return (
          <React.Fragment key={v}>
            <Ground x={cx} y={ground1} w={tall * sc1 * 0.42} />
            <PersonAt spec={s} view={v} x={cx} y={ground1} scale={sc1} />
            <Caption x={cx} y={ground1 + 14} name={v} size={19} />
          </React.Fragment>
        );
      })}
      <Panel x={ex} y={ty} w={ew} h={th} label="Expressions" />
      {exprs.map((e, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const cx = ex + ew / 6 + (col * ew) / 3;
        const cy = ty + 126 + row * 196;
        return (
          <React.Fragment key={e}>
            <HeadAt spec={s} x={cx} y={cy} px={45} expr={e} view="front" />
            <Caption x={cx} y={cy + 84} name={e} size={18} />
          </React.Fragment>
        );
      })}
      {poses.length > 0 && <Panel x={56} y={py} w={1808} h={ph} label="Poses" />}
      {poses.map((p, i) => {
        const cx = 76 + slot / 2 + i * slot;
        return (
          <React.Fragment key={p}>
            <Ground x={cx} y={pGround} w={tall * pSc * 0.4} />
            <PersonAt spec={s} view={POSE_VIEW[p]} pose={p} x={cx} y={pGround} scale={pSc} expr={p === 'worried' ? 'worried' : p === 'thumbs' ? 'happy' : p === 'explain' ? 'talking' : 'neutral'} look={p === 'think' ? [0.4, -0.7] : undefined} />
            <Caption x={cx} y={pGround + 12} name={POSE_LABEL[p]} size={18} />
          </React.Fragment>
        );
      })}
      {isBaby && <BabyExtra s={s} />}
    </Board>
  );
};
const BabyExtra: React.FC<{s: PersonSpec}> = ({s}) => {
  const ids = ['mom', 'baby', 'dad', 'kid'];
  const sc = 0.8;
  const g = 984;
  return (
    <>
      <Panel x={56} y={630} w={1808} h={406} label="With the family, at true size" />
      {ids.map((id, i) => {
        const p = castById(id);
        const x = 660 + i * 200;
        return (
          <React.Fragment key={id}>
            <Ground x={x} y={g} w={Math.min(unitsTall(p) * sc * 0.42, 110)} />
            <PersonAt spec={p} x={x} y={g} scale={sc} view="three-quarter" expr={id === s.id ? 'happy' : 'neutral'} />
            <Caption x={x} y={g + 8} name={p.name} size={16} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ C: the hands and the expression set
export const PeopleHands: React.FC = () => {
  const s = castById('doctor');
  const hy = 330;
  const exprs: Expr[] = ['neutral', 'happy', 'talking', 'worried', 'angry', 'surprised', 'sleepy'];
  return (
    <Board kicker="People · shared pieces" title="Hands and faces, the same for all 8" note="Six hand shapes (each also mirrored for the other side) and seven expressions, drawn once and shared by every person.">
      <Panel x={56} y={168} w={1808} h={400} label="Hands: palm, thumb, finger lines" />
      {HAND_KINDS.map((k: HandKind, i) => {
        const cx = 56 + 150 + i * 301;
        const rot = k === 'relaxed' ? 90 : k === 'open' ? -80 : -90;
        const y0 = k === 'relaxed' ? 352 : 350;
        return (
          <React.Fragment key={k}>
            <HandAt x={cx - 72} y={y0} px={136} kind={k} skin={SKIN.light} rot={rot} />
            <HandAt x={cx + 72} y={y0} px={136} kind={k} skin={SKIN.tan} rot={rot} mirror />
            <Caption x={cx} y={498} name={k} note="left · right" size={20} w={280} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={592} w={1808} h={444} label="Expressions" />
      {exprs.map((e, i) => {
        const cx = 56 + 129 + i * 258;
        return (
          <React.Fragment key={e}>
            <HeadAt spec={s} x={cx} y={800} px={74} expr={e} />
            <Caption x={cx} y={950} name={e} size={20} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
void EXPRS;
