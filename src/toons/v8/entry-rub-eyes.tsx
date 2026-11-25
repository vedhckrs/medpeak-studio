import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Mini} from './sheets-v4';
import {KnucklesSheet, MomentCalm, MomentClinic, MomentCone, MomentGerms, MomentHook} from './rub-eyes-art';

const K = 0.4;
const EyePlaces1: React.FC = () => (
  <Board kicker="Rub your eyes · engine v9 · sheet 1" title="Inside the eye: the rub, the germs, months later, the end"
    note="The opening rules: the whole eye fills the frame in a side cut-away (the face on the white, the clear dome at the front, the iris and lens behind it, the lids and lashes, the optic nerve at the back), red and itchy from frame 1; the Knuckles press down on the lid. Germs hop off the knuckles. After the MONTHS LATER card the same framing: the dome thinner and bulging into a point (PubMed review: vigorous and prolonged rubbing may lead to corneal thinning and keratoconus). The end: calm."
    page="rub your eyes · eye">
    <Mini x={56} y={240} k={K} label="A1 · HOOK: RUB, RUB, RUB!"><MomentHook /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="A4 · I BROUGHT FRIENDS"><MomentGerms /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="B · MONTHS LATER"><MomentCone /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="E · NO MORE RUB"><MomentCalm /></Mini>
  </Board>
);
const EyePlaces2: React.FC = () => (
  <Board kicker="Rub your eyes · engine v9 · sheet 2" title="The Knuckles, the new intruder, and the clinic"
    note="The Knuckles: a giant fist seen knuckles-first, one face across the back of the hand, the thumb on the side, Kid's skin; cheeky, then giving up. The clinic: a grey wall (new for this video), Kid with red itchy eyes and the new doctor (a two-person shot)."
    page="rub your eyes · knuckles and clinic">
    <Mini x={500} y={240} k={K} label="KNUCKLES · FOUR MOODS"><KnucklesSheet /></Mini>
    <Mini x={500 + 452} y={240} k={K} label="D · THE CLINIC"><MomentClinic /></Mini>
  </Board>
);
registerRoot(() => (
  <>
    <Still id="EyePlaces1" component={EyePlaces1} width={1920} height={1080} />
    <Still id="EyePlaces2" component={EyePlaces2} width={1920} height={1080} />
  </>
));
