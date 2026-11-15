import React from 'react';
import {Composition, Still, type CalculateMetadataFunction} from 'remotion';
import {FPS, LONG, SHORT} from './brand/theme';
import {place} from './lib/timeline';
import {MedVideo} from './MedVideo';
import {Thumbnail} from './Thumbnail';
import type {Video, VideoProps} from './types';
import demo from '../videos/what-sugar-does-to-your-body/video.json';

const defaults: VideoProps = {video: demo as unknown as Video, timings: null, hasMusic: false, clips: []};

const length: CalculateMetadataFunction<VideoProps> = ({props}) => ({
  durationInFrames: Math.max(FPS, place(props.video, props.timings, props.shortId).total),
});

export const Root: React.FC = () => (
  <>
    <Composition id="Long" component={MedVideo} fps={FPS} {...LONG} durationInFrames={FPS * 10} defaultProps={defaults} calculateMetadata={length} />
    <Composition id="Short" component={MedVideo} fps={FPS} {...SHORT} durationInFrames={FPS * 10}
      defaultProps={{...defaults, shortId: (demo as unknown as Video).shorts?.[0]?.id}} calculateMetadata={length} />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={defaults} />
    <Still id="ShortCover" component={Thumbnail} width={1080} height={1920} defaultProps={{...defaults, shortId: (demo as unknown as Video).shorts?.[0]?.id}} />
  </>
);
