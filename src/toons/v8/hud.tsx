/**
 * MedPeak Toons, look v8: what is laid on the SCREEN after the camera (it never zooms or gets cut).
 *
 * - WordCaption: one spoken word at a time, no box (the owner, 2026-11-20). White capitals with the kit's
 *   dark outline and a flat dark drop (no blur); the key word of a line is yellow and bigger. Each word pops.
 * - Icons instead of text tags (the owner, 2026-11-20): Sunrise ("that morning"), Stopwatch ("15 minutes"),
 *   Calendar ("2-3 months"), VaccineShield ("after the vaccine"), Warning ("almost always fatal").
 *   Each is drawn with the kit (one outline, flat colour plus one darker tone) in the 200-unit figure space
 *   and moves with `t`, the seconds since it appeared. `IconBadge` places one on the screen with a pop.
 */
import React, {useId} from 'react';
import {Img, staticFile} from 'remotion';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, INLINE, OUTLINE, shade, tint} from './kit';
import {Dog} from './animals';
import {Brain} from './organs-a';
import {Virus} from './germs';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** 0 -> 1 with a small overshoot: the pop of a word or an icon. */
export const popIn = (t: number, dur = 0.22) => {
  const u = clamp01(t / dur);
  return u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.16;
};

// ------------------------------------------------------------------ the caption
export const CAPTION_Y = 1470;
export const CAPTION_KEY = '#ffd23f';

export const WordCaption: React.FC<{word: string; t: number; isKey?: boolean; y?: number}> = ({word, t, isKey, y = CAPTION_Y}) => {
  const k = popIn(t, isKey ? 0.26 : 0.16);
  const size = isKey ? 132 : 108;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{
        transform: `translateY(-50%) scale(${(0.55 + 0.45 * k).toFixed(3)}) rotate(${isKey ? -3 : 0}deg)`,
        opacity: clamp01(k * 3),
        fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: 1,
        color: isKey ? CAPTION_KEY : '#ffffff',
        WebkitTextStroke: `${isKey ? 14 : 12}px ${INK}`, paintOrder: 'stroke fill',
        textShadow: `0 ${isKey ? 10 : 8}px 0 ${INK}`,
        whiteSpace: 'nowrap',
      }}>{word.toUpperCase()}</div>
    </div>
  );
};

// ------------------------------------------------------------------ the icons (200-unit figure space)
const SUN = '#ffc93c';

export const Sunrise: React.FC<{t?: number}> = ({t = 0}) => {
  const rise = clamp01(t / 0.6);
  const sy = 40 - 34 * (1 - Math.pow(1 - rise, 3));
  const turn = t * 18;
  return (
    <g>
      <circle cx={0} cy={0} r={92} fill="#bfe3f5" {...EDGE} />
      <clipPath id="sr-clip"><circle cx={0} cy={0} r={90} /></clipPath>
      <g clipPath="url(#sr-clip)">
        <g transform={`translate(0 ${sy.toFixed(1)}) rotate(${turn.toFixed(1)})`}>
          {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36})`} d="M -7 -46 L 0 -66 L 7 -46 Z" fill={SUN} {...EDGE_IN} />)}
        </g>
        <circle cx={0} cy={sy} r={36} fill={SUN} {...EDGE} />
        <path d={`M -14 ${sy - 18} Q -24 ${sy - 4} -16 ${sy + 12}`} stroke={shade(SUN, 0.14)} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M -100 40 Q -50 26 0 38 Q 50 50 100 34 L 100 100 L -100 100 Z" fill="#8fd18a" {...EDGE} />
        <path d="M -100 64 Q -30 50 30 62 Q 70 70 100 60 L 100 100 L -100 100 Z" fill={shade('#8fd18a', 0.14)} />
      </g>
      <circle cx={0} cy={0} r={92} {...OUTLINE} />
    </g>
  );
};

export const Stopwatch: React.FC<{t?: number; fill?: number}> = ({t = 0, fill = 0.25}) => {
  const u = clamp01(t / 1.2) * fill; // the wedge grows to a quarter (15 of 60 minutes)
  const a = u * Math.PI * 2;
  const R = 62;
  const wedge = u <= 0 ? '' : `M 0 10 L 0 ${10 - R} A ${R} ${R} 0 ${u > 0.5 ? 1 : 0} 1 ${(Math.sin(a) * R).toFixed(1)} ${(10 - Math.cos(a) * R).toFixed(1)} Z`;
  const hand = a + t * 0.8;
  return (
    <g>
      <rect x={-14} y={-92} width={28} height={20} rx={5} fill="#ef5b5b" {...EDGE} />
      <rect x={-6} y={-76} width={12} height={12} fill="#c9ccd3" {...EDGE_IN} />
      <path d="M 52 -58 L 66 -72" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M 52 -58 L 66 -72" stroke="#c9ccd3" strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={10} r={78} fill="#c9ccd3" {...EDGE} />
      <circle cx={0} cy={10} r={66} fill="#ffffff" {...EDGE_IN} />
      {wedge && <path d={wedge} fill="#4cc3b5" />}
      {Array.from({length: 12}, (_, i) => <path key={i} transform={`translate(0 10) rotate(${i * 30})`} d={`M 0 -60 L 0 ${i % 3 === 0 ? -50 : -55}`} {...INLINE} />)}
      <path transform={`translate(0 10) rotate(${(hand * 180 / Math.PI).toFixed(1)})`} d="M 0 8 L 0 -50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <circle cx={0} cy={10} r={7} fill="#ef5b5b" {...EDGE_IN} />
    </g>
  );
};

export const Calendar: React.FC<{t?: number; pages?: number}> = ({t = 0, pages = 3}) => {
  // pages flip one by one: each flip takes 0.32 s
  const flips = clamp01(t / (0.32 * pages)) * pages;
  const done = Math.floor(flips);
  const p = flips - done;
  const page = (k: string, sy: number, op = 1) => (
    <g key={k} opacity={op} transform={`translate(0 -38) scale(1 ${sy.toFixed(3)}) translate(0 38)`}>
      <rect x={-74} y={-38} width={148} height={118} rx={8} fill="#ffffff" {...EDGE} />
      {Array.from({length: 3}, (_, r) => Array.from({length: 4}, (_, c) => <rect key={r + '-' + c} x={-56 + c * 30} y={-22 + r * 30} width={20} height={18} rx={3} fill={r === 2 && c === 3 ? '#ef5b5b' : '#e3e6ec'} />))}
    </g>
  );
  return (
    <g>
      <rect x={-80} y={-70} width={160} height={156} rx={14} fill="#e3e6ec" {...EDGE} />
      <rect x={-80} y={-70} width={160} height={40} rx={14} fill="#ef5b5b" {...EDGE} />
      <rect x={-78} y={-46} width={156} height={14} fill="#ef5b5b" />
      {page('under', 1)}
      {done < pages && page('flip', Math.max(0.02, Math.cos(p * Math.PI / 2)))}
      {[-40, 40].map((x) => <g key={x}><rect x={x - 7} y={-86} width={14} height={30} rx={7} fill="#c9ccd3" {...EDGE_IN} /></g>)}
      <g transform="translate(58 62)">
        {Array.from({length: pages}, (_, i) => <circle key={i} cx={-i * 22} cy={0} r={8} fill={i < done ? '#4cc3b5' : '#ffffff'} {...EDGE_IN} />)}
      </g>
    </g>
  );
};

export const VaccineShield: React.FC<{t?: number}> = ({t = 0}) => {
  const k = popIn(t - 0.15, 0.3);
  const shine = clamp01((t - 0.4) / 0.5);
  return (
    <g>
      <path d="M 0 -88 Q 46 -64 80 -64 Q 82 20 0 90 Q -82 20 -80 -64 Q -46 -64 0 -88 Z" fill="#4cc3b5" {...EDGE} />
      <path d="M 0 -70 Q 36 -52 62 -50 Q 62 12 0 70 Z" fill={shade('#4cc3b5', 0.14)} />
      {shine > 0 && shine < 1 && <path transform={`translate(${(-60 + shine * 120).toFixed(1)} 0) rotate(20)`} d="M -6 -80 L 6 -80 L 6 80 L -6 80 Z" fill="#ffffff" opacity={0.55} />}
      {k > 0.05 && <g transform={`scale(${k.toFixed(3)}) rotate(-35)`}>
        <rect x={-14} y={-46} width={28} height={70} rx={4} fill="#ffffff" {...EDGE} />
        <rect x={-14} y={-6} width={28} height={30} rx={3} fill="#9ad8f0" {...EDGE_IN} />
        <path d="M -14 -26 L -4 -26 M -14 -12 L -4 -12" {...INLINE} />
        <rect x={-20} y={-56} width={40} height={10} rx={3} fill="#c9ccd3" {...EDGE_IN} />
        <rect x={-5} y={-74} width={10} height={20} fill="#c9ccd3" {...EDGE_IN} />
        <rect x={-14} y={-80} width={28} height={8} rx={3} fill="#c9ccd3" {...EDGE_IN} />
        <path d="M 0 24 L 0 50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M 0 24 L 0 50" stroke="#c9ccd3" strokeWidth={2.5} strokeLinecap="round" />
      </g>}
    </g>
  );
};

export const Warning: React.FC<{t?: number}> = ({t = 0}) => {
  const throb = 1 + Math.sin(t * Math.PI * 2.4) * 0.03; // a slow heartbeat throb
  return (
    <g transform={`scale(${throb.toFixed(3)})`}>
      <path d="M 0 -84 Q 8 -84 14 -74 L 88 58 Q 92 74 76 76 L -76 76 Q -92 74 -88 58 L -14 -74 Q -8 -84 0 -84 Z" fill="#ef5b5b" {...EDGE} />
      <path d="M 0 -60 L 64 56 L -64 56 Z" fill={shade('#ef5b5b', 0.12)} />
      <path d="M -9 -34 Q 0 -40 9 -34 L 6 20 Q 0 24 -6 20 Z" fill="#ffffff" {...EDGE_IN} />
      <circle cx={0} cy={42} r={10} fill="#ffffff" {...EDGE_IN} />
    </g>
  );
};

/** A stray dog (v4: on the words "stray dog"): the cast's dog head in a round badge. */
export const DogIcon: React.FC<{t?: number}> = () => {
  const id = 'dg' + useId().replace(/:/g, '');
  return (
    <g>
      <circle cx={0} cy={0} r={90} fill="#f6e3c4" {...EDGE} />
      <path d="M -90 30 Q -40 14 0 26 Q 50 40 90 22 L 90 100 L -90 100 Z" fill={shade('#f6e3c4', 0.1)} clipPath={`url(#${id})`} />
      <clipPath id={id}><circle cx={0} cy={0} r={88} /></clipPath>
      <g clipPath={`url(#${id})`}><g transform="translate(-6 14) scale(0.8)"><Dog pose="head" /></g></g>
      <circle cx={0} cy={0} r={90} {...OUTLINE} />
    </g>
  );
};
/** The dog with a warning badge (v4: when the doctor says rabies is fatal). */
export const DogWarning: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <g transform="translate(-12 -8) scale(0.9)"><DogIcon t={t} /></g>
    <g transform="translate(58 56) scale(0.46)"><Warning t={t} /></g>
  </g>
);

export type IconName = 'sunrise' | 'stopwatch' | 'calendar' | 'vaccine' | 'warning' | 'dog' | 'dogWarning';
export const ICONS: Record<IconName, React.FC<{t?: number}>> = {sunrise: Sunrise, stopwatch: Stopwatch, calendar: Calendar, vaccine: VaccineShield, warning: Warning, dog: DogIcon, dogWarning: DogWarning};

/**
 * v4 entrance (the owner, 2026-11-20: "smoother icon animation, no wobble"): ease-out to full size with ONE
 * soft settle (at most 3% over, back to 1 by the end), no turn. 0 -> 1 over `dur` seconds.
 */
export const settleIn = (t: number, dur = 0.3) => {
  const u = clamp01(t / dur);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.06 * u;
};
/** One icon on the screen: (x, y) its centre in frame pixels, size its box; it pops in at t = 0, settles, holds,
 * and fades out over 0.25 s from `out`. */
export const IconBadge: React.FC<{icon: IconName; t: number; x?: number; y?: number; size?: number; out?: number}> = ({icon, t, x = 540, y = 300, size = 330, out}) => {
  const I = ICONS[icon];
  if (t < 0) return null;
  const fade = out === undefined ? 0 : clamp01((t - out) / 0.25);
  const ease = fade * fade * (3 - 2 * fade);
  const k = settleIn(t, 0.3) * (1 - ease * 0.12);
  const op = clamp01(t / 0.12) * (1 - ease);
  if (op <= 0.001) return null;
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', pointerEvents: 'none', opacity: op}} width={size} height={size} viewBox="-100 -100 200 200">
      <g transform={`scale(${(0.55 + 0.45 * k).toFixed(4)})`}><I t={t} /></g>
    </svg>
  );
};

// ------------------------------------------------------------------ the watermark (the owner, 2026-11-20)
/**
 * "@MedPeakHealth", small and clean, on the whole video, inside the YouTube Shorts safe area. It moves once
 * per act: act 1 top right, act 2 bottom left, act 3 top middle. `act` is 0, 1 or 2; `t` the seconds since
 * that act began (it fades in at each move).
 */
export const WATERMARK = '@MedPeakHealth';
const WM_AT: {x: number; y: number; align: 'left' | 'right' | 'center'}[] = [
  {x: 960, y: 178, align: 'right'}, // act 1: top right, under the Shorts top bar, left of nothing
  {x: 96, y: 1330, align: 'left'}, // act 2: bottom left, above the caption and the Shorts title band
  {x: 540, y: 178, align: 'center'}, // act 3: top middle
];
/** The v3 watermark (bold, heavy outline): kept only for the v4 look sheet's before/after. */
export const WatermarkV3: React.FC<{act: number; t: number}> = ({act, t}) => {
  const p = WM_AT[Math.max(0, Math.min(2, act))];
  const k = clamp01(t / 0.35);
  const tx = p.align === 'right' ? '-100%' : p.align === 'center' ? '-50%' : '0';
  return (
    <div style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(${tx}, -50%)`, opacity: 0.88 * k, pointerEvents: 'none',
      fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 0.5, color: '#ffffff', whiteSpace: 'nowrap',
      WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{WATERMARK}</div>
  );
};
/**
 * v4 (the owner, 2026-11-20): smaller, half as opaque, Inter Regular, no heavy outline. A thin flat dark
 * drop (1 px, no blur) keeps it readable on light places.
 */
export const WM_SIZE = 26;
export const WM_OPACITY = 0.44;
export const Watermark: React.FC<{act: number; t: number}> = ({act, t}) => {
  const p = WM_AT[Math.max(0, Math.min(2, act))];
  const k = clamp01(t / 0.35);
  const tx = p.align === 'right' ? '-100%' : p.align === 'center' ? '-50%' : '0';
  return (
    <div style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(${tx}, -50%)`, opacity: WM_OPACITY * k, pointerEvents: 'none',
      fontFamily: FONT, fontWeight: 400, fontSize: WM_SIZE, letterSpacing: 0.4, color: '#ffffff', whiteSpace: 'nowrap',
      textShadow: '0 1px 0 rgba(43, 26, 23, 0.55)'}}>{WATERMARK}</div>
  );
};

// ------------------------------------------------------------------ the CTA end card (the owner, 2026-11-20)
/** The CTA card: three strong points, each a big icon with short bold text, then "Follow". */
export type CtaPoint = {icon: React.ReactNode; big: string; small: string};
export const CTA_SECONDS = 4.2;
export const CtaCard: React.FC<{t: number; title: string; points: CtaPoint[]}> = ({t, title, points}) => {
  const head = popIn(t - 0.05, 0.3);
  const follow = popIn(t - 2.3, 0.3);
  const pulse = 1 + Math.max(0, Math.sin((t - 2.6) * Math.PI * 2.2)) * 0.05 * (t > 2.6 ? 1 : 0);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fbf7f0', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 22, background: '#33b7a5'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${(0.6 + 0.4 * head).toFixed(3)})`, opacity: clamp01(head * 2),
        fontWeight: 900, fontSize: 62, color: INK, lineHeight: 1.1}}>{title}</div>
      {points.map((p, i) => {
        const k = popIn(t - 0.45 - i * 0.55, 0.32);
        const y = 520 + i * 270;
        return (
          <div key={i} style={{position: 'absolute', left: 80, right: 80, top: y, height: 230, opacity: clamp01(k * 2),
            transform: `translateX(${((1 - Math.min(1, k)) * -260).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 34,
            background: '#ffffff', border: `5px solid ${INK}`, borderRadius: 36, padding: '0 34px', boxShadow: `0 10px 0 ${INK}`}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#33b7a5', border: `4px solid ${INK}`, color: '#ffffff', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
            <svg width={190} height={190} viewBox="-100 -100 200 200" style={{flex: 'none', overflow: 'visible'}}>{p.icon}</svg>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1.02}}>{p.big}</div>
              <div style={{fontWeight: 700, fontSize: 38, color: '#6e645f', marginTop: 8}}>{p.small}</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center', opacity: clamp01(follow * 2)}}>
        <div style={{transform: `scale(${((0.6 + 0.4 * follow) * pulse).toFixed(3)})`, background: '#ef5b5b', border: `5px solid ${INK}`, borderRadius: 60, padding: '22px 56px', boxShadow: `0 10px 0 ${INK}`,
          color: '#ffffff', fontWeight: 900, fontSize: 56, WebkitTextStroke: `0px`}}>FOLLOW FOR MORE</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ v4: the name tag (the owner, 2026-11-20)
/**
 * A 1-second name tag the FIRST time a non-human character appears (RABIES VIRUS, ANTIBODY, WHITE BLOOD CELL,
 * DEFENCE CELL, NERVE ENDING). Never on humans. (x, y) is the character's centre and r its radius in frame
 * pixels; `t` the seconds since the tag began. A white tag box above the head (to the side when there is no
 * room above), a smart arrow from the box to the head, and a flat halo: two thin white rings around the
 * character (no blur, no glow: the v8 rule; ask the owner before a true glow).
 */
export const TAG_SECONDS = 1;
export const TAG_SAFE = {x0: 70, x1: 1010, y0: 330, y1: 1360}; // y0 below the race bar (v4)
export const tagBox = (label: string, x: number, y: number, r: number) => {
  const fs = 40, w = Math.round(label.length * fs * 0.66 + 60), h = 76;
  const gap = 150;
  // above the head if it fits, else to the side with more room
  let side: 'up' | 'left' | 'right' | 'down' = 'up';
  let bx = x, by = y - r - gap - h / 2;
  if (by - h / 2 < TAG_SAFE.y0) {
    side = x > 540 ? 'left' : 'right';
    bx = side === 'left' ? x - r - gap * 0.6 - w / 2 : x + r + gap * 0.6 + w / 2;
    by = Math.max(TAG_SAFE.y0 + h / 2, y - r * 0.6);
    if (bx - w / 2 < TAG_SAFE.x0 || bx + w / 2 > TAG_SAFE.x1) { side = 'down'; bx = x; by = Math.min(TAG_SAFE.y1 - h / 2, y + r + gap + h / 2); }
  }
  bx = Math.max(TAG_SAFE.x0 + w / 2, Math.min(TAG_SAFE.x1 - w / 2, bx));
  return {side, bx, by, w, h, fs};
};
export const CharTag: React.FC<{label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({label, x, y, r, t, dur = TAG_SECONDS}) => {
  if (t < 0 || t > dur) return null;
  const {side, bx, by, w, h, fs} = tagBox(label, x, y, r);
  const op = clamp01(t / 0.15) * (1 - clamp01((t - (dur - 0.2)) / 0.2));
  const k = settleIn(t, 0.25);
  // the arrow: from the box edge toward the head, ending short of it, a gentle curve
  const from: [number, number] = side === 'up' ? [bx, by + h / 2] : side === 'down' ? [bx, by - h / 2] : side === 'left' ? [bx + w / 2, by] : [bx - w / 2, by];
  const ang = Math.atan2(y - from[1], x - from[0]);
  const to: [number, number] = [x - Math.cos(ang) * (r + 18), y - Math.sin(ang) * (r + 18)];
  const draw = settleIn(t - 0.08, 0.22);
  const tip: [number, number] = [from[0] + (to[0] - from[0]) * Math.min(1, draw), from[1] + (to[1] - from[1]) * Math.min(1, draw)];
  const mid: [number, number] = [(from[0] + tip[0]) / 2 + Math.sin(ang) * 24, (from[1] + tip[1]) / 2 - Math.cos(ang) * 24];
  const a2 = Math.atan2(tip[1] - mid[1], tip[0] - mid[0]);
  const head = (s: number) => `M ${tip[0] + Math.cos(a2) * 4} ${tip[1] + Math.sin(a2) * 4} L ${tip[0] - Math.cos(a2 - 0.5) * s} ${tip[1] - Math.sin(a2 - 0.5) * s} L ${tip[0] - Math.cos(a2 + 0.5) * s} ${tip[1] - Math.sin(a2 + 0.5) * s} Z`;
  const arc = `M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${tip[0]} ${tip[1]}`;
  const ring = settleIn(t - 0.05, 0.35);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, pointerEvents: 'none'}}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* the flat halo: two thin white rings around the character */}
        <circle cx={x} cy={y} r={r * (1.02 + 0.1 * ring)} fill="none" stroke="#ffffff" strokeWidth={9} opacity={0.7} />
        <circle cx={x} cy={y} r={r * (1.1 + 0.16 * ring)} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.38} />
        {draw > 0.02 && <>
          <path d={arc} stroke={INK} strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d={arc} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" fill="none" />
          {draw > 0.6 && <><path d={head(38)} fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></>}
        </>}
      </svg>
      <div style={{position: 'absolute', left: bx, top: by, transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * k).toFixed(4)})`, width: w, height: h, boxSizing: 'border-box',
        background: '#ffffff', border: `5px solid ${INK}`, borderRadius: 18, boxShadow: `0 7px 0 ${INK}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: fs, letterSpacing: 1, color: INK, whiteSpace: 'nowrap'}}>{label.toUpperCase()}</div>
    </div>
  );
};

// ------------------------------------------------------------------ v4: the CTA card with the channel logo
/**
 * The v4 end card (the owner, 2026-11-20): the logo's royal blue with lighter blue rings; the channel logo top
 * centre in a white-ringed circle with "MedPeak Health" typed below; the headline on ONE line; three white
 * cards with big bold icons; the follow line in a yellow pill. The narrator reads it, so the beats can be
 * timed to his voice with `at` (seconds from the card's start).
 * The logo is public/brand/logo.png (copied from assets/brand by the render and sheet scripts).
 */
export const BRAND_BLUE = '#214ba1';
export const FOLLOW_LINE = 'Follow MedPeak Health for more health tips that keep you safe.';
export type CtaAt = {head: number; points: [number, number, number]; follow: number};
export const CTA_AT_DEFAULT: CtaAt = {head: 0.3, points: [0.9, 1.6, 2.3], follow: 3.0};
export const CtaCardV4: React.FC<{t: number; title: string; points: CtaPoint[]; at?: CtaAt; follow?: string}> = ({t, title, points, at = CTA_AT_DEFAULT, follow = FOLLOW_LINE}) => {
  const logo = settleIn(t, 0.35);
  const name = settleIn(t - 0.15, 0.3);
  const head = settleIn(t - at.head, 0.3);
  const fol = settleIn(t - at.follow, 0.32);
  const headFs = Math.min(84, Math.floor(960 / (title.length * 0.64)));
  const ringT = t * 6; // the rings breathe outward very slowly
  return (
    <div style={{position: 'absolute', inset: 0, background: BRAND_BLUE, overflow: 'hidden', fontFamily: FONT}}>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
        {[1180, 960, 760, 580, 420].map((r, i) => <circle key={i} cx={540} cy={300} r={r + ringT} fill={i % 2 ? tint(BRAND_BLUE, 0.07) : tint(BRAND_BLUE, 0.03)} />)}
        {[1180, 960, 760, 580, 420, 290].map((r, i) => <circle key={'l' + i} cx={540} cy={300} r={r + ringT} fill="none" stroke={tint(BRAND_BLUE, 0.22)} strokeWidth={3} />)}
      </svg>
      {/* the logo in its circle */}
      <div style={{position: 'absolute', left: 540, top: 290, width: 240, height: 240, transform: `translate(-50%, -50%) scale(${(0.5 + 0.5 * logo).toFixed(4)})`, opacity: clamp01(logo * 3),
        borderRadius: '50%', background: '#ffffff', boxShadow: `0 8px 0 ${shade(BRAND_BLUE, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 212, height: 212, borderRadius: '50%', overflow: 'hidden'}}><Img src={staticFile('brand/logo.png')} style={{width: 212, height: 212, display: 'block'}} /></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 432, textAlign: 'center', opacity: clamp01(name * 2), transform: `translateY(${((1 - name) * 20).toFixed(1)}px)`,
        fontWeight: 800, fontSize: 52, color: '#ffffff', letterSpacing: 0.5}}>MedPeak Health</div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 540, textAlign: 'center', whiteSpace: 'nowrap', opacity: clamp01(head * 2), transform: `scale(${(0.7 + 0.3 * head).toFixed(4)})`,
        fontWeight: 900, fontSize: headFs, color: CAPTION_KEY, lineHeight: 1.05, letterSpacing: 0.5, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 7px 0 ${INK}`}}>{title}</div>
      {points.map((p, i) => {
        const k = settleIn(t - at.points[i], 0.32);
        const y = 680 + i * 246;
        return (
          <div key={i} style={{position: 'absolute', left: 70, right: 70, top: y, height: 220, opacity: clamp01(k * 2.5),
            transform: `translateY(${((1 - k) * 60).toFixed(1)}px) scale(${(0.92 + 0.08 * k).toFixed(4)})`, display: 'flex', alignItems: 'center', gap: 26,
            background: '#ffffff', border: `5px solid ${INK}`, borderRadius: 34, padding: '0 30px 0 18px', boxShadow: `0 10px 0 ${shade(BRAND_BLUE, 0.35)}`}}>
            <svg width={210} height={210} viewBox="-100 -100 200 200" style={{flex: 'none', overflow: 'visible'}}><g transform="scale(1.04)">{p.icon}</g></svg>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1.0}}>{p.big}</div>
              <div style={{fontWeight: 700, fontSize: 36, color: '#5f6676', marginTop: 10}}>{p.small}</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 70, right: 70, top: 1440, display: 'flex', justifyContent: 'center', opacity: clamp01(fol * 2.5)}}>
        <div style={{transform: `scale(${(0.75 + 0.25 * fol).toFixed(4)})`, background: CAPTION_KEY, border: `5px solid ${INK}`, borderRadius: 40, padding: '20px 40px', boxShadow: `0 10px 0 ${INK}`,
          color: INK, fontWeight: 900, fontSize: 44, lineHeight: 1.15, textAlign: 'center'}}>{follow}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ v4: the race bar (the hook's question, made visible)
/**
 * "Can you catch me before the brain?" as a picture that comes back through the video: a nerve from the BITE to
 * the BRAIN across the top of the screen, the Virus riding along it (p = 0 at the bite, 1 at the brain). It creeps
 * during the months, jumps on "faster", and stops at the antibody wall (`wall` 0..1); `caught` greys it. `op` fades
 * the whole bar. Laid on the screen after the camera, in the safe area (y 205-300), clear of the watermark.
 */
export const RACE = {x0: 170, x1: 900, y: 252, wallAt: 0.82};
export const RaceBar: React.FC<{p: number; t: number; op?: number; wall?: number; caught?: number}> = ({p, t, op = 1, wall = 0, caught = 0}) => {
  if (op <= 0.01) return null;
  const {x0, x1, y, wallAt} = RACE;
  const x = x0 + (x1 - x0) * clamp01(p);
  const yOn = (u: number) => y - 2 * 22 * u * (1 - u); // the line's height at u (the quadratic's curve)
  const path = `M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 22} ${x1} ${y}`;
  const wx = x0 + (x1 - x0) * wallAt;
  const bob = Math.sin(t * 9) * 4 * (1 - caught);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, opacity: op, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect x={x0 - 90} y={y - 52} width={x1 - x0 + 180} height={104} rx={52} fill="#2b1a17" opacity={0.32} />
      <path d={path} stroke={INK} strokeWidth={24} strokeLinecap="round" fill="none" />
      <path d={path} stroke="#f2d07a" strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d={path} stroke="#fff3c4" strokeWidth={4} strokeLinecap="round" fill="none" strokeDasharray="18 22" strokeDashoffset={-t * 60} />
      {/* the bite (start) and the brain (finish) */}
      <g transform={`translate(${x0 - 46} ${y})`}>
        <circle r={30} fill="#ffffff" {...EDGE} />
        {[[-12, -8, 10, -12], [-10, 2, 14, -2], [-6, 12, 12, 8]].map(([a, b, c, d], i) => <path key={i} d={`M ${a} ${b} L ${c} ${d}`} stroke="#ef5b5b" strokeWidth={4.5} strokeLinecap="round" />)}
      </g>
      <g transform={`translate(${x1 + 52} ${y - 6}) scale(0.46)`}><Brain mood={p > 0.6 && caught < 0.5 ? 'scared' : 'open'} mouth={p > 0.6 && caught < 0.5 ? 'wavy' : 'smile'} look={[-0.8, 0]} /></g>
      {/* the antibody wall */}
      {wall > 0.01 && (
        <g transform={`translate(${wx} ${yOn(wallAt)}) scale(${(0.4 + 0.6 * settleIn(wall, 1)).toFixed(3)})`}>
          <rect x={-11} y={-44} width={22} height={88} rx={9} fill="#35b59b" {...EDGE} />
          {[-28, 0, 28].map((dy) => <path key={dy} d={`M -8 ${dy} L 0 ${dy + 8} L 8 ${dy} M 0 ${dy + 8} L 0 ${dy + 14}`} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" />)}
        </g>
      )}
      {/* the Virus riding the nerve */}
      <g transform={`translate(${x.toFixed(1)} ${(yOn(clamp01(p)) - 36 + bob).toFixed(1)}) scale(0.46)`} opacity={1 - 0.45 * caught}>
        <Virus mood={caught > 0.5 ? 'sad' : 'happy'} mouth={caught > 0.5 ? 'wavy' : 'big'} look={[0.8, 0]} />
      </g>
      {caught > 0.01 && <path d={`M ${x - 30} ${yOn(clamp01(p)) - 66} L ${x + 30} ${yOn(clamp01(p)) - 6} M ${x + 30} ${yOn(clamp01(p)) - 66} L ${x - 30} ${yOn(clamp01(p)) - 6}`} stroke="#ef5b5b" strokeWidth={9 * caught} strokeLinecap="round" />}
    </svg>
  );
};
