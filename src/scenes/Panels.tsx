// One component per visual type. Each fills its parent and animates from local time `t` (s).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import {theme} from '../brand/theme';
import type {Visual} from '../types';
import {OrganArt} from './art/Organs';

const ease = (t: number, fps: number, delay = 0) => spring({frame: Math.max(0, (t - delay) * fps), fps, config: {damping: 16, mass: 0.7}});
const useLayout = () => {
  const {width, height, fps} = useVideoConfig();
  const portrait = height > width;
  return {portrait, u: Math.min(width, height) / 1080, fps, width, height};
};

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: theme.panel, border: `2px solid ${theme.line}`, borderRadius: 36, backdropFilter: 'blur(6px)', ...style}}>{children}</div>
);

const Title: React.FC<{v: Extract<Visual, {type: 'title'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  const s = ease(t, fps);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 90 * u, textAlign: 'center'}}>
      <div style={{fontSize: (portrait ? 104 : 112) * u, fontWeight: 900, lineHeight: 1.05, color: theme.white, transform: `scale(${0.85 + 0.15 * s})`, opacity: s, letterSpacing: -2}}>
        {v.text.split(' ').map((w, i) => (
          <span key={i} style={{color: v.accent && w.toLowerCase().includes(v.accent.toLowerCase()) ? theme.amber : undefined, opacity: ease(t, fps, i * 0.06), marginRight: '0.25em', display: 'inline-block'}}>{w}</span>
        ))}
      </div>
      {v.sub && <div style={{marginTop: 30 * u, fontSize: 46 * u, color: theme.muted, opacity: ease(t, fps, 0.35)}}>{v.sub}</div>}
    </AbsoluteFill>
  );
};

const Stat: React.FC<{v: Extract<Visual, {type: 'stat'}>; t: number}> = ({v, t}) => {
  const {u, fps} = useLayout();
  const p = interpolate(t, [0.1, 1.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 3});
  const n = (v.value * p).toFixed(v.decimals ?? (String(v.value).split('.')[1]?.length ?? 0));
  const c = v.color ?? theme.amber;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <div style={{fontSize: 260 * u, fontWeight: 900, color: c, lineHeight: 1, textShadow: `0 0 ${60 * u}px ${c}55`, transform: `scale(${0.8 + 0.2 * ease(t, fps)})`}}>
        {n}<span style={{fontSize: 110 * u}}>{v.unit ?? ''}</span>
      </div>
      <div style={{marginTop: 26 * u, fontSize: 54 * u, fontWeight: 600, color: theme.white, maxWidth: 1400 * u, opacity: ease(t, fps, 0.3)}}>{v.label}</div>
    </AbsoluteFill>
  );
};

const Compare: React.FC<{v: Extract<Visual, {type: 'compare'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  const max = Math.max(...v.items.map((i) => i.value));
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${(portrait ? 70 : 220) * u}px`}}>
      {v.items.map((it, i) => {
        const p = ease(t, fps, 0.15 + i * 0.35);
        const c = it.color ?? [theme.amber, theme.teal, theme.coral, theme.cyan][i % 4];
        return (
          <div key={i} style={{marginBottom: 46 * u, opacity: p}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 44 * u, color: theme.white, fontWeight: 600, marginBottom: 12 * u}}>
              <span>{it.label}</span><span style={{color: c, fontWeight: 900}}>{(it.value * p).toFixed(Number.isInteger(it.value) ? 0 : String(it.value).split('.')[1].length)}{it.unit ?? ''}</span>
            </div>
            <div style={{height: 46 * u, borderRadius: 23 * u, background: 'rgba(255,255,255,0.08)'}}>
              <div style={{height: '100%', width: `${(it.value / max) * 100 * p}%`, borderRadius: 23 * u, background: `linear-gradient(90deg, ${c}aa, ${c})`, boxShadow: `0 0 ${30 * u}px ${c}66`}} />
            </div>
          </div>
        );
      })}
      {v.caption && <div style={{fontSize: 38 * u, color: theme.muted, textAlign: 'center', marginTop: 10 * u, opacity: ease(t, fps, 1)}}>{v.caption}</div>}
    </AbsoluteFill>
  );
};

const OrganPanel: React.FC<{v: Extract<Visual, {type: 'organ'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  const s = ease(t, fps);
  return (
    <AbsoluteFill style={{flexDirection: portrait ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', gap: 40 * u, padding: 60 * u}}>
      <div style={{width: (portrait ? 960 : 1000) * u, height: (portrait ? 640 : 700) * u, transform: `scale(${0.9 + 0.1 * s}) translateY(${Math.sin(t * 0.8) * 8 * u}px)`, opacity: s}}>
        <OrganArt organ={v.organ} t={t} level={v.level ?? 0.5} highlight={v.highlight} />
      </div>
      {(v.label || v.callouts?.length) && (
        <div style={{maxWidth: (portrait ? 940 : 640) * u}}>
          {v.label && <div style={{fontSize: 70 * u, fontWeight: 900, color: theme.white, marginBottom: 24 * u, opacity: ease(t, fps, 0.2)}}>{v.label}</div>}
          {v.callouts?.map((c, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18 * u, fontSize: 40 * u, color: theme.white, marginBottom: 16 * u, opacity: ease(t, fps, 0.5 + i * 0.4), transform: `translateX(${(1 - ease(t, fps, 0.5 + i * 0.4)) * 40 * u}px)`}}>
              <div style={{width: 18 * u, height: 18 * u, borderRadius: 9 * u, background: theme.teal, flexShrink: 0}} />{c}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Flow: React.FC<{v: Extract<Visual, {type: 'flow'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  return (
    <AbsoluteFill style={{flexDirection: portrait ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', gap: 22 * u, padding: 60 * u}}>
      {v.steps.map((st, i) => {
        const p = ease(t, fps, i * 0.45);
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{fontSize: 70 * u, color: v.color ?? theme.teal, opacity: p, transform: portrait ? 'rotate(90deg)' : undefined}}>➜</div>}
            <Card style={{padding: `${30 * u}px ${38 * u}px`, fontSize: 44 * u, fontWeight: 700, color: theme.white, textAlign: 'center', maxWidth: (portrait ? 860 : 380) * u, opacity: p, transform: `translateY(${(1 - p) * 30 * u}px)`, borderColor: i === v.steps.length - 1 ? theme.amber : theme.line}}>{st}</Card>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const ListCard: React.FC<{v: Extract<Visual, {type: 'list'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  const s = ease(t, fps);
  return (
    <AbsoluteFill style={{flexDirection: portrait ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', gap: 60 * u, padding: 80 * u}}>
      <div style={{fontSize: 420 * u, fontWeight: 900, color: theme.amber, lineHeight: 0.9, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -12}deg)`, textShadow: `0 0 ${80 * u}px ${theme.amber}55`}}>{v.n}</div>
      <div style={{maxWidth: 900 * u, textAlign: portrait ? 'center' : 'left'}}>
        <div style={{fontSize: 40 * u, letterSpacing: 6, color: theme.teal, fontWeight: 800, opacity: ease(t, fps, 0.15)}}>NUMBER {['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'][v.n] ?? v.n}</div>
        <div style={{fontSize: 92 * u, fontWeight: 900, color: theme.white, lineHeight: 1.05, opacity: ease(t, fps, 0.3)}}>{v.title}</div>
        {v.sub && <div style={{fontSize: 44 * u, color: theme.muted, marginTop: 16 * u, opacity: ease(t, fps, 0.6)}}>{v.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{v: Extract<Visual, {type: 'chapter'}>; t: number}> = ({v, t}) => {
  const {u, fps} = useLayout();
  const w = interpolate(t, [0, 0.8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <div style={{fontSize: 38 * u, letterSpacing: 10, color: theme.teal, fontWeight: 800, opacity: ease(t, fps)}}>CHAPTER {v.n}</div>
      <div style={{width: `${40 * w}%`, height: 4 * u, background: theme.teal, margin: `${24 * u}px 0`}} />
      <div style={{fontSize: 110 * u, fontWeight: 900, color: theme.white, opacity: ease(t, fps, 0.2), padding: `0 ${80 * u}px`}}>{v.title}</div>
    </AbsoluteFill>
  );
};

const Twist: React.FC<{v: Extract<Visual, {type: 'twist'}>; t: number}> = ({v, t}) => {
  const {u, fps} = useLayout();
  const shake = t < 0.4 ? Math.sin(t * 90) * 10 * (0.4 - t) * u : 0;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `radial-gradient(circle, ${theme.coral}33, transparent 60%)`}}>
      <div style={{fontSize: 46 * u, letterSpacing: 12, color: theme.coral, fontWeight: 900, transform: `translateX(${shake}px)`}}>BUT HERE'S THE TWIST</div>
      <div style={{fontSize: 96 * u, fontWeight: 900, color: theme.white, textAlign: 'center', marginTop: 30 * u, padding: `0 ${90 * u}px`, opacity: ease(t, fps, 0.35)}}>{v.text}</div>
    </AbsoluteFill>
  );
};

const Fact: React.FC<{v: Extract<Visual, {type: 'fact'}>; t: number}> = ({v, t}) => {
  const {u, fps} = useLayout();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 100 * u}}>
      <Card style={{padding: 70 * u, maxWidth: 1500 * u, opacity: ease(t, fps), transform: `translateY(${(1 - ease(t, fps)) * 40 * u}px)`}}>
        <div style={{fontSize: 70 * u, fontWeight: 800, color: theme.white, lineHeight: 1.2}}>{v.text}</div>
        {v.source && <div style={{fontSize: 34 * u, color: theme.teal, marginTop: 30 * u, fontWeight: 600}}>{v.source}</div>}
      </Card>
    </AbsoluteFill>
  );
};

/** Sugar shown as teaspoons (sugar cubes) dropping in; a dashed line marks the daily limit. */
const Spoons: React.FC<{v: Extract<Visual, {type: 'spoons'}>; t: number}> = ({v, t}) => {
  const {u, fps, portrait} = useLayout();
  const cols = portrait ? 5 : 10;
  const size = (portrait ? 150 : 120) * u;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 22 * u}}>
        {Array.from({length: v.count}).map((_, i) => {
          const p = ease(t, fps, 0.1 + i * 0.09);
          const over = v.limit !== undefined && i >= v.limit;
          return (
            <div key={i} style={{width: size, height: size, borderRadius: 20 * u, background: over ? `linear-gradient(135deg, #ffe1e1, ${theme.coral})` : 'linear-gradient(135deg, #ffffff, #dfe9f3)', boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`, transform: `translateY(${(1 - p) * -300 * u}px) rotate(${(1 - p) * 20}deg)`, opacity: p}} />
          );
        })}
      </div>
      <div style={{marginTop: 50 * u, fontSize: 56 * u, fontWeight: 800, color: theme.white, textAlign: 'center', padding: `0 ${60 * u}px`, opacity: ease(t, fps, 0.6)}}>{v.label}</div>
      {v.limit !== undefined && <div style={{fontSize: 38 * u, color: theme.coral, marginTop: 14 * u, opacity: ease(t, fps, 1)}}>Red = over the WHO's ideal daily limit</div>}
    </AbsoluteFill>
  );
};

const Media: React.FC<{v: Extract<Visual, {type: 'clip' | 'image'}>; t: number; available: boolean}> = ({v, t, available}) => {
  const {u, fps} = useLayout();
  if (!available) {
    return <Title v={{type: 'title', text: v.label ?? 'Hero shot', sub: `clip slot: ${v.src}`}} t={t} />;
  }
  return (
    <AbsoluteFill>
      {v.type === 'clip' ? <OffthreadVideo src={staticFile(v.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(v.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + t * 0.01})`}} />}
      {v.label && <div style={{position: 'absolute', top: 60 * u, left: 60 * u, fontSize: 44 * u, fontWeight: 800, color: theme.white, background: 'rgba(6,21,40,0.6)', padding: `${12 * u}px ${24 * u}px`, borderRadius: 18 * u, opacity: ease(t, fps)}}>{v.label}</div>}
    </AbsoluteFill>
  );
};

export const Panel: React.FC<{v: Visual; t: number; clips: string[]}> = ({v, t, clips}) => {
  switch (v.type) {
    case 'title': return <Title v={v} t={t} />;
    case 'stat': return <Stat v={v} t={t} />;
    case 'compare': return <Compare v={v} t={t} />;
    case 'organ': return <OrganPanel v={v} t={t} />;
    case 'flow': return <Flow v={v} t={t} />;
    case 'list': return <ListCard v={v} t={t} />;
    case 'chapter': return <Chapter v={v} t={t} />;
    case 'twist': return <Twist v={v} t={t} />;
    case 'fact': return <Fact v={v} t={t} />;
    case 'spoons': return <Spoons v={v} t={t} />;
    case 'clip':
    case 'image': return <Media v={v} t={t} available={clips.includes(v.src)} />;
    default: return null;
  }
};
