// MedPeak Toons sets, drawn in code at 1080x1920. Our palette: warm coral body interiors with
// navy outlines and teal labels; the doctor's office is mint and cream (not a copy of anyone's set).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, LINE} from './rig';
import {theme} from '../brand/theme';

export const Label: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 760, y = 150}) => (
  <div style={{position: 'absolute', left: x, top: y, background: '#2ec4b6', color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 26px', borderRadius: 40, border: `5px solid ${INK}`, letterSpacing: 1}}>{text}</div>
);

/** Inside the throat: a vertical tube with soft rings, slowly breathing. */
export const ThroatSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <rect width={1080} height={1920} fill="#f7c6b8" />
      <path d={`M0 0 H300 C${330 + Math.sin(t) * 8} 600 260 1300 320 1920 H0 Z`} fill="#e8838a" stroke={INK} strokeWidth={LINE * 3} />
      <path d={`M1080 0 H780 C${750 - Math.sin(t) * 8} 600 820 1300 760 1920 H1080 Z`} fill="#e8838a" stroke={INK} strokeWidth={LINE * 3} />
      <path d="M300 0 C330 600 260 1300 320 1920 L760 1920 C820 1300 750 600 780 0 Z" fill="#fbd3c8" />
      {Array.from({length: 9}).map((_, i) => (
        <path key={i} d={`M${310 - i * 2} ${120 + i * 200} Q540 ${170 + i * 200 + Math.sin(t + i) * 6} ${770 + i * 2} ${120 + i * 200}`} fill="none" stroke="#f0a99f" strokeWidth={10} strokeLinecap="round" />
      ))}
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={i % 2 ? 110 + (i * 37) % 150 : 900 + (i * 53) % 150} cy={80 + i * 105} r={14 + (i % 3) * 6} fill="#f6a3a3" />)}
    </svg>
    <Label text="THROAT" />
  </AbsoluteFill>
);

/** The gut: a winding tunnel with folds (villi) along the walls. */
export const GutSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <rect width={1080} height={1920} fill="#d9707a" />
      <ellipse cx={540} cy={980} rx={560} ry={760} fill="#f2a3a0" stroke={INK} strokeWidth={LINE * 3} />
      <ellipse cx={540} cy={1000} rx={360} ry={520} fill="#f8c2b5" />
      <ellipse cx={540} cy={1020} rx={170} ry={260} fill="#ffdccf" />
      {Array.from({length: 26}).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const x = 540 + Math.cos(a) * 520;
        const y = 980 + Math.sin(a) * 700;
        const s = 1 + Math.sin(t * 2 + i) * 0.06;
        return <ellipse key={i} cx={x} cy={y} rx={40 * s} ry={70 * s} transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} fill="#e9858c" stroke={INK} strokeWidth={LINE * 2} />;
      })}
    </svg>
    <Label text="GUT" />
  </AbsoluteFill>
);

/** Dr. Mira's office: mint wall, wooden floor, a body poster and a little plant. */
export const OfficeSet: React.FC<{t: number}> = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <rect width={1080} height={1350} fill="#bfe9df" />
      <rect y={1350} width={1080} height={570} fill="#e8c9a0" />
      {Array.from({length: 7}).map((_, i) => <line key={i} x1={0} x2={1080} y1={1400 + i * 80} y2={1400 + i * 80} stroke="#d4b385" strokeWidth={6} />)}
      <rect y={1330} width={1080} height={24} fill="#f6f1e7" stroke={INK} strokeWidth={LINE * 2} />
      <g transform="translate(120 320)">
        <rect width={300} height={420} rx={16} fill="#fff" stroke={INK} strokeWidth={LINE * 2} />
        <circle cx={150} cy={90} r={40} fill="#ffd2c4" stroke={INK} strokeWidth={LINE * 2} />
        <rect x={110} y={140} width={80} height={170} rx={30} fill="#ffd2c4" stroke={INK} strokeWidth={LINE * 2} />
        <circle cx={135} cy={200} r={14} fill="#ff6f7d" /><ellipse cx={170} cy={240} rx={18} ry={12} fill="#c9645a" />
        <rect x={60} y={340} width={180} height={18} rx={9} fill="#2ec4b6" />
      </g>
      <g transform="translate(700 300)">
        <rect width={260} height={300} rx={20} fill="#e8f7ff" stroke={INK} strokeWidth={LINE * 2} />
        <line x1={130} x2={130} y1={0} y2={300} stroke={INK} strokeWidth={LINE * 2} /><line x1={0} x2={260} y1={150} y2={150} stroke={INK} strokeWidth={LINE * 2} />
        <circle cx={70} cy={70} r={30} fill="#ffe08a" />
      </g>
      <g transform="translate(860 1150)">
        <path d="M-50 180 L-40 60 H40 L50 180 Z" fill="#ff9f6e" stroke={INK} strokeWidth={LINE * 2} />
        {[-40, 0, 40].map((a, i) => <ellipse key={i} cx={a} cy={20 - (i === 1 ? 40 : 0)} rx={30} ry={70} fill="#43c08a" stroke={INK} strokeWidth={LINE * 2} transform={`rotate(${a / 2} ${a} 20)`} />)}
      </g>
    </svg>
  </AbsoluteFill>
);

/** One word at a time: our caption is a white word on a navy rounded tag, the key word in amber. */
export const WordCaption: React.FC<{word: string; key_?: boolean; y?: number}> = ({word, key_, y = 1330}) => (
  <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: INK, color: key_ ? '#ffc93c' : '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 92, padding: '6px 38px 12px', borderRadius: 30, letterSpacing: 1, transform: 'rotate(-2deg)', boxShadow: '0 10px 0 rgba(0,0,0,0.18)'}}>{word.toUpperCase()}</div>
  </div>
);

export const SETS = {throat: ThroatSet, gut: GutSet, office: OfficeSet};
export type SetName = keyof typeof SETS;
