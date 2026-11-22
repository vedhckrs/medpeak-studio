import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Motion9, MOTION9} from './motion9';
import {V8_FPS} from './play';

/** Engine v9 phase 4: the owner's 12 s motion test (render with pipeline/tools/c-samples.mjs motion). */
registerRoot(() => (
  <>
    <Composition id="Motion9" component={Motion9} fps={V8_FPS} width={1080} height={1920} durationInFrames={Math.round(MOTION9.seconds * V8_FPS)} />
  </>
));
