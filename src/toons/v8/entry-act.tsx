import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, Caption} from './kit';
import {handAt, PersonAt, type PoseName, type View} from './people-rig';
import {Dumbbell, LIFTER, Shaker} from './crea-gym';
import {Put} from './scene';

/** The new people poses of the acting kit (2026-11-21), Mom in gym clothes, at video scale. */
const PoseTest: React.FC = () => {
  const list: [PoseName, View, 'right' | 'left'][] = [['cheeks', 'front', 'right'], ['cheeks', 'three-quarter', 'right'], ['shake', 'three-quarter', 'right'], ['press', 'three-quarter', 'right'], ['holdL', 'three-quarter', 'left']];
  return (
    <Board kicker="Acting kit · test" title="New poses: the take, shaking a bottle, a real shrug" page="acting kit · poses">
      {list.map(([pose, view, facing], i) => {
        const x = 200 + i * 380;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
              {(() => { const o = {spec: LIFTER, pose, view, facing, x, y: 1000, scale: 1.55}; const h = handAt(LIFTER, o); const hd = pose === 'press' || pose === 'holdL' || pose === 'shake' ? h.L : null; return <>{hd && <Put x={hd.palm[0]} y={hd.palm[1]} size={pose === 'press' ? 120 : 110}>{pose === 'press' ? <Dumbbell /> : <Shaker />}</Put>}<PersonAt {...o} expr="surprised" /></>; })()}
            </div>
            <Caption x={x} y={1010} name={`${pose} · ${view}`} size={18} w={340} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};

registerRoot(() => (
  <>
    <Still id="ActPoses" component={PoseTest} width={1920} height={1080} />
  </>
));
