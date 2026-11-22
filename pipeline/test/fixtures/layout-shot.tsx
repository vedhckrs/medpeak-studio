/**
 * A synthetic shot for pipeline/test/layout.test.mjs: things at KNOWN places, so the layout log can be checked to the pixel.
 *  - a Put at (300, 500), 400 px: its figure space is 2 px a unit; kit Eyes at (0, -20), r 15 -> eyes centred at
 *    (270, 460) and (330, 460), radius 30 frame px
 *  - a nested <g transform="translate(400 0)"> inside a full-frame Layer with a kit Mouth at (100, 1000), w 40
 *    -> the mouth box x 480..520
 *  - a component that reports itself with useReport (a plate at 700..900 x 200..260)
 */
import React from 'react';
import {Eyes, Mouth} from '../../../src/toons/v8/kit';
import {useReport, type ShotDef} from '../../../src/toons/v8/play';
import {Layer, Put, Scene} from '../../../src/toons/v8/scene';

const Plate: React.FC = () => {
  useReport()({kind: 'plate', box: {x0: 700, y0: 200, x1: 900, y1: 260}, text: '3 DAYS'});
  return <div style={{position: 'absolute', left: 700, top: 200, width: 200, height: 60, background: '#ffd23f'}}>3 DAYS</div>;
};

const S: React.FC = () => (
  <Scene bg="#ee8f93">
    <Put x={300} y={500} size={400} who="liver"><circle cx={0} cy={0} r={80} fill="#aa4148" /><Eyes x={0} y={-20} r={15} /></Put>
    <Layer><g transform="translate(400 0)"><Mouth x={100} y={1000} w={40} kind="open" /></g></Layer>
    <Plate />
  </Scene>
);

export const LAYOUT_SHOT: ShotDef = {Scene: S, focus: () => ({x: 540, y: 960, r: 100})};
