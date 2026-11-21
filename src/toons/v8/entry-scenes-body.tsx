import React from 'react';
import {registerRoot, Still} from 'remotion';
import {V8PlaceAxon, V8PlaceJunction, V8PlaceTissue, V8PlaceWound, V8SceneA, V8SceneB, V8SceneE, V8SceneM2, V8SceneM3} from './scenes-body';

const S = {width: 1080, height: 1920};
registerRoot(() => (
  <>
    <Still id="V8SceneA" component={V8SceneA} {...S} />
    <Still id="V8SceneB" component={V8SceneB} {...S} />
    <Still id="V8SceneM2" component={V8SceneM2} {...S} />
    <Still id="V8SceneE" component={V8SceneE} {...S} />
    <Still id="V8SceneM3" component={V8SceneM3} {...S} />
    <Still id="V8PlaceWound" component={V8PlaceWound} {...S} />
    <Still id="V8PlaceJunction" component={V8PlaceJunction} {...S} />
    <Still id="V8PlaceAxon" component={V8PlaceAxon} {...S} />
    <Still id="V8PlaceTissue" component={V8PlaceTissue} {...S} />
  </>
));
