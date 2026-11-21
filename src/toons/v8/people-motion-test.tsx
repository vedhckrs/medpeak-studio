// MedPeak Toons v8: test stills for the animatable people rig (talk, blink, pose blends, facing).
// Not an approval sheet and not in the pipeline sheet list: these exist to check motion step by step.
import React from 'react';
import {Board, Caption, Ground} from './kit';
import {PersonAt, HeadAt, castById, type PoseName, type View, type Expr} from './people-rig';

const STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const ROWS: {id: string; view: View; expr: Expr}[] = [
  {id: 'mom', view: 'front', expr: 'worried'},
  {id: 'doctor', view: 'three-quarter', expr: 'neutral'},
  {id: 'kid', view: 'side', expr: 'angry'},
];

const HeadGrid: React.FC<{what: 'talk' | 'blink'}> = ({what}) => (
  <Board kicker="Motion test" title={what === 'talk' ? 'talk 0 .. 1 (three views, three feelings)' : 'blink 0 .. 1 (three views, glasses)'}>
    {ROWS.map((r, j) => STEPS.map((k, i) => (
      <React.Fragment key={r.id + i}>
        <HeadAt spec={castById(r.id)} x={190 + i * 300} y={300 + j * 270} px={70} view={r.view} expr={r.expr} talk={what === 'talk' ? k : undefined} blink={what === 'blink' ? k : undefined} />
        {j === 0 && <Caption x={190 + i * 300} y={160} name={`${what} ${k}`} size={18} />}
      </React.Fragment>
    )))}
  </Board>
);
export const TalkTest: React.FC = () => <HeadGrid what="talk" />;
export const BlinkTest: React.FC = () => <HeadGrid what="blink" />;

const BlendGrid: React.FC<{a: PoseName; b: PoseName; view: View}> = ({a, b, view}) => (
  <Board kicker="Motion test" title={`pose blend ${a} to ${b}, k 0 .. 1 (${view})`}>
    {['mom', 'doctor', 'kid'].map((id, j) => STEPS.map((k, i) => {
      const s = castById(id);
      const x = 190 + i * 300, y = 450 + j * 300;
      return (
        <React.Fragment key={id + i}>
          <Ground x={x} y={y} w={90} />
          <PersonAt spec={s} x={x} y={y} scale={0.7} view={view} pose={{a, b, k}} />
          {j === 0 && <Caption x={x} y={140} name={`k ${k}`} size={18} />}
        </React.Fragment>
      );
    }))}
  </Board>
);
export const BlendRestPoint: React.FC = () => <BlendGrid a="rest" b="point" view="three-quarter" />;
export const BlendExplainThumbs: React.FC = () => <BlendGrid a="explain" b="thumbs" view="front" />;

export const FacingTest: React.FC = () => {
  const people = ['doctor', 'mom', 'dad', 'kid', 'grandpa', 'grandma', 'patient', 'baby'];
  const cols: {view: View; facing: 'right' | 'left'}[] = [
    {view: 'three-quarter', facing: 'right'}, {view: 'three-quarter', facing: 'left'}, {view: 'side', facing: 'right'}, {view: 'side', facing: 'left'},
  ];
  return (
    <Board kicker="Motion test" title="facing right / left (three-quarter, side)">
      {people.map((id, j) => cols.map((c, i) => {
        const x = 140 + (j % 3) * 610 + i * 140, y = 440 + Math.floor(j / 3) * 295;
        return <PersonAt key={id + i} spec={castById(id)} x={x} y={y} scale={0.6} view={c.view} facing={c.facing} pose={id === 'doctor' ? 'clipboard' : 'rest'} />;
      }))}
    </Board>
  );
};
