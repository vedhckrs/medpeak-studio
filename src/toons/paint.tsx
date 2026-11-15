// Painting helpers for MedPeak Toons: cel shading (a darker crescent on the shadow side), a soft
// highlight, rim light, and colour maths. Light always comes from the top-left.
import React, {useId} from 'react';
import {INK, LINE} from './rig';

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
/** amt > 0 darkens, amt < 0 lightens (0-1). Slight warm shift in shadows so they never look grey. */
export const shade = (c: string, amt: number) => {
  const [r, g, b] = hex(c);
  if (amt >= 0) return toHex(r * (1 - amt) + 18 * amt, g * (1 - amt * 1.08), b * (1 - amt * 0.9) + 30 * amt);
  const a = -amt;
  return toHex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a);
};

/**
 * A body part painted like a cartoon cel: base colour, shadow crescent bottom-right, a highlight
 * top-left and a navy outline. `d` is an SVG path; children draw details (clipped to the body).
 */
export const Shaded: React.FC<{d: string; color: string; shadow?: number; light?: number; outline?: number; children?: React.ReactNode}> = ({d, color, shadow = 0.18, light = 0.5, outline = LINE, children}) => {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={`c${id}`}><path d={d} /></clipPath></defs>
      <path d={d} fill={shade(color, shadow)} />
      <g clipPath={`url(#c${id})`}>
        <path d={d} fill={color} transform="translate(-9 -11)" />
        <path d={d} fill={shade(color, -0.18)} transform="translate(-22 -26) scale(0.96)" opacity={light * 0.6} />
        {children}
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={outline} strokeLinejoin="round" />
    </g>
  );
};

/** Shine spot (glossy cartoon highlight). */
export const Shine: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number}> = ({x, y, w = 14, h = 7, rot = -30}) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <ellipse cx={x} cy={y} rx={w} ry={h} fill="#fff" opacity={0.75} />
    <circle cx={x + w + 6} cy={y + 2} r={h * 0.45} fill="#fff" opacity={0.75} />
  </g>
);

/** Ground shadow under a character. */
export const GroundShadow: React.FC<{y?: number; w?: number}> = ({y = 98, w = 64}) => <ellipse cx={0} cy={y} rx={w} ry={9} fill="#1d2b4f" opacity={0.16} />;

/** Stubby legs with rounded shoes; `step` (-1..1) swings them for a walk cycle. */
export const Legs: React.FC<{y: number; gap?: number; color?: string; shoe?: string; step?: number; len?: number}> = ({y, gap = 22, color = '#ffffff', shoe = '#1d2b4f', step = 0, len = 22}) => (
  <g>
    {[-1, 1].map((s) => {
      const sw = step * s * 8;
      return (
        <g key={s}>
          <path d={`M${s * gap} ${y} L${s * gap + sw} ${y + len}`} stroke={INK} strokeWidth={LINE * 2.6} strokeLinecap="round" />
          <path d={`M${s * gap} ${y} L${s * gap + sw} ${y + len}`} stroke={color} strokeWidth={LINE * 1.2} strokeLinecap="round" />
          <path d={`M${s * gap + sw - 10} ${y + len + 7} Q${s * gap + sw - 10} ${y + len - 5} ${s * gap + sw + 4} ${y + len - 4} Q${s * gap + sw + 16} ${y + len - 3} ${s * gap + sw + 15} ${y + len + 7} Z`} fill={shoe} stroke={INK} strokeWidth={LINE} />
          <ellipse cx={s * gap + sw + 2} cy={y + len - 1} rx={4} ry={1.6} fill="#fff" opacity={0.5} />
        </g>
      );
    })}
  </g>
);
