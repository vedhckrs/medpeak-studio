import React from 'react';
import {Composition, registerRoot, type CalculateMetadataFunction} from 'remotion';
import {ToonV8, v8Frames, type V8VideoProps} from './video';
import {V8_FPS} from './play';
import {FONT, INK} from './kit';
import {CAPTION_KEY} from './hud';
import type {Toon} from '../director';
import rabies from '../../../videos/rabies/toon.json';

const defaults: V8VideoProps = {toon: rabies as unknown as Toon, timings: null, sfx: [], music: null};
const length: CalculateMetadataFunction<V8VideoProps> = ({props}) => ({durationInFrames: v8Frames(props.toon, props.timings)});

/**
 * The upload cover of a v8 video (2026-11-21): the frame at `at` seconds (no captions) with the package's cover
 * text in the caption style: white capitals, the kit's dark outline, the `accent` word yellow. Drawn by
 * pipeline/toon-package.mjs when the v8 render exists.
 */
/** `y`: the title's top (package.cover.y); left out, 1180. Set it when faces sit there (bee-sting: the guards; the title goes in the air). */
type CoverProps = V8VideoProps & {at: number; text: string; accent?: string; y?: number};
const CoverV8: React.FC<CoverProps> = ({at, text, accent, y = 1180, ...video}) => {
  const words = text.split(/\s+/);
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* frameAt, not <Freeze>: the cover of 2026-11-21 (no-sleep) came out as frame 0 under Freeze */}
      <ToonV8 {...video} bare frameAt={Math.round(at * V8_FPS)} />
      <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 26px',
        fontFamily: FONT, fontWeight: 900, fontSize: 128, lineHeight: 1.05, letterSpacing: 1, textAlign: 'center'}}>
        {words.map((w, i) => (
          <span key={i} style={{color: accent && clean(w) === clean(accent) ? CAPTION_KEY : '#ffffff', WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}`}}>{w.toUpperCase()}</span>
        ))}
      </div>
    </div>
  );
};
const coverDefaults: CoverProps = {...defaults, at: 1, text: 'One small scratch?', accent: 'scratch'};

registerRoot(() => (
  <>
    <Composition id="ToonV8" component={ToonV8} fps={V8_FPS} width={1080} height={1920} durationInFrames={V8_FPS * 10} defaultProps={defaults} calculateMetadata={length} />
    <Composition id="ToonV8Cover" component={CoverV8} fps={V8_FPS} width={1080} height={1920} durationInFrames={1} defaultProps={coverDefaults} />
  </>
));
