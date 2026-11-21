// The kit shown on one board: what every v8 sheet is built from.
import React from 'react';
import {Board, Caption, CLOTH, Eyes, Fig, FLESH, INLINE, Mouth, NameTag, Panel, Shape, TinyArm, TinyLeg, type Mood, type MouthKind} from './kit';

const BLOB = 'M -52 -30 C -56 -72 -16 -86 20 -78 C 58 -70 74 -40 68 0 C 62 44 30 72 -10 70 C -48 68 -64 40 -60 8 C -59 -6 -53 -16 -52 -30 Z';
const PAD = 'M -50 -34 Q 0 -52 50 -34 Q 58 0 50 34 Q 0 50 -50 34 Q -58 0 -50 -34 Z';
const MOODS: Mood[] = ['open', 'happy', 'sad', 'angry', 'sleepy', 'bored', 'scared', 'closed', 'wink', 'dizzy'];
const MOUTHS: MouthKind[] = ['smile', 'flat', 'frown', 'o', 'open', 'big', 'grit', 'wavy', 'tongue'];

export const KitDemo: React.FC = () => (
  <Board kicker="Shared kit" title="The pieces every character is drawn with" note="One outline colour and thickness · flat colour with one darker tone · two white eyes, a small pupil, a tiny mouth">
    <Panel x={56} y={170} w={560} h={850} label="A body character" />
    <Fig x={336} y={580} size={560}>
      <TinyLeg from={[-20, 64]} to={[-24, 88]} fill={FLESH.salmon} foot={-1} />
      <TinyLeg from={[18, 64]} to={[22, 88]} fill={FLESH.salmon} />
      <TinyArm from={[-56, 6]} to={[-84, -14]} bend={[-78, 14]} fill={FLESH.salmon} hand="open" />
      <Shape d={BLOB} fill={FLESH.salmon}>
        <path d="M -30 44 q 30 14 58 0" {...INLINE} />
      </Shape>
      <TinyArm from={[62, 10]} to={[86, 36]} bend={[82, 8]} fill={FLESH.salmon} />
      <Eyes x={4} y={-28} r={15} look={[0.5, 0.2]} />
      <Mouth x={6} y={2} w={16} kind="smile" />
      <NameTag x={2} y={26} text="Sample" />
    </Fig>
    <Panel x={646} y={170} w={1218} h={410} label="Eyes: ten moods" />
    {MOODS.map((m, i) => (
      <React.Fragment key={m}>
        <Fig x={646 + 122 + (i % 5) * 243} y={170 + 120 + Math.floor(i / 5) * 180} size={230}>
          <Shape d={PAD} fill={i % 2 ? FLESH.coral : FLESH.salmon} shadow={0.8} />
          <Eyes x={0} y={-2} r={15} mood={m} look={m === 'scared' ? [0, 0] : [0.3, 0.1]} />
        </Fig>
        <Caption x={646 + 122 + (i % 5) * 243} y={170 + 178 + Math.floor(i / 5) * 180} name={m} size={18} />
      </React.Fragment>
    ))}
    <Panel x={646} y={610} w={1218} h={410} label="Mouths: nine shapes" />
    {MOUTHS.map((m, i) => (
      <React.Fragment key={m}>
        <Fig x={646 + 122 + (i % 5) * 243} y={610 + 120 + Math.floor(i / 5) * 180} size={230}>
          <Shape d={PAD} fill={[CLOTH.sky, FLESH.cream, FLESH.salmon][i % 3]} shadow={0.8} />
          <Eyes x={0} y={-12} r={11} />
          <Mouth x={0} y={16} w={22} kind={m} />
        </Fig>
        <Caption x={646 + 122 + (i % 5) * 243} y={610 + 178 + Math.floor(i / 5) * 180} name={m} size={18} />
      </React.Fragment>
    ))}
  </Board>
);
