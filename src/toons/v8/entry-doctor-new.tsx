// MedPeak Toons v8: the look sheets of THE NEW DOCTOR, second version (doctor-new.tsx), for the owner's approval (2026-11-24).
//   node pipeline/toon-v8-sheets.mjs doctor-new      -> out/toons/sheets-v8/doctor-new-1.jpg .. -3.jpg
import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, Caption, Ground, Panel, SKIN, V9} from './kit';
import {castById, PersonAt} from './people-rig';
import {DoctorAt, DoctorHeadAt, type DoctorProps, type DrExpr, type DrExtra, type DrFacing, type DrPoseIn, type DrView} from './doctor-new';

/** A cut-out of her at `k` px per unit: the point `u` (her own units, facing right) sits in the middle of the box. */
const Crop: React.FC<{x: number; y: number; w: number; h: number; u: [number, number]; k: number} & Omit<DoctorProps, 'px' | 'headOnly'>> = ({x, y, w, h, u, k, ...p}) => {
  const left = p.view === 'three-quarter' && p.facing === 'left';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 14, background: '#f1fbfb', border: '2px solid #ece3d6', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: -x, top: -y}}><DoctorAt x={x + w / 2 - (left ? -u[0] : u[0]) * k} y={y + h / 2 - u[1] * k} scale={k} {...p} /></div>
    </div>
  );
};

// ------------------------------------------------------------------ sheet 1: views, poses, face
const Sheet1: React.FC = () => {
  const sc = 1.76, gy = 972;
  const views: [string, DrView, DrFacing][] = [['front', 'front', 'right'], ['three-quarter, facing right', 'three-quarter', 'right'], ['three-quarter, facing left', 'three-quarter', 'left']];
  const poses: [string, DrPoseIn, DrView, DrFacing][] = [['rest', 'rest', 'three-quarter', 'right'], ['explains', 'explain', 'three-quarter', 'right'], ['explains (front)', 'explain', 'front', 'right'], ['points', 'point', 'three-quarter', 'left']];
  const px = [1140, 1290, 1470, 1790];
  const faces: [string, {expr?: DrExpr; blink?: number; talk?: number; look?: [number, number]; view?: DrView; facing?: DrFacing}][] = [
    ['neutral', {}], ['happy', {expr: 'happy'}], ['concerned', {expr: 'concerned'}], ['blink', {blink: 1}],
    ['talking: a little', {talk: 0.3, view: 'three-quarter'}], ['talking: half', {talk: 0.6, view: 'three-quarter'}], ['talking: wide', {talk: 1, view: 'three-quarter'}], ['looks at someone', {view: 'three-quarter', facing: 'left', look: [0.75, 0.3]}],
  ];
  return (
    <Board kicker="People · the new doctor, version 2 · sheet 1 of 3" title="The new doctor: an adult, a real coat, one clean outline"
      note="Redrawn after your notes: a grown woman (smaller head, longer face, longer neck), a tailored white coat with a collar, and the coat and its sleeves drawn as ONE shape, so no line crosses the shoulder.">
      <Panel x={56} y={168} w={1000} h={876} label="Real views (not mirrored: parting and buttons stay on her own side)" />
      {views.map(([label, view, facing], i) => (
        <React.Fragment key={label}>
          <Ground x={230 + i * 326} y={gy} w={190} />
          <DoctorAt x={230 + i * 326} y={gy} scale={sc} view={view} facing={facing} />
          <Caption x={230 + i * 326} y={gy + 22} name={label} size={19} w={320} />
        </React.Fragment>
      ))}
      <Panel x={1076} y={168} w={788} h={436} label="Poses" />
      {poses.map(([label, pose, view, facing], i) => (
        <React.Fragment key={label}>
          <Ground x={px[i]} y={556} w={92} />
          <DoctorAt x={px[i]} y={556} scale={0.84} view={view} facing={facing} pose={pose} talk={pose === 'explain' ? 0.5 : undefined} />
          <Caption x={px[i]} y={568} name={label} size={16} w={170} />
        </React.Fragment>
      ))}
      <Panel x={1076} y={620} w={788} h={424} label="Face: feelings, a blink, talking" />
      {faces.map(([label, f], i) => {
        const x = 1176 + (i % 4) * 196, y = 742 + Math.floor(i / 4) * 196;
        return (
          <React.Fragment key={label}>
            <DoctorHeadAt x={x} y={y} px={40} {...f} />
            <Caption x={x} y={y + 76} name={label} size={15} w={190} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};

// ------------------------------------------------------------------ sheet 2: close-ups at the size she has in a video
const VID = 3.4 * 1.35; // her scale in the clinic shot times the shot's zoom: px per unit on the phone screen
const Sheet2: React.FC = () => {
  const r1 = 168, h1 = 440, r2 = 668, h2 = 340, w2 = 348;
  const lab = (x: number, w: number, y: number, name: string) => <Caption x={x + w / 2} y={y} name={name} size={17} w={w} />;
  return (
    <Board kicker="People · the new doctor, version 2 · sheet 2 of 3" title="Close-ups at full video size: face, shoulders, chest, hands"
      note="Cut out at the exact size she has on the phone screen in the clinic shot. Check here: the adult face, the shoulder with no line across it, the collar, each hand.">
      <Crop x={56} y={r1} w={390} h={h1} u={[0, -346]} k={VID} view="front" />{lab(56, 390, r1 + h1 + 6, 'face, front')}
      <Crop x={462} y={r1} w={390} h={h1} u={[10, -346]} k={VID} view="three-quarter" facing="left" talk={0.55} look={[0.7, 0.25]} />{lab(462, 390, r1 + h1 + 6, 'face, three-quarter, talking')}
      <Crop x={868} y={r1} w={520} h={h1} u={[0, -258]} k={VID} view="front" />{lab(868, 520, r1 + h1 + 6, 'shoulders and chest, front')}
      <Crop x={1404} y={r1} w={460} h={h1} u={[2, -258]} k={VID} view="three-quarter" facing="left" />{lab(1404, 460, r1 + h1 + 6, 'shoulders and chest, three-quarter')}

      <Crop x={56} y={r2} w={w2} h={h2} u={[-46, -158]} k={VID} view="front" />{lab(56, w2, r2 + h2 + 6, 'her right hand at rest')}
      <Crop x={56 + 365} y={r2} w={w2} h={h2} u={[-26, -158]} k={VID} view="three-quarter" />{lab(56 + 365, w2, r2 + h2 + 6, 'the near hand lies on the coat')}
      <Crop x={56 + 730} y={r2} w={w2} h={h2} u={[38, -158]} k={VID} view="three-quarter" />{lab(56 + 730, w2, r2 + h2 + 6, 'the far hand, beside the coat')}
      <Crop x={56 + 1095} y={r2} w={w2} h={h2} u={[72, -252]} k={VID} view="three-quarter" pose="explain" />{lab(56 + 1095, w2, r2 + h2 + 6, 'open hand (explains)')}
      <Crop x={56 + 1460} y={r2} w={w2} h={h2} u={[122, -246]} k={VID} view="three-quarter" pose="point" />{lab(56 + 1460, w2, r2 + h2 + 6, 'pointing hand')}
    </Board>
  );
};

// ------------------------------------------------------------------ sheet 3: with the family, and two choices
const Sheet3: React.FC = () => {
  const sc = 1.56, gy = 936;
  const mom = castById('mom'), kid = castById('kid'), dad = castById('dad');
  const tones: [string, string][] = [['as drawn', SKIN.brown], ['lighter', SKIN.tan], ['lightest', SKIN.light]];
  const extras: [string, DrExtra][] = [['A · plain coat (as drawn)', 'none'], ['B · one neat stethoscope', 'steth'], ['C · a small badge', 'badge']];
  return (
    <Board kicker="People · the new doctor, version 2 · sheet 3 of 3" title="Next to Mom and Dad, and two choices for you"
      note="Left: she stands between Mom and Dad at true heights, an adult among adults (one line, one eye, one hand). Right: one doctor's sign on the chest if you want it, and her skin tone.">
      <Panel x={56} y={168} w={1010} h={876} label="With the family, at true heights" />
      <V9>
        {([[170, 'mom', 'right'], [640, 'dad', 'left'], [900, 'kid', 'left']] as const).map(([x, id, f]) => {
          const s = id === 'mom' ? mom : id === 'kid' ? kid : dad;
          return <React.Fragment key={id}><Ground x={x} y={gy} w={170} /><PersonAt spec={s} x={x} y={gy} scale={sc} view="three-quarter" facing={f} /></React.Fragment>;
        })}
      </V9>
      <Ground x={400} y={gy} w={170} />
      <DoctorAt x={400} y={gy} scale={sc} view="three-quarter" facing="right" />
      {[[170, 'Mom'], [400, 'the new doctor'], [640, 'Dad'], [900, 'Kid']].map(([x, n]) => <Caption key={n} x={x as number} y={gy + 22} name={n as string} size={20} />)}

      <Panel x={1086} y={168} w={778} h={470} label="Choice 1: one doctor's sign on the chest" />
      {extras.map(([n, e], i) => (
        <React.Fragment key={e}>
          <Crop x={1106 + i * 250} y={212} w={238} h={360} u={[0, -292]} k={2.5} view="front" extra={e} />
          <Caption x={1106 + i * 250 + 119} y={580} name={n} size={16} w={246} />
        </React.Fragment>
      ))}
      <Panel x={1086} y={654} w={778} h={390} label="Choice 2: her skin tone" />
      {tones.map(([n, c], i) => (
        <React.Fragment key={n}>
          <DoctorHeadAt x={1226 + i * 250} y={830} px={62} skin={c} view="three-quarter" />
          <Caption x={1226 + i * 250} y={966} name={n} size={18} w={240} />
        </React.Fragment>
      ))}
    </Board>
  );
};

registerRoot(() => (
  <>
    <Still id="DoctorNew1" component={Sheet1} width={1920} height={1080} />
    <Still id="DoctorNew2" component={Sheet2} width={1920} height={1080} />
    <Still id="DoctorNew3" component={Sheet3} width={1920} height={1080} />
  </>
));
