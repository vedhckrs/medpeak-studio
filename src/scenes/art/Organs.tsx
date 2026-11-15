// Medical artwork drawn in code. Every piece takes `t` (seconds since the panel started)
// and `level` (0-1, how strongly the effect shows: fat in the liver, sugar in the blood ...).
import React from 'react';
import {random} from 'remotion';
import {theme} from '../../brand/theme';
import type {Organ} from '../../types';

type ArtProps = {t: number; level: number};
const pulse = (t: number, speed = 1.2, amp = 0.03) => 1 + Math.sin(t * Math.PI * 2 * speed) * amp;
const grow = (t: number, d = 1.2) => Math.min(1, t / d);

const Glow: React.FC<{id: string; color: string}> = ({id, color}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="8" result="b" />
    <feFlood floodColor={color} floodOpacity="0.8" />
    <feComposite in2="b" operator="in" />
    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>
);

export const Liver: React.FC<ArtProps> = ({t, level}) => {
  const n = Math.round(26 * level * grow(t, 2));
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <radialGradient id="lv" cx="40%" cy="35%"><stop offset="0" stopColor="#d4664f" /><stop offset="1" stopColor="#7c2a22" /></radialGradient>
        <Glow id="lvg" color={theme.amber} />
      </defs>
      <g transform={`translate(200 150) scale(${pulse(t, 0.4, 0.015)}) translate(-200 -150)`}>
        <path d="M40 140 C30 70 120 40 220 50 C300 58 370 70 375 110 C380 150 330 170 280 190 C220 215 170 250 120 245 C70 240 48 200 40 140 Z" fill="url(#lv)" stroke="#f0a08f" strokeOpacity="0.4" strokeWidth="3" />
        <path d="M215 55 C205 110 200 170 175 238" stroke="#5a1d18" strokeWidth="4" fill="none" opacity="0.5" />
        {Array.from({length: n}).map((_, i) => {
          const x = 80 + random(`lx${i}`) * 260;
          const y = 80 + random(`ly${i}`) * 120;
          const r = 6 + random(`lr${i}`) * 11;
          const s = Math.min(1, Math.max(0, (t * 2 - i * 0.08)));
          return <circle key={i} cx={x} cy={y} r={r * s} fill={theme.amber} opacity={0.85} filter="url(#lvg)" />;
        })}
      </g>
    </svg>
  );
};

export const Pancreas: React.FC<ArtProps> = ({t, level}) => (
  <svg viewBox="0 0 400 300" width="100%" height="100%">
    <defs><linearGradient id="pc" x1="0" x2="1"><stop offset="0" stopColor="#f2a07b" /><stop offset="1" stopColor="#c8644a" /></linearGradient></defs>
    <path d="M40 170 C60 120 140 120 200 130 C260 140 320 110 365 125 C385 132 380 160 360 165 C300 180 250 190 200 195 C140 200 80 215 55 205 C35 198 33 185 40 170 Z" fill="url(#pc)" stroke="#ffd2bd" strokeOpacity="0.4" strokeWidth="3" />
    {Array.from({length: 40}).map((_, i) => {
      const life = (t * (0.6 + level) + random(`pi${i}`) * 3) % 3;
      const x = 120 + random(`px${i}`) * 220 + life * 20;
      const y = 150 - life * 45;
      return <circle key={i} cx={x} cy={y} r={4} fill={theme.cyan} opacity={Math.max(0, 1 - life / 3) * Math.min(1, level * 1.5)} />;
    })}
  </svg>
);

export const Heart: React.FC<ArtProps> = ({t, level}) => {
  const beat = 1 + Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 8 * 0.06;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs><radialGradient id="ht" cx="40%" cy="35%"><stop offset="0" stopColor="#ff7a6e" /><stop offset="1" stopColor="#9e1f2a" /></radialGradient></defs>
      <g transform={`translate(200 160) scale(${beat}) translate(-200 -160)`}>
        <path d="M185 105 C180 55 205 35 240 40 C262 44 270 62 268 80" stroke="#c94a55" strokeWidth="24" fill="none" strokeLinecap="round" />
        <path d="M215 100 L215 55" stroke="#4a78c9" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M200 270 C120 220 80 170 90 120 C100 75 160 70 200 110 C240 70 300 75 310 120 C320 170 280 220 200 270 Z" fill="url(#ht)" stroke="#ffb3ad" strokeOpacity="0.4" strokeWidth="3" />
        <path d="M150 110 C170 150 175 200 195 250" stroke={level > 0.5 ? theme.amber : '#ffd0cc'} strokeWidth="6" fill="none" opacity="0.7" />
        <path d="M250 110 C235 150 225 190 210 245" stroke={level > 0.5 ? theme.amber : '#ffd0cc'} strokeWidth="6" fill="none" opacity="0.7" />
      </g>
    </svg>
  );
};

export const Brain: React.FC<ArtProps> = ({t, level}) => (
  <svg viewBox="0 0 400 300" width="100%" height="100%">
    <defs><radialGradient id="br" cx="45%" cy="40%"><stop offset="0" stopColor="#f6b6c8" /><stop offset="1" stopColor="#b5607f" /></radialGradient><Glow id="brg" color={theme.amber} /></defs>
    <path d="M80 170 C50 120 90 60 150 60 C170 35 230 35 250 60 C320 55 360 110 330 165 C345 210 290 245 240 230 C210 255 160 250 140 228 C90 238 60 205 80 170 Z" fill="url(#br)" stroke="#ffd6e2" strokeOpacity="0.5" strokeWidth="3" />
    {['M120 110 C140 90 170 100 175 125', 'M190 80 C200 110 230 110 240 90', 'M250 120 C280 115 300 140 290 165', 'M140 170 C165 155 190 175 205 160', 'M220 190 C245 175 270 195 265 215', 'M200 60 L200 230'].map((d, i) => (
      <path key={i} d={d} stroke="#8e3f5e" strokeWidth="5" fill="none" opacity="0.55" strokeLinecap="round" />
    ))}
    {Array.from({length: 7}).map((_, i) => {
      const on = (Math.sin(t * 3 + i * 1.7) + 1) / 2;
      return <circle key={i} cx={130 + random(`bx${i}`) * 160} cy={95 + random(`by${i}`) * 110} r={7 + on * 6} fill={theme.amber} opacity={level * (0.3 + on * 0.7)} filter="url(#brg)" />;
    })}
  </svg>
);

/** A blood vessel in cross-section along its length: red cells and amber glucose flowing. */
export const Vessel: React.FC<ArtProps> = ({t, level}) => {
  const glucose = Math.round(10 + level * 45);
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs><linearGradient id="vw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8323c" /><stop offset="0.5" stopColor="#5a0f18" /><stop offset="1" stopColor="#b8323c" /></linearGradient></defs>
      <rect x="0" y="70" width="400" height="160" rx="30" fill="url(#vw)" />
      <rect x="0" y="90" width="400" height="120" fill="#3a0910" />
      {Array.from({length: 14}).map((_, i) => {
        const x = ((random(`rx${i}`) * 460 + t * 90) % 460) - 30;
        const y = 105 + random(`ry${i}`) * 90;
        return <ellipse key={`r${i}`} cx={x} cy={y} rx="18" ry="11" fill="#e2493f" stroke="#ff8a80" strokeWidth="2" />;
      })}
      {Array.from({length: glucose}).map((_, i) => {
        const x = ((random(`gx${i}`) * 460 + t * (60 + random(`gs${i}`) * 50)) % 460) - 30;
        const y = 100 + random(`gy${i}`) * 100;
        const r = 7;
        const pts = Array.from({length: 6}).map((__, k) => `${x + r * Math.cos((k * Math.PI) / 3 + t)},${y + r * Math.sin((k * Math.PI) / 3 + t)}`).join(' ');
        return <polygon key={`g${i}`} points={pts} fill={theme.amber} opacity={Math.min(1, t * 2)} />;
      })}
    </svg>
  );
};

/** A body cell: insulin "keys" dock on receptors and let glucose in. level = how resistant (1 = locked). */
export const Cell: React.FC<ArtProps> = ({t, level}) => (
  <svg viewBox="0 0 400 300" width="100%" height="100%">
    <defs><radialGradient id="cl" cx="50%" cy="50%"><stop offset="0" stopColor="#2b6f8f" /><stop offset="1" stopColor="#123a52" /></radialGradient></defs>
    <circle cx="200" cy="150" r={110 * pulse(t, 0.3, 0.01)} fill="url(#cl)" stroke={theme.cyan} strokeWidth="5" />
    <circle cx="215" cy="140" r="34" fill="#6a4fa8" opacity="0.85" />
    {Array.from({length: 8}).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const x = 200 + Math.cos(a) * 112;
      const y = 150 + Math.sin(a) * 112;
      const docked = level < 0.5 && (t * 1.5 + i * 0.3) % 3 > 1;
      return (
        <g key={i}>
          <rect x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={level >= 0.5 ? theme.coral : theme.teal} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />
          {docked && <circle cx={200 + Math.cos(a) * (112 - ((t * 60) % 80))} cy={150 + Math.sin(a) * (112 - ((t * 60) % 80))} r="6" fill={theme.amber} />}
        </g>
      );
    })}
    {level >= 0.5 && Array.from({length: 18}).map((_, i) => {
      const a = random(`ca${i}`) * Math.PI * 2;
      const d = 140 + random(`cd${i}`) * 30 + Math.sin(t * 2 + i) * 6;
      return <circle key={i} cx={200 + Math.cos(a) * d} cy={150 + Math.sin(a) * d * 0.8} r="6" fill={theme.amber} opacity="0.9" />;
    })}
  </svg>
);

export const Tooth: React.FC<ArtProps> = ({t, level}) => (
  <svg viewBox="0 0 400 300" width="100%" height="100%">
    <path d="M130 70 C150 40 180 55 200 60 C220 55 250 40 270 70 C290 100 280 150 270 190 C262 230 255 265 240 265 C225 265 222 220 200 220 C178 220 175 265 160 265 C145 265 138 230 130 190 C120 150 110 100 130 70 Z" fill="#f4f1e8" stroke="#cfc8b6" strokeWidth="4" />
    <ellipse cx="225" cy="100" rx={4 + 26 * level * grow(t, 2)} ry={3 + 18 * level * grow(t, 2)} fill="#3b2a1e" />
    {Array.from({length: 12}).map((_, i) => (
      <circle key={i} cx={225 + Math.cos(i + t * 2) * (30 + i * 2)} cy={100 + Math.sin(i * 1.3 + t * 2) * 22} r="4" fill={theme.green} opacity={level} />
    ))}
  </svg>
);

export const FatCell: React.FC<ArtProps> = ({t, level}) => (
  <svg viewBox="0 0 400 300" width="100%" height="100%">
    {Array.from({length: 9}).map((_, i) => {
      const x = 110 + (i % 3) * 90;
      const y = 70 + Math.floor(i / 3) * 80;
      const r = 32 + level * 14 * grow(t, 2) + Math.sin(t * 1.5 + i) * 1.5;
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffd27a" stroke="#e9a93c" strokeWidth="3" opacity="0.92" />;
    })}
  </svg>
);

/** Whole body with the organ that the scene is about lit up. */
export const Body: React.FC<ArtProps & {highlight?: string}> = ({t, highlight}) => {
  const spots: Record<string, [number, number, number]> = {brain: [200, 40, 22], heart: [212, 112, 16], liver: [182, 140, 18], pancreas: [205, 155, 13], vessel: [150, 200, 12], teeth: [200, 62, 9]};
  const s = spots[highlight ?? 'heart'] ?? spots.heart;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <g fill="rgba(79,209,255,0.18)" stroke={theme.cyan} strokeWidth="2.5">
        <circle cx="200" cy="40" r="26" />
        <path d="M170 70 L230 70 L250 160 L240 230 L220 290 L180 290 L160 230 L150 160 Z" />
        <path d="M170 75 L125 165 L140 170 L178 100" /><path d="M230 75 L275 165 L260 170 L222 100" />
      </g>
      <circle cx={s[0]} cy={s[1]} r={s[2] * pulse(t, 1, 0.18)} fill={theme.amber} opacity="0.85" />
      <circle cx={s[0]} cy={s[1]} r={s[2] * 2 * ((t * 0.8) % 1)} fill="none" stroke={theme.amber} strokeWidth="3" opacity={1 - ((t * 0.8) % 1)} />
    </svg>
  );
};

export const OrganArt: React.FC<{organ: Organ; t: number; level: number; highlight?: string}> = ({organ, ...p}) => {
  switch (organ) {
    case 'liver': return <Liver {...p} />;
    case 'pancreas': return <Pancreas {...p} />;
    case 'heart': return <Heart {...p} />;
    case 'brain': return <Brain {...p} />;
    case 'vessel': return <Vessel {...p} />;
    case 'cell': return <Cell {...p} />;
    case 'tooth': return <Tooth {...p} />;
    case 'fatcell': return <FatCell {...p} />;
    default: return <Body {...p} />;
  }
};
