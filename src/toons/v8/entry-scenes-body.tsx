import React from 'react';
import {registerRoot, Still} from 'remotion';
import {V8PlaceArm, V8PlaceArmWall, V8PlaceCaught, V8PlaceEntry, V8PlaceNerve, V8PlaceNerveFar, V8SceneA, V8SceneB, V8SceneE, V8SceneM2, V8SceneM3} from './scenes-body';

const S = {width: 1080, height: 1920};
registerRoot(() => (
  <>
    <Still id="V8SceneA" component={V8SceneA} {...S} />
    <Still id="V8SceneB" component={V8SceneB} {...S} />
    <Still id="V8SceneM2" component={V8SceneM2} {...S} />
    <Still id="V8SceneE" component={V8SceneE} {...S} />
    <Still id="V8SceneM3" component={V8SceneM3} {...S} />
    <Still id="V8PlaceArm" component={V8PlaceArm} {...S} />
    <Still id="V8PlaceArmWall" component={V8PlaceArmWall} {...S} />
    <Still id="V8PlaceNerve" component={V8PlaceNerve} {...S} />
    <Still id="V8PlaceNerveFar" component={V8PlaceNerveFar} {...S} />
    <Still id="V8PlaceEntry" component={V8PlaceEntry} {...S} />
    <Still id="V8PlaceCaught" component={V8PlaceCaught} {...S} />
  </>
));
