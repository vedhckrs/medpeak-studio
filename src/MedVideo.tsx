import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {END_SCREEN_SECONDS, theme} from './brand/theme';
import {panels, place, speechFrames, type Placed} from './lib/timeline';
import {Panel} from './scenes/Panels';
import type {Scene, Timings, Video, VideoProps, Visual, Word} from './types';

const SFX_FOR: Record<string, string> = {chapter: 'impact', stat: 'impact', list: 'impact', twist: 'impact', organ: 'bubble', compare: 'tick', spoons: 'pop', flow: 'pop', title: 'whoosh', fact: 'pop', clip: 'whoosh', image: 'whoosh'};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 20%, ${theme.bg2}, ${theme.bg} 70%)`}}>
      {Array.from({length: 40}).map((_, i) => {
        const x = (random(`x${i}`) * width + f * (0.1 + random(`s${i}`) * 0.3)) % width;
        const y = (random(`y${i}`) * height - f * (0.15 + random(`v${i}`) * 0.25) + height * 10) % height;
        const r = 2 + random(`r${i}`) * 5;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: i % 5 === 0 ? theme.teal : theme.cyan, opacity: 0.12 + random(`o${i}`) * 0.2}} />;
      })}
    </AbsoluteFill>
  );
};

/** Word-by-word captions: the current phrase, the spoken word in amber. */
const Captions: React.FC<{words: Word[]; portrait: boolean}> = ({words, portrait}) => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = f / fps;
  const groups = useMemo(() => {
    const out: Word[][] = [];
    let cur: Word[] = [];
    for (const w of words) {
      cur.push(w);
      if (cur.length >= (portrait ? 4 : 7) || /[.,?!:;]$/.test(w.w)) { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    return out;
  }, [words, portrait]);
  const g = groups.find((gr) => t >= gr[0].start - 0.05 && t <= gr[gr.length - 1].end + 0.25);
  if (!g) return null;
  const u = width / (portrait ? 1080 : 1920);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: portrait ? 470 * u : 60 * u, display: 'flex', justifyContent: 'center', padding: `0 ${60 * u}px`}}>
      <div style={{background: 'rgba(4,14,28,0.72)', borderRadius: 22 * u, padding: `${14 * u}px ${28 * u}px`, fontSize: (portrait ? 70 : 46) * u, fontWeight: 800, color: theme.white, textAlign: 'center', lineHeight: 1.25}}>
        {g.map((w, i) => (
          <span key={i} style={{color: t >= w.start && t <= w.end + 0.08 ? theme.amber : theme.white}}>{w.w} </span>
        ))}
      </div>
    </div>
  );
};

/** Captions need words; before the voice exists, spread the text evenly as a preview. */
const wordsFor = (scene: Scene, timings: Timings | null, seconds: number): Word[] => {
  const real = timings?.scenes[scene.id]?.words;
  if (real?.length) return real;
  const ws = scene.text.split(/\s+/);
  const step = (seconds - 0.3) / ws.length;
  return ws.map((w, i) => ({w, start: i * step, end: (i + 1) * step}));
};

const SceneView: React.FC<{p: Placed; video: Video; timings: Timings | null; clips: string[]; portrait: boolean}> = ({p, video, timings, clips, portrait}) => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const list: Visual[] = panels(p.scene);
  const per = p.frames / list.length;
  const u = width / (portrait ? 1080 : 1920);
  const src = (p.scene.sources ?? []).map((id) => video.sources.find((s) => s.id === id)?.label).filter(Boolean).join(' · ');
  const voice = timings?.scenes[p.scene.id]?.file;
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'})}}>
      {list.map((v, i) => (
        <Sequence key={i} from={Math.round(i * per)} durationInFrames={Math.ceil(per) + (i < list.length - 1 ? 8 : 0)}>
          <PanelFade frames={Math.ceil(per)} first={i === 0}>
            {/* the picture zone stays clear of captions: Shorts use the top 1220 px, long videos stop above the caption bar */}
            <div style={{position: 'absolute', left: 0, right: 0, top: portrait ? 110 * u : 60 * u, height: portrait ? 1110 * u : 860 * u}}>
              <Panel v={v} t={Math.max(0, f - i * per) / fps} clips={clips} />
            </div>
          </PanelFade>
          <Audio src={staticFile(`sfx/${i === 0 ? p.scene.sfx ?? SFX_FOR[v.type] ?? 'whoosh' : 'whoosh'}.wav`)} volume={i === 0 ? 0.32 : 0.18} />
        </Sequence>
      ))}
      {voice && <Audio src={staticFile(voice)} volume={1} />}
      {src && <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', bottom: portrait ? 380 * u : 22 * u, fontSize: (portrait ? 30 : 22) * u, color: theme.muted, opacity: 0.9}}>Source: {src}</div>}
      <Captions words={wordsFor(p.scene, timings, p.frames / fps)} portrait={portrait} />
    </AbsoluteFill>
  );
};

const PanelFade: React.FC<{frames: number; first: boolean; children: React.ReactNode}> = ({frames, first, children}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const s = interpolate(f, [0, frames], [1, 1.04]);
  return <AbsoluteFill style={{opacity: o, transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

const Chrome: React.FC<{placed: Placed[]; spoken: number; video: Video; portrait: boolean}> = ({placed, spoken, video, portrait}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const u = width / (portrait ? 1080 : 1920);
  if (f >= spoken) return null;
  const cur = [...placed].reverse().find((p) => f >= p.from);
  const chapter = cur?.scene.chapter ? video.chapters.find((c) => c.id === cur.scene.chapter)?.title : undefined;
  const starts = video.chapters.map((c) => placed.find((p) => p.scene.chapter === c.id)?.from).filter((x): x is number => x !== undefined);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: portrait ? 0 : undefined, bottom: portrait ? undefined : 0, height: 8 * u, background: 'rgba(255,255,255,0.08)'}}>
        <div style={{width: `${(f / spoken) * 100}%`, height: '100%', background: theme.teal}} />
        {!portrait && starts.map((s, i) => <div key={i} style={{position: 'absolute', left: `${(s / spoken) * 100}%`, top: 0, width: 4 * u, height: '100%', background: theme.bg}} />)}
      </div>
      {!portrait && chapter && (
        <div style={{position: 'absolute', top: 36 * u, left: 44 * u, fontSize: 26 * u, fontWeight: 700, letterSpacing: 3, color: theme.muted}}>{chapter.toUpperCase()}</div>
      )}
      <div style={{position: 'absolute', top: (portrait ? 40 : 30) * u, right: 44 * u, fontSize: (portrait ? 32 : 24) * u, fontWeight: 800, color: theme.white, opacity: 0.55}}>MedPeak Health</div>
    </>
  );
};

const EndScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const u = width / 1920;
  const o = interpolate(f, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const box = (x: number) => <div style={{position: 'absolute', left: x * u, top: 300 * u, width: 620 * u, height: 350 * u, borderRadius: 24 * u, border: `3px solid ${theme.line}`, background: theme.panel}} />;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: 140 * u, width: '100%', textAlign: 'center', fontSize: 64 * u, fontWeight: 900, color: theme.white}}>Keep watching</div>
      {box(180)}{box(1120)}
      <div style={{position: 'absolute', left: (width - 200 * u) / 2, top: 400 * u, width: 200 * u, height: 200 * u, borderRadius: 100 * u, border: `4px solid ${theme.teal}`}} />
      <div style={{position: 'absolute', bottom: 150 * u, width: '100%', textAlign: 'center', fontSize: 44 * u, color: theme.muted}}>Subscribe @MedPeakHealth · new 3D medical explainers every week</div>
      <div style={{position: 'absolute', bottom: 60 * u, width: '100%', textAlign: 'center', fontSize: 26 * u, color: theme.muted, opacity: 0.7}}>For education only, not medical advice.</div>
    </AbsoluteFill>
  );
};

export const MedVideo: React.FC<VideoProps> = ({video, timings, shortId, hasMusic, clips = []}) => {
  const {width, height, fps} = useVideoConfig();
  const portrait = height > width;
  const {placed, spoken, total} = useMemo(() => place(video, timings, shortId), [video, timings, shortId]);
  const speech = useMemo(() => speechFrames(placed, timings), [placed, timings]);
  const musicVolume = (f: number) => {
    const talking = speech.some(([a, b]) => f >= a && f <= b);
    const base = talking ? 0.045 : 0.12;
    const fadeIn = interpolate(f, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
    const fadeOut = interpolate(f, [total - 90, total], [1, 0], {extrapolateLeft: 'clamp'});
    return base * fadeIn * fadeOut;
  };
  return (
    <AbsoluteFill style={{fontFamily: theme.font, color: theme.white}}>
      <Background />
      {placed.map((p) => (
        <Sequence key={p.scene.id} from={p.from} durationInFrames={p.frames}>
          <SceneView p={p} video={video} timings={timings} clips={clips} portrait={portrait} />
        </Sequence>
      ))}
      {!shortId && (
        <Sequence from={spoken} durationInFrames={END_SCREEN_SECONDS * fps}><EndScreen /></Sequence>
      )}
      <Chrome placed={placed} spoken={spoken} video={video} portrait={portrait} />
      {hasMusic && <Audio src={staticFile(`videos/${video.slug}/music.mp3`)} loop volume={musicVolume} />}
    </AbsoluteFill>
  );
};
