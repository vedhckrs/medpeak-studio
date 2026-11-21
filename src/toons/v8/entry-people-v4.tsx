import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, Caption, Ground} from './kit';
import {PersonAt, castById, type PoseName} from './people-rig';

// v4 clothes (the owner, 2026-11-20): the doctor's coat first (lapels, pockets, buttons, fit, scrubs under),
// then seams, hems and folds for everyone. Same rig, same kit, same line.
type Item = [id: string, view: 'front' | 'three-quarter' | 'side', pose: PoseName, name: string, note: string];
const ROW: Item[] = [
  ['doctor', 'front', 'rest', 'Dr. Mira', 'coat: lapels, 3 buttons, pocket flaps, folds, flared hem, scrubs under'],
  ['doctor', 'three-quarter', 'explain', 'Dr. Mira, explaining', 'elbow creases, cuffs, drape lines'],
  ['mom', 'three-quarter', 'rest', 'Mom', 'blouse gathers, sleeve and skirt hems'],
  ['kid', 'front', 'point', 'Kid', 'tee star print, hems, shorts seams'],
  ['dad', 'three-quarter', 'rest', 'Dad', 'shirt placket and pocket, knee folds, trouser hems'],
  ['grandma', 'front', 'rest', 'Grandma', 'cardigan hem band, pocket flaps, skirt hem'],
];
const H = 640; // the doctor's height on the sheet; everyone at true height
const Clothes: React.FC = () => {
  const sc = H / (castById('doctor').build.heads * 2.15 * castById('doctor').build.R);
  return (
    <Board kicker="Rabies v4 · look sheet 7" title="Clothes: the doctor's coat first, then seams, hems and folds for all" page="v4 clothes"
      note="Drawn in the rig's body frame, so every view and pose gets the same seams and folds. Same kit and line as before.">
      {ROW.map(([id, view, pose, name, note], i) => {
        const x = [150, 420, 830, 1090, 1440, 1750][i], y = 950;
        return (
          <React.Fragment key={i}>
            <Ground x={x} y={y} w={230} />
            <PersonAt spec={castById(id)} view={view} pose={pose} x={x} y={y} scale={sc} />
            <Caption x={x} y={y + 22} name={name} note={note} w={250} size={20} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
registerRoot(() => <Still id="V4PeopleClothes" component={Clothes} width={1920} height={1080} />);
