import React from 'react';
import {Composition, Still, type CalculateMetadataFunction} from 'remotion';
import {FPS, LONG, SHORT} from './brand/theme';
import {place} from './lib/timeline';
import {MedVideo} from './MedVideo';
import {Thumbnail} from './Thumbnail';
import {ActingDemo, BlueprintBoard, CastBoard, EmotionBoard, ModelSheet, SceneDemo, SetBoard, CameraBoard, PoseBoard, StageBoard} from './toons/Preview';
import {layoutToon, TOON_FPS, ToonPlayer, type Toon, type ToonProps} from './toons/Player';
import type {Video, VideoProps} from './types';
import toonDemo from '../videos/pill-without-water/toon.json';
import demo from '../videos/what-sugar-does-to-your-body/video.json';

const defaults: VideoProps = {video: demo as unknown as Video, timings: null, hasMusic: false, clips: []};

const toonDefaults: ToonProps = {toon: toonDemo as unknown as Toon, timings: null, sfx: [], music: null};
const toonLength: CalculateMetadataFunction<ToonProps> = ({props}) => ({durationInFrames: layoutToon(props.toon, props.timings).total});

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
    {/* MedPeak Toons (cartoon talking-organ Shorts): preview boards */}
    <Still id="ToonCast" component={CastBoard} width={1080} height={1920} />
    <Still id="ToonEmotions" component={EmotionBoard} width={1080} height={1920} defaultProps={{who: 'stomach'}} />
    <Still id="ToonSheet" component={ModelSheet} width={1920} height={1080} defaultProps={{who: 'stomach'}} />
    <Still id="ToonBlueprint" component={BlueprintBoard} width={1920} height={1080} />
    <Still id="ToonSets" component={SetBoard} width={1080} height={1920} />
    <Still id="ToonCamera" component={CameraBoard} width={1080} height={1920} />
    <Still id="ToonStage" component={StageBoard} width={1080} height={1920} />
    <Still id="ToonPoses" component={PoseBoard} width={1920} height={1600} defaultProps={{who: 'doctor'}} />
    <Composition id="ToonScenes" component={SceneDemo} fps={30} width={1080} height={1920} durationInFrames={540} />
    <Composition id="Toon" component={ToonPlayer} fps={TOON_FPS} width={1080} height={1920} durationInFrames={TOON_FPS * 10} defaultProps={toonDefaults} calculateMetadata={toonLength} />
    <Composition id="ToonActing" component={ActingDemo} fps={30} width={1080} height={1920} durationInFrames={360} />
  </>
);
