import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, Caption} from './kit';
import {PersonAt, type PoseName, type View} from './people-rig';
import {LIFTER} from './crea-gym';

/** The new people poses of the acting kit (2026-11-21), Mom in gym clothes, at video scale. */
const PoseTest: React.FC = () => {
  const list: [PoseName, View, 'right' | 'left'][] = [['cheeks', 'front', 'right'], ['cheeks', 'three-quarter', 'right'], ['shake', 'three-quarter', 'right'], ['shrug2', 'front', 'right'], ['shrug2', 'three-quarter', 'left']];
  return (
    <Board kicker="Acting kit · test" title="New poses: the take, shaking a bottle, a real shrug" page="acting kit · poses">
      {list.map(([pose, view, facing], i) => {
        const x = 200 + i * 380;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
              <PersonAt spec={LIFTER} pose={pose} view={view} facing={facing} expr="surprised" x={x} y={1000} scale={1.55} />
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
