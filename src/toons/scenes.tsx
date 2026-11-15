// MedPeak Toons sets, drawn in code at 1080x1920 with depth: a darker back layer, a lit mid layer
// where characters stand, blurred foreground shapes, a light pool, floating particles and a vignette.
// Our palette: warm coral body interiors, navy outlines, teal labels; real-world sets in mint/cream.
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {INK, LINE} from './rig';
import {shade} from './paint';
import {theme} from '../brand/theme';

const W = 1080;
const H = 1920;
const O = {stroke: INK, strokeWidth: LINE * 2.4, strokeLinejoin: 'round' as const};

export const Label: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 740, y = 170}) => (
  <div style={{position: 'absolute', left: x, top: y, background: '#2ec4b6', color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: `5px solid ${INK}`, letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{text}</div>
);

/** Shared finishing layers: light pool, floating particles, vignette. */
const Atmos: React.FC<{t: number; tint: string; particles?: string; light?: [number, number]}> = ({t, tint, particles = '#ffffff', light = [380, 520]}) => {
  const id = useId().replace(/:/g, '');
  return (
  <>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id={`pool${id}`} cx={light[0] / W} cy={light[1] / H} r="0.6"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id={`vig${id}`} cx="0.5" cy="0.48" r="0.75"><stop offset="0.6" stopColor={tint} stopOpacity="0" /><stop offset="1" stopColor={tint} stopOpacity="0.55" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#pool${id})`} />
      {Array.from({length: 26}).map((_, i) => {
        const x = (random(`px${i}`) * W + Math.sin(t * 0.6 + i) * 30) % W;
        const y = (random(`py${i}`) * H - t * (12 + random(`pv${i}`) * 26) + H * 4) % H;
        const r = 3 + random(`pr${i}`) * 9;
        return <circle key={i} cx={x} cy={y} r={r} fill={particles} opacity={0.18 + random(`po${i}`) * 0.25} />;
      })}
      <rect width={W} height={H} fill={`url(#vig${id})`} />
    </svg>
  </>
  );
};

const Blur: React.FC<{id: string; s?: number}> = ({id, s = 10}) => <filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={s} /></filter>;

// ------------------------------------------------------------------- inside the body

/** Inside the throat: a long tube with rings, receding into the dark. */
export const ThroatSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="tb" s={12} /><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a2c3a" /><stop offset="0.45" stopColor="#f4b3a8" /><stop offset="1" stopColor="#f8c8bd" /></linearGradient></defs>
      <rect width={W} height={H} fill="#c95b67" />
      <path d={`M250 0 C${290 + Math.sin(t) * 10} 640 220 1300 280 1920 L800 1920 C860 1300 790 640 830 0 Z`} fill="url(#tg)" />
      {Array.from({length: 11}).map((_, i) => {
        const y = 60 + i * i * 15 + i * 40;
        const w = 140 + i * 30;
        return <path key={i} d={`M${540 - w} ${y} Q540 ${y + 30 + i * 4 + Math.sin(t + i) * 5} ${540 + w} ${y}`} fill="none" stroke={shade('#f4b3a8', 0.18)} strokeWidth={6 + i} strokeLinecap="round" opacity={0.4 + i * 0.05} />;
      })}
      <path d={`M0 0 H260 C${300 + Math.sin(t) * 10} 640 230 1300 290 1920 H0 Z`} fill="#e57f88" {...O} />
      <path d={`M1080 0 H820 C${780 - Math.sin(t) * 10} 640 850 1300 790 1920 H1080 Z`} fill="#e57f88" {...O} />
      {Array.from({length: 22}).map((_, i) => (
        <ellipse key={i} cx={i % 2 ? 60 + random(`tx${i}`) * 160 : 880 + random(`tx${i}`) * 160} cy={random(`ty${i}`) * H} rx={14 + random(`tr${i}`) * 18} ry={10 + random(`tq${i}`) * 12} fill={shade('#e57f88', 0.12)} />
      ))}
      <g filter="url(#tb)" opacity={0.85}>
        <ellipse cx={-30} cy={1700} rx={220} ry={300} fill="#b84756" />
        <ellipse cx={1110} cy={260} rx={200} ry={280} fill="#b84756" />
      </g>
    </svg>
    <Atmos t={t} tint="#5a1b2a" light={[540, 900]} />
    <Label text="THROAT" />
  </AbsoluteFill>
);

/** The gut: a tunnel lined with villi, a fold-arch in front. */
export const GutSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="gb" s={14} /><radialGradient id="gg" cx="0.5" cy="0.52" r="0.6"><stop offset="0" stopColor="#ffe3d6" /><stop offset="0.5" stopColor="#f6b2a6" /><stop offset="1" stopColor="#b84a59" /></radialGradient></defs>
      <rect width={W} height={H} fill="url(#gg)" />
      {[0, 1, 2, 3].map((k) => (
        <ellipse key={k} cx={540} cy={1000} rx={540 - k * 120} ry={780 - k * 170} fill="none" stroke={shade('#f2a3a0', 0.1 + k * 0.05)} strokeWidth={30 - k * 5} opacity={0.6} />
      ))}
      {Array.from({length: 30}).map((_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const x = 540 + Math.cos(a) * 470;
        const y = 1000 + Math.sin(a) * 700;
        const s = 1 + Math.sin(t * 2 + i) * 0.07;
        return <ellipse key={i} cx={x} cy={y} rx={46 * s} ry={86 * s} transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} fill="#ee8f93" {...O} strokeWidth={LINE * 1.8} />;
      })}
      <path d="M0 1560 C200 1480 360 1600 540 1560 C720 1520 880 1600 1080 1540 V1920 H0 Z" fill="#e47c86" {...O} />
      <g filter="url(#gb)">
        <ellipse cx={120} cy={1840} rx={260} ry={150} fill="#c45a68" />
        <ellipse cx={980} cy={120} rx={240} ry={160} fill="#c45a68" />
      </g>
    </svg>
    <Atmos t={t} tint="#5a1b2a" light={[540, 1000]} particles="#ffe9c9" />
    <Label text="GUT" />
  </AbsoluteFill>
);

/** Inside the stomach: wrinkly walls (rugae) and a bubbling acid pool. */
export const StomachSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="sb" s={12} /><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9606c" /><stop offset="1" stopColor="#f3a5a2" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#sg)" />
      {Array.from({length: 9}).map((_, i) => (
        <path key={i} d={`M-40 ${200 + i * 130} C200 ${150 + i * 130 + Math.sin(t + i) * 12} 400 ${260 + i * 130} 560 ${200 + i * 130} C720 ${140 + i * 130} 900 ${250 + i * 130} 1120 ${190 + i * 130}`} fill="none" stroke={shade('#f3a5a2', 0.2 + (i % 2) * 0.06)} strokeWidth={22} strokeLinecap="round" />
      ))}
      <path d={`M0 1400 C220 ${1370 + Math.sin(t * 2) * 14} 420 ${1430 - Math.sin(t * 2) * 14} 640 1400 C840 ${1370 + Math.sin(t * 2 + 1) * 14} 980 1420 1080 1400 V1920 H0 Z`} fill="#c7e66b" {...O} />
      <path d="M0 1460 C260 1440 500 1480 760 1450 C900 1440 1000 1460 1080 1450 V1920 H0 Z" fill="#a9d14f" />
      {Array.from({length: 18}).map((_, i) => {
        const life = (t * 0.8 + random(`b${i}`) * 3) % 3;
        return <circle key={i} cx={60 + random(`bx${i}`) * 960} cy={1880 - life * 160} r={8 + random(`br${i}`) * 16} fill="#e5f7a2" stroke={INK} strokeWidth={2.5} opacity={Math.min(1, 3 - life)} />;
      })}
      <g filter="url(#sb)"><ellipse cx={1040} cy={1700} rx={200} ry={260} fill="#8fb93a" /><ellipse cx={30} cy={300} rx={200} ry={260} fill="#b04c59" /></g>
    </svg>
    <Atmos t={t} tint="#4a1824" light={[540, 700]} />
    <Label text="STOMACH" />
  </AbsoluteFill>
);

/** Inside the mouth: a row of teeth above, the tongue below, light from the open lips. */
export const MouthSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="mb" s={10} /><radialGradient id="mg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#7b2232" /><stop offset="1" stopColor="#3d0f1b" /></radialGradient></defs>
      <rect width={W} height={H} fill="url(#mg)" />
      <ellipse cx={540} cy={760} rx={160} ry={230} fill="#2a0912" />
      <path d="M470 560 C500 700 580 700 610 560" fill="#ff8f9c" {...O} />
      <path d="M-20 360 C200 520 880 520 1100 360 V0 H-20 Z" fill="#e8626f" {...O} />
      {Array.from({length: 7}).map((_, i) => {
        const x = 30 + i * 150;
        const y = 380 + Math.abs(3 - i) * -18 + 60;
        return <path key={i} d={`M${x} ${y - 60} C${x + 10} ${y + 70} ${x + 120} ${y + 70} ${x + 130} ${y - 60} Z`} fill="#fdfbf4" {...O} />;
      })}
      <path d={`M-40 1340 C120 ${1080 + Math.sin(t * 1.5) * 20} 960 ${1080 - Math.sin(t * 1.5) * 20} 1120 1340 V1920 H-40 Z`} fill="#ff8a98" {...O} />
      <path d="M540 1180 C530 1400 550 1600 540 1920" fill="none" stroke="#e86a7b" strokeWidth={10} strokeLinecap="round" />
      {Array.from({length: 40}).map((_, i) => <circle key={i} cx={random(`tx${i}`) * 1080} cy={1240 + random(`ty${i}`) * 640} r={5} fill="#f6788a" />)}
      <g filter="url(#mb)"><ellipse cx={-40} cy={1820} rx={260} ry={200} fill="#c94a5c" /></g>
    </svg>
    <Atmos t={t} tint="#2a0912" light={[540, 300]} particles="#ffd0d6" />
    <Label text="MOUTH" y={980} />
  </AbsoluteFill>
);

/** The bloodstream: a vessel tunnel with red cells drifting past. */
export const BloodSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="vb" s={16} /><radialGradient id="vg" cx="0.5" cy="0.5" r="0.65"><stop offset="0" stopColor="#ff9a8f" /><stop offset="0.6" stopColor="#d6404c" /><stop offset="1" stopColor="#6d1424" /></radialGradient></defs>
      <rect width={W} height={H} fill="url(#vg)" />
      {[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={540} cy={960} rx={640 - k * 110} ry={1020 - k * 180} fill="none" stroke="#ff7f86" strokeWidth={8} opacity={0.35} />)}
      {Array.from({length: 16}).map((_, i) => {
        const depth = random(`d${i}`);
        const x = ((random(`x${i}`) * 1400 + t * (60 + depth * 160)) % 1400) - 160;
        const y = 120 + random(`y${i}`) * 1680;
        const s = 0.5 + depth;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${random(`r${i}`) * 60 + t * 20})`} opacity={0.5 + depth * 0.5} filter={depth < 0.25 ? 'url(#vb)' : undefined}>
            <ellipse rx={58} ry={38} fill="#e2493f" stroke={INK} strokeWidth={LINE * 1.6} />
            <ellipse rx={30} ry={18} fill="#c23a32" />
          </g>
        );
      })}
    </svg>
    <Atmos t={t} tint="#4a0d18" light={[540, 900]} particles="#ffd2c6" />
    <Label text="BLOODSTREAM" x={600} />
  </AbsoluteFill>
);

/** Inside the lungs: branching airways and grape-like air sacs. */
export const LungsSet: React.FC<{t: number}> = ({t}) => {
  const breathe = 1 + Math.sin(t * 1.4) * 0.03;
  const branch = (x: number, y: number, a: number, len: number, d: number): React.ReactNode[] => {
    if (d === 0) {
      return [<g key={`${x}${y}`}>{[0, 1, 2].map((k) => <circle key={k} cx={x + Math.cos(a + k - 1) * 22} cy={y + Math.sin(a + k - 1) * 22} r={22 * breathe} fill="#ffb3c4" {...O} strokeWidth={3} />)}</g>];
    }
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    return [
      <line key={`l${x}${y}${d}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#f7c9d3" strokeWidth={d * 10} strokeLinecap="round" />,
      ...branch(x2, y2, a - 0.45, len * 0.72, d - 1),
      ...branch(x2, y2, a + 0.45, len * 0.72, d - 1),
    ];
  };
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4a4b6" /><stop offset="1" stopColor="#d76c86" /></linearGradient></defs>
        <rect width={W} height={H} fill="url(#lg)" />
        <g transform={`translate(540 0) scale(${breathe}) translate(-540 0)`}>{branch(540, -40, Math.PI / 2, 420, 5)}</g>
      </svg>
      <Atmos t={t} tint="#6a1f3a" light={[540, 500]} />
      <Label text="LUNGS" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- the real world

/** Dr. Mira's office: mint wall with a window and body poster, a desk in front. */
export const OfficeSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="ob" s={12} /><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9efe6" /><stop offset="1" stopColor="#a8ddd1" /></linearGradient></defs>
      <rect width={W} height={1360} fill="url(#og)" />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 100} x2={i * 100} y1={0} y2={1360} stroke="#b6e3d8" strokeWidth={4} />)}
      <rect y={1340} width={W} height={580} fill="#e8c9a0" />
      {Array.from({length: 8}).map((_, i) => <line key={i} x1={0} x2={W} y1={1400 + i * 75} y2={1400 + i * 75} stroke="#d4b385" strokeWidth={6} />)}
      <rect y={1324} width={W} height={26} fill="#f6f1e7" {...O} />
      <g transform="translate(110 280)">
        <rect width={320} height={460} rx={18} fill="#fff" {...O} />
        <circle cx={160} cy={100} r={44} fill="#ffd2c4" {...O} />
        <rect x={116} y={156} width={88} height={190} rx={34} fill="#ffd2c4" {...O} />
        <circle cx={140} cy={220} r={16} fill="#ff6f7d" /><ellipse cx={178} cy={262} rx={20} ry={13} fill="#c9645a" /><circle cx={150} cy={300} r={9} fill="#f2a63c" />
        <rect x={64} y={378} width={192} height={20} rx={10} fill="#2ec4b6" /><rect x={90} y={410} width={140} height={14} rx={7} fill="#c8d6e5" />
      </g>
      <g transform="translate(660 250)">
        <rect width={320} height={380} rx={22} fill="#e8f7ff" {...O} />
        <rect x={20} y={20} width={280} height={340} rx={12} fill="#bde6ff" />
        <circle cx={90} cy={100} r={38} fill="#ffe08a" />
        <path d={`M20 300 C90 ${250 + Math.sin(t) * 6} 160 320 300 270 V360 H20 Z`} fill="#8fd6a8" />
        <line x1={160} x2={160} y1={0} y2={380} {...O} /><line x1={0} x2={320} y1={190} y2={190} {...O} />
      </g>
      <g transform="translate(560 760)"><rect width={180} height={240} rx={10} fill="#fff" {...O} /><rect x={20} y={20} width={140} height={14} rx={7} fill="#2ec4b6" />{[60, 90, 120, 150].map((y) => <rect key={y} x={20} y={y} width={140} height={10} rx={5} fill="#c8d6e5" />)}</g>
      <g transform="translate(900 1120)">
        <path d="M-56 200 L-44 70 H44 L56 200 Z" fill="#ff9f6e" {...O} />
        {[-44, 0, 44].map((a, i) => <ellipse key={i} cx={a} cy={20 - (i === 1 ? 50 : 0)} rx={32} ry={78} fill="#43c08a" {...O} transform={`rotate(${a / 2 + Math.sin(t + i) * 2} ${a} 60)`} />)}
      </g>
          </svg>
    <Atmos t={t} tint="#3d6b66" light={[780, 400]} particles="#ffffff" />
  </AbsoluteFill>
);

/** Bathroom: tiles, mirror, sink and the toilet (for the gut stories). */
export const BathroomSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#e6f3fb" />
      {Array.from({length: 12}).map((_, r) => Array.from({length: 8}).map((_, c) => (
        <rect key={`${r}-${c}`} x={c * 140 + (r % 2) * 70 - 70} y={r * 120} width={136} height={116} rx={8} fill={(r + c) % 5 === 0 ? '#cfe8f6' : '#dff0fa'} />
      )))}
      <rect y={1380} width={W} height={540} fill="#9fc7e0" />
      {Array.from({length: 8}).map((_, i) => <line key={i} x1={i * 150} x2={i * 150 - 80} y1={1380} y2={1920} stroke="#8bb7d2" strokeWidth={5} />)}
      <g transform="translate(120 360)"><rect width={360} height={460} rx={180} fill="#cfefff" {...O} /><path d="M60 80 L140 160 M100 60 L180 140" stroke="#fff" strokeWidth={16} strokeLinecap="round" opacity={0.8} /></g>
      <g transform="translate(110 900)"><path d="M0 0 H380 L340 160 H40 Z" fill="#fff" {...O} /><rect x={170} y={160} width={40} height={320} fill="#fff" {...O} /><path d="M180 0 V-60 H240" fill="none" stroke="#9fb3c8" strokeWidth={16} strokeLinecap="round" /></g>
      <g transform="translate(640 940)">
        <rect x={60} y={0} width={260} height={220} rx={30} fill="#fff" {...O} />
        <path d="M0 300 C0 250 380 250 380 300 C380 420 300 470 190 470 C80 470 0 420 0 300 Z" fill="#fff" {...O} />
        <ellipse cx={190} cy={300} rx={160} ry={40} fill="#e8f2f8" {...O} />
        <rect x={130} y={460} width={120} height={60} fill="#fff" {...O} />
      </g>
      <g transform="translate(960 760)"><circle r={70} fill="#fff" {...O} /><circle r={22} fill="#e6f3fb" {...O} /></g>
    </svg>
    <Atmos t={t} tint="#3d5a80" light={[300, 400]} />
  </AbsoluteFill>
);

/** Bedroom at night: bed, lamp glow, window with the moon (sleep stories). */
export const BedroomSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><radialGradient id="lamp" cx="0.8" cy="0.42" r="0.4"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.7" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient></defs>
      <rect width={W} height={H} fill="#2c3768" />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={i * 130} x2={i * 130} y1={0} y2={1300} stroke="#334075" strokeWidth={30} />)}
      <rect y={1300} width={W} height={620} fill="#5b4a6e" />
      <g transform="translate(120 240)">
        <rect width={360} height={420} rx={20} fill="#16204a" {...O} />
        <circle cx={250} cy={120} r={56} fill="#fff4c2" /><circle cx={226} cy={104} r={50} fill="#16204a" />
        {[[60, 90], [120, 220], [300, 300], [80, 340]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + Math.sin(t * 3 + i) * 1.5} fill="#fff" />)}
        <line x1={180} x2={180} y1={0} y2={420} {...O} />
      </g>
      <rect width={W} height={H} fill="url(#lamp)" />
      <g transform="translate(820 760)"><path d="M-70 0 H70 L40 -110 H-40 Z" fill="#ffcf6e" {...O} /><rect x={-8} y={0} width={16} height={220} fill="#c8a06a" {...O} /><rect x={-90} y={220} width={180} height={300} rx={14} fill="#8c6a4e" {...O} /></g>
      <g transform="translate(0 1120)">
        <rect x={-20} y={0} width={760} height={420} rx={30} fill="#6c7fd8" {...O} />
        <rect x={20} y={-60} width={240} height={110} rx={50} fill="#fff" {...O} />
        <path d="M-20 140 C200 100 500 160 740 120 V420 H-20 Z" fill="#8d9be6" {...O} />
      </g>
    </svg>
    <Atmos t={t} tint="#0c1230" light={[860, 700]} particles="#ffe9b0" />
  </AbsoluteFill>
);

/** One word at a time: white on a navy rounded tag, the key word in amber, a small pop-in tilt. */
export const WordCaption: React.FC<{word: string; key_?: boolean; y?: number; pop?: number}> = ({word, key_, y = 1360, pop = 1}) => (
  <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: INK, color: key_ ? '#ffc93c' : '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 96, padding: '6px 40px 14px', borderRadius: 32, letterSpacing: 1, transform: `rotate(-2deg) scale(${pop})`, boxShadow: '0 12px 0 rgba(0,0,0,0.2)', border: '5px solid #fff'}}>{word.toUpperCase()}</div>
  </div>
);

export const SETS = {throat: ThroatSet, gut: GutSet, stomach: StomachSet, mouth: MouthSet, blood: BloodSet, lungs: LungsSet, office: OfficeSet, bathroom: BathroomSet, bedroom: BedroomSet};
export type SetName = keyof typeof SETS;
