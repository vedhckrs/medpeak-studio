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
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, INLINE, OUTLINE, shade} from './kit';

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
      <g transform={`scale(${k.toFixed(3)}) rotate(-35)`}>
        <rect x={-14} y={-46} width={28} height={70} rx={4} fill="#ffffff" {...EDGE} />
        <rect x={-14} y={-6} width={28} height={30} rx={3} fill="#9ad8f0" {...EDGE_IN} />
        <path d="M -14 -26 L -4 -26 M -14 -12 L -4 -12" {...INLINE} />
        <rect x={-20} y={-56} width={40} height={10} rx={3} fill="#c9ccd3" {...EDGE_IN} />
        <rect x={-5} y={-74} width={10} height={20} fill="#c9ccd3" {...EDGE_IN} />
        <rect x={-14} y={-80} width={28} height={8} rx={3} fill="#c9ccd3" {...EDGE_IN} />
        <path d="M 0 24 L 0 50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M 0 24 L 0 50" stroke="#c9ccd3" strokeWidth={2.5} strokeLinecap="round" />
      </g>
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

export type IconName = 'sunrise' | 'stopwatch' | 'calendar' | 'vaccine' | 'warning';
export const ICONS: Record<IconName, React.FC<{t?: number}>> = {sunrise: Sunrise, stopwatch: Stopwatch, calendar: Calendar, vaccine: VaccineShield, warning: Warning};

/** One icon on the screen: (x, y) its centre in frame pixels, size its box; it pops in at t = 0. */
export const IconBadge: React.FC<{icon: IconName; t: number; x?: number; y?: number; size?: number; out?: number}> = ({icon, t, x = 540, y = 300, size = 330, out}) => {
  const I = ICONS[icon];
  const k = popIn(t, 0.28) * (out === undefined ? 1 : 1 - clamp01((t - out) / 0.2));
  if (k <= 0.001) return null;
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', pointerEvents: 'none'}} width={size} height={size} viewBox="-100 -100 200 200">
      <g transform={`scale(${k.toFixed(3)}) rotate(${((1 - Math.min(1, k)) * -14).toFixed(1)})`}><I t={t} /></g>
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
export const Watermark: React.FC<{act: number; t: number}> = ({act, t}) => {
  const p = WM_AT[Math.max(0, Math.min(2, act))];
  const k = clamp01(t / 0.35);
  const tx = p.align === 'right' ? '-100%' : p.align === 'center' ? '-50%' : '0';
  return (
    <div style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(${tx}, -50%)`, opacity: 0.88 * k, pointerEvents: 'none',
      fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 0.5, color: '#ffffff', whiteSpace: 'nowrap',
      WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{WATERMARK}</div>
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
