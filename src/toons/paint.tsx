// Painting helpers for MedPeak Toons: cel shading (a darker crescent on the shadow side), a soft
// highlight, rim light, and colour maths. Light always comes from the top-left.
import React from 'react';
import {Contact, InkBody, Gloss} from './ink';
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

/** Every body part now goes through the v2 ink engine (feathered shading, rim light, light-aware line weight). */
export const Shaded: React.FC<{d: string; color: string; shadow?: number; light?: number; outline?: number; children?: React.ReactNode}> = ({d, color, shadow = 0.24, outline = LINE, children}) => (
  <InkBody d={d} color={color} shadow={shadow} line={outline}>{children}</InkBody>
);

/** Shine spot (glossy cartoon highlight). */
export const Shine: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number}> = ({x, y, w = 14}) => <Gloss x={x} y={y} s={w / 14} />;

/** Ground shadow under a character. */
export const GroundShadow: React.FC<{y?: number; w?: number}> = ({y = 98, w = 64}) => <Contact y={y} w={w} />;

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
