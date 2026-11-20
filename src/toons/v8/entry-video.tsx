import React from 'react';
import {Composition, registerRoot, type CalculateMetadataFunction} from 'remotion';
import {ToonV8, v8Frames, type V8VideoProps} from './video';
import {V8_FPS} from './play';
import type {Toon} from '../director';
import rabies from '../../../videos/rabies/toon.json';

const defaults: V8VideoProps = {toon: rabies as unknown as Toon, timings: null, sfx: [], music: null};
const length: CalculateMetadataFunction<V8VideoProps> = ({props}) => ({durationInFrames: v8Frames(props.toon, props.timings)});

registerRoot(() => (
  <Composition id="ToonV8" component={ToonV8} fps={V8_FPS} width={1080} height={1920} durationInFrames={V8_FPS * 10} defaultProps={defaults} calculateMetadata={length} />
));
