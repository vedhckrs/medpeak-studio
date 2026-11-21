import React from 'react';
import {registerRoot, Still} from 'remotion';
import {V8RoomClinic, V8RoomKitchen, V8SceneC1, V8SceneC2, V8SceneD1, V8SceneD3} from './scenes-rooms';

registerRoot(() => (
  <>
    <Still id="V8RoomKitchen" component={V8RoomKitchen} width={1080} height={1920} />
    <Still id="V8RoomClinic" component={V8RoomClinic} width={1080} height={1920} />
    <Still id="V8SceneC1" component={V8SceneC1} width={1080} height={1920} />
    <Still id="V8SceneC2" component={V8SceneC2} width={1080} height={1920} />
    <Still id="V8SceneD1" component={V8SceneD1} width={1080} height={1920} />
    <Still id="V8SceneD3" component={V8SceneD3} width={1080} height={1920} />
  </>
));
