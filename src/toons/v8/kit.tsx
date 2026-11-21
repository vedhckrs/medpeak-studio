/**
 * MedPeak Toons, look v8: the shared drawing kit. EVERY v8 character, prop and sheet is drawn with
 * these pieces, so the whole cast is one family. 100% code-drawn SVG, no AI art, no stock art.
 *
 * The drawing language (studied from the reference Shorts, see skill/medpeak-health/references/toons-v8-style.md;
 * our characters and designs stay our own):
 *   - ONE outline colour (dark brown-black), thin and even, round joins. It never changes thickness with
 *     the size of a figure (non-scaling stroke): OUT for the outside of a shape, IN for lines inside it.
 *   - Flat colour. At most ONE darker tone of the same colour as a shadow shape on the lower right, and
 *     at most one lighter band. No gradients, no gloss, no glow, no texture, no drop shadow.
 *   - A face is two big white round eyes that touch or nearly touch, each with a small black pupil, thin
 *     short brows only when the feeling needs them, and a tiny mouth. No iris, no catchlight, no blush.
 *   - Body characters (organs, cells, chemicals, germs) are their own anatomy with that face on it, and
 *     thin little arms in the body colour when they need to act. Job characters wear ONE costume piece
 *     or hold ONE prop for their job, and may carry a small white name tag.
 *   - One muted colour family per character. The body family is salmon, coral, maroon and cream.
 */
import React, {useId} from 'react';
import {theme} from '../../brand/theme';

// ------------------------------------------------------------------ constants
export const INK = '#2b1a17'; // the one outline colour
export const OUT = 5.6; // outline thickness (2026-11-21, the owner: "Yes, finish it" on the bolder-line test; was 3.4). Board pixels: a board is 1920 x 1080
export const IN = 3.2; // inner line thickness (was 2.2, with OUT)
export const BG = '#fbf7f0'; // board paper
export const FONT = theme.font;

/** The body colour family (inside the body). */
export const FLESH = {
  salmon: '#ee8f93', // the usual organ wall
  coral: '#f4aaa6', // lighter lining, the lips of a tube
  rose: '#f7c3c3', // the palest inner band
  maroon: '#a8424f', // cavity, the inside of a mouth, deep tissue
  deep: '#7c2c3a', // the darkest hollow
  cream: '#f7e6cc', // fat, bone, tendon
  butter: '#f2d78a', // fat pads
  vein: '#6f7fd0', // vein blue (use rarely)
  artery: '#d9434f', // artery red
};
/** Skin tones of our people (a global cast). */
export const SKIN = {light: '#f9dcc4', warm: '#f0c39d', tan: '#d9a06f', brown: '#a9714b', deep: '#7a4e36'};
/** Everyday colours for clothes, props and rooms: muted, never neon. */
export const CLOTH = {
  white: '#ffffff', offwhite: '#f1ede4', grey: '#b9bcc6', charcoal: '#3a3f4b', black: '#26262c',
  blue: '#4a86c8', navy: '#2f4a7a', sky: '#a9d3ef', teal: '#2fb5a6', green: '#58b56e', olive: '#8a9a5b',
  yellow: '#f6c85f', orange: '#f29a4a', red: '#d9534f', pink: '#f4a6bd', purple: '#8f7fd0', brown: '#8a5a3c', tan: '#d8b58a',
};

// ------------------------------------------------------------------ colour helpers
const hex = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** The ONE darker tone of a colour, for the shadow shape (k = how much darker, default 0.14). */
export const shade = (c: string, k = 0.14) => { const [r, g, b] = hex(c); return toHex(r * (1 - k) - 4, g * (1 - k * 1.25) - 4, b * (1 - k * 1.1) - 2); };
/** The ONE lighter tone of a colour, for a lighter band. */
export const tint = (c: string, k = 0.35) => { const [r, g, b] = hex(c); return toHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k); };

// ------------------------------------------------------------------ line styles
/** Spread on the outline of a shape: {...OUTLINE}. */
export const OUTLINE = {stroke: INK, strokeWidth: OUT, strokeLinejoin: 'round', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke', fill: 'none'} as const;
/** Spread on a line inside a shape (folds, creases, hair strands, finger lines): {...INLINE}. */
export const INLINE = {stroke: INK, strokeWidth: IN, strokeLinejoin: 'round', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke', fill: 'none'} as const;
/** Spread on a FILLED shape that also carries the outline: fill={...} {...EDGE}. */
export const EDGE = {stroke: INK, strokeWidth: OUT, strokeLinejoin: 'round', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke'} as const;
/** The same, with the thin inner line. */
export const EDGE_IN = {stroke: INK, strokeWidth: IN, strokeLinejoin: 'round', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke'} as const;

// ------------------------------------------------------------------ figure box
/**
 * The drawing space of one figure: 200 x 200 units, (0, 0) in the middle, y down. `size` is its size
 * on the board in pixels. Everything inside may overflow the box.
 */
export const Fig: React.FC<{x: number; y: number; size: number; children: React.ReactNode; flip?: boolean}> = ({x, y, size, children, flip}) => (
  <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">
    <g transform={flip ? 'scale(-1 1)' : undefined}>{children}</g>
  </svg>
);

// ------------------------------------------------------------------ a filled, shaded, outlined shape
/**
 * The basic building block: a closed path with flat fill, the one darker tone as a crescent on the
 * lower right (the same path moved up and left cuts it), and the outline.
 *   shadow: 0 = flat, 1 = the usual crescent (default), up to 2 = a wide one
 *   line: 'out' (default) | 'in' (thin) | 'none'
 * Children are drawn inside the shape (clipped to it), under the outline: folds, bands, spots.
 */
export const Shape: React.FC<{d: string; fill: string; shadow?: number; line?: 'out' | 'in' | 'none'; shadeBy?: number; children?: React.ReactNode}> = ({d, fill, shadow = 1, line = 'out', shadeBy = 0.14, children}) => {
  const id = 's' + useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={fill} />
      {shadow > 0 && (
        <g clipPath={`url(#${id})`}>
          <path d={d} fill={shade(fill, shadeBy)} />
          <path d={d} fill={fill} transform={`translate(${-5 * shadow} ${-6 * shadow})`} />
        </g>
      )}
      {children && <g clipPath={`url(#${id})`}>{children}</g>}
      {line !== 'none' && <path d={d} {...(line === 'out' ? OUTLINE : INLINE)} />}
    </g>
  );
};

// ------------------------------------------------------------------ the face
export type Mood = 'open' | 'happy' | 'sad' | 'angry' | 'sleepy' | 'bored' | 'scared' | 'closed' | 'wink' | 'dizzy';
/**
 * The v8 eyes: two white circles with a small black pupil. (x, y) is the point between them.
 *   r: radius of one eye (11 to 16 for a body character 200 units tall)
 *   gap: space between the two eyes (0 = touching, the usual; never more than r * 0.5)
 *   look: where the pupils look, x and y from -1 to 1
 * A mood changes lids and brows only; the eye stays a circle.
 */
export const Eyes: React.FC<{x: number; y: number; r?: number; gap?: number; look?: [number, number]; mood?: Mood; brows?: boolean}> = ({x, y, r = 13, gap = 0, look = [0, 0], mood = 'open', brows}) => {
  const id = 'e' + useId().replace(/:/g, '');
  const cx = [x - r - gap / 2, x + r + gap / 2];
  const pr = mood === 'scared' ? r * 0.16 : r * 0.24;
  const px = look[0] * r * 0.5;
  const py = look[1] * r * 0.5;
  // the part of the eye that stays visible under a lid (everything below the lid line)
  const cut = (i: number) => {
    const c = cx[i];
    const s = i === 0 ? 1 : -1; // mirror for the right eye
    if (mood === 'sleepy') return `M ${c - r - 2} ${y - r * 0.05} L ${c + r + 2} ${y - r * 0.05} L ${c + r + 2} ${y + r + 2} L ${c - r - 2} ${y + r + 2} Z`;
    if (mood === 'bored') return `M ${c - r - 2} ${y - r * 0.4} L ${c + r + 2} ${y - r * 0.4} L ${c + r + 2} ${y + r + 2} L ${c - r - 2} ${y + r + 2} Z`;
    if (mood === 'angry') return `M ${c - s * (r + 2)} ${y - r * 1.15} L ${c + s * (r + 2)} ${y - r * 0.1} L ${c + s * (r + 2)} ${y + r + 2} L ${c - s * (r + 2)} ${y + r + 2} Z`;
    if (mood === 'sad') return `M ${c + s * (r + 2)} ${y - r * 1.15} L ${c - s * (r + 2)} ${y - r * 0.15} L ${c - s * (r + 2)} ${y + r + 2} L ${c + s * (r + 2)} ${y + r + 2} Z`;
    return null;
  };
  // the lid line itself, drawn across the eye
  const lidLine = (i: number) => {
    const c = cx[i];
    const s = i === 0 ? 1 : -1;
    if (mood === 'sleepy') return `M ${c - r} ${y - r * 0.05} L ${c + r} ${y - r * 0.05}`;
    if (mood === 'bored') { const w = r * Math.sqrt(1 - 0.16); return `M ${c - w} ${y - r * 0.4} L ${c + w} ${y - r * 0.4}`; }
    // the slanted lids meet the circle at both ends: solve the line against the circle
    const ends = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = x1 - x0, dy = y1 - y0;
      const fx = x0 - c, fy = y0 - y;
      const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
      const D = Math.sqrt(Math.max(0, B * B - 4 * A * C));
      const t0 = (-B - D) / (2 * A), t1 = (-B + D) / (2 * A);
      return `M ${x0 + dx * t0} ${y0 + dy * t0} L ${x0 + dx * t1} ${y0 + dy * t1}`;
    };
    if (mood === 'angry') return ends(c - s * (r + 2), y - r * 1.15, c + s * (r + 2), y - r * 0.1);
    if (mood === 'sad') return ends(c + s * (r + 2), y - r * 1.15, c - s * (r + 2), y - r * 0.15);
    return null;
  };
  const one = (i: number) => {
    const c = cx[i];
    const shut = mood === 'closed' || mood === 'happy' || (mood === 'wink' && i === 1);
    if (shut) {
      // a closed eye is one curved line: an arch for happy, a hanging curve for asleep
      const up = mood !== 'closed';
      return <path key={i} d={`M ${c - r * 0.8} ${y + (up ? r * 0.25 : -r * 0.1)} Q ${c} ${y + (up ? -r * 0.75 : r * 0.6)} ${c + r * 0.8} ${y + (up ? r * 0.25 : -r * 0.1)}`} {...OUTLINE} />;
    }
    const cp = cut(i);
    const ll = lidLine(i);
    return (
      <g key={i}>
        {cp && <defs><clipPath id={`${id}${i}`}><path d={cp} /></clipPath></defs>}
        <g clipPath={cp ? `url(#${id}${i})` : undefined}>
          <circle cx={c} cy={y} r={r} fill="#ffffff" />
          {mood === 'dizzy'
            ? <path d={`M ${c - r * 0.1} ${y} a ${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.3} ${r * 0.1} a ${r * 0.42} ${r * 0.42} 0 1 1 ${-r * 0.62} ${-r * 0.3} a ${r * 0.62} ${r * 0.62} 0 1 1 ${r * 0.95} ${r * 0.5}`} {...INLINE} />
            : <circle cx={c + px} cy={y + py + (cp ? r * 0.22 : 0)} r={pr} fill={INK} />}
          <circle cx={c} cy={y} r={r} {...OUTLINE} />
        </g>
        {ll && <path d={ll} {...OUTLINE} />}
      </g>
    );
  };
  const brow = brows ?? (mood === 'angry' || mood === 'sad' || mood === 'scared');
  const b = (i: number) => {
    const c = cx[i];
    const s = i === 0 ? 1 : -1;
    const tilt = mood === 'angry' ? 0.5 : mood === 'sad' || mood === 'scared' ? -0.45 : 0.1;
    const lift = mood === 'scared' ? r * 0.45 : mood === 'angry' ? -r * 0.05 : r * 0.25;
    const yy = y - r - lift - r * 0.18;
    return <path key={'b' + i} d={`M ${c - s * r * 0.75} ${yy - tilt * r * 0.5} Q ${c} ${yy - r * 0.28} ${c + s * r * 0.75} ${yy + tilt * r * 0.5}`} {...INLINE} />;
  };
  return <g>{one(0)}{one(1)}{brow && <>{b(0)}{b(1)}</>}</g>;
};

export type MouthKind = 'smile' | 'flat' | 'frown' | 'open' | 'o' | 'grit' | 'wavy' | 'tongue' | 'big';
/** The v8 mouth: tiny. (x, y) is its middle, w its width (10 to 22 for a body character). */
export const Mouth: React.FC<{x: number; y: number; w?: number; kind?: MouthKind}> = ({x, y, w = 14, kind = 'smile'}) => {
  const h = w / 2;
  switch (kind) {
    case 'flat': return <path d={`M ${x - h} ${y} L ${x + h} ${y}`} {...OUTLINE} />;
    case 'frown': return <path d={`M ${x - h} ${y + h * 0.35} Q ${x} ${y - h * 0.7} ${x + h} ${y + h * 0.35}`} {...OUTLINE} />;
    case 'wavy': return <path d={`M ${x - h} ${y} q ${h * 0.25} ${-h * 0.5} ${h * 0.5} 0 t ${h * 0.5} 0 t ${h * 0.5} 0 t ${h * 0.5} 0`} {...OUTLINE} />;
    case 'o': return <ellipse cx={x} cy={y} rx={h * 0.5} ry={h * 0.62} fill={FLESH.deep} {...EDGE} />;
    case 'open': {
      const d = `M ${x - h} ${y - h * 0.3} Q ${x} ${y + h * 1.5} ${x + h} ${y - h * 0.3} Z`;
      return (
        <g>
          <path d={d} fill={FLESH.deep} />
          <path d={`M ${x - h * 0.45} ${y + h * 0.42} Q ${x} ${y + h * 0.05} ${x + h * 0.45} ${y + h * 0.42} Q ${x} ${y + h * 0.78} ${x - h * 0.45} ${y + h * 0.42} Z`} fill={FLESH.salmon} />
          <path d={d} {...OUTLINE} />
        </g>
      );
    }
    case 'big': {
      const d = `M ${x - h} ${y - h * 0.5} L ${x + h} ${y - h * 0.5} Q ${x + h * 0.9} ${y + h * 1.3} ${x} ${y + h * 1.3} Q ${x - h * 0.9} ${y + h * 1.3} ${x - h} ${y - h * 0.5} Z`;
      return (
        <g>
          <path d={d} fill={FLESH.deep} />
          <path d={`M ${x - h * 0.55} ${y + h * 0.8} Q ${x} ${y + h * 0.3} ${x + h * 0.55} ${y + h * 0.8} Q ${x} ${y + h * 1.28} ${x - h * 0.55} ${y + h * 0.8} Z`} fill={FLESH.salmon} />
          <path d={d} {...OUTLINE} />
        </g>
      );
    }
    case 'grit': return (
      <g>
        <rect x={x - h} y={y - h * 0.38} width={w} height={h * 0.76} rx={h * 0.3} fill="#ffffff" />
        <path d={`M ${x - h * 0.34} ${y - h * 0.38} v ${h * 0.76} M ${x + h * 0.34} ${y - h * 0.38} v ${h * 0.76} M ${x - h} ${y} h ${w}`} {...INLINE} />
        <rect x={x - h} y={y - h * 0.38} width={w} height={h * 0.76} rx={h * 0.3} {...OUTLINE} />
      </g>
    );
    case 'tongue': return (
      <g>
        <path d={`M ${x - h} ${y - h * 0.2} Q ${x} ${y + h * 0.9} ${x + h} ${y - h * 0.2}`} {...OUTLINE} />
        <path d={`M ${x - h * 0.1} ${y + h * 0.33} q ${h * 0.05} ${h * 0.75} ${h * 0.4} ${h * 0.7} q ${h * 0.3} ${-h * 0.1} ${h * 0.2} ${-h * 0.85}`} fill={FLESH.salmon} {...EDGE_IN} />
      </g>
    );
    default: return <path d={`M ${x - h} ${y - h * 0.2} Q ${x} ${y + h * 0.75} ${x + h} ${y - h * 0.2}`} {...OUTLINE} />;
  }
};

/**
 * What every v8 body character and job character takes. It draws itself in the 200-unit figure space,
 * centred on (0, 0), inside about -92..92 both ways, so any of them can stand in a <Fig>.
 */
export type V8Props = {mood?: Mood; mouth?: MouthKind; look?: [number, number]};

// ------------------------------------------------------------------ little arms and legs for body characters
/**
 * The arm of a body character: a thin tube in the body colour from the shoulder to the hand, curving
 * through `bend`, ending in a small mitten hand with a thumb. hand: 'mitten' | 'fist' | 'open' | 'none'.
 * Draw an arm BEFORE the body when it goes behind it, AFTER when it is in front.
 */
export const TinyArm: React.FC<{from: [number, number]; to: [number, number]; bend?: [number, number]; fill: string; w?: number; hand?: 'mitten' | 'fist' | 'open' | 'none'}> = ({from, to, bend, fill, w = 5.5, hand = 'mitten'}) => {
  const mid = bend ?? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const d = `M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`;
  const deg = (Math.atan2(to[1] - mid[1], to[0] - mid[0]) * 180) / Math.PI;
  const r = w * 0.95;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w + 2.4} strokeLinecap="round" fill="none" />
      <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none" />
      {hand !== 'none' && (
        <g transform={`translate(${to[0]} ${to[1]}) rotate(${deg})`}>
          {hand === 'open' ? (
            <path d={`M ${-r * 0.3} ${-r} Q ${r * 0.9} ${-r * 1.5} ${r * 1.5} ${-r * 1.15} Q ${r * 1.2} ${-r * 0.6} ${r * 1.0} ${-r * 0.5} Q ${r * 2.0} ${-r * 0.55} ${r * 2.1} ${-r * 0.05} Q ${r * 2.0} ${r * 0.4} ${r * 1.0} ${r * 0.3} Q ${r * 1.7} ${r * 0.75} ${r * 1.45} ${r * 1.15} Q ${r * 0.8} ${r * 1.5} ${-r * 0.3} ${r} Z`} fill={fill} {...EDGE_IN} />
          ) : (
            <>
              <path d={`M ${-r * 0.4} ${-r} Q ${r * 1.5} ${-r * 1.25} ${r * 1.6} 0 Q ${r * 1.5} ${r * 1.25} ${-r * 0.4} ${r} Z`} fill={fill} {...EDGE_IN} />
              <path d={`M ${r * 0.1} ${-r * 0.95} Q ${r * 0.35} ${-r * 1.75} ${r * 0.95} ${-r * 1.05}`} fill={fill} {...EDGE_IN} />
              {hand === 'fist' && <path d={`M ${r * 0.7} ${-r * 0.45} h ${r * 0.6} M ${r * 0.75} ${r * 0.05} h ${r * 0.65} M ${r * 0.7} ${r * 0.5} h ${r * 0.55}`} {...INLINE} />}
            </>
          )}
        </g>
      )}
    </g>
  );
};

/** The leg of a body character: a short tube in the body colour ending in a small rounded foot. */
export const TinyLeg: React.FC<{from: [number, number]; to: [number, number]; fill: string; w?: number; foot?: 1 | -1}> = ({from, to, fill, w = 5.5, foot = 1}) => (
  <g>
    <path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={INK} strokeWidth={w + 2.4} strokeLinecap="round" fill="none" />
    <path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none" />
    <path d={`M ${to[0] - foot * w * 0.7} ${to[1] - w * 0.2} Q ${to[0] - foot * w * 0.8} ${to[1] + w} ${to[0]} ${to[1] + w} L ${to[0] + foot * w * 1.6} ${to[1] + w} Q ${to[0] + foot * w * 2.1} ${to[1] + w * 0.2} ${to[0] + foot * w * 1.0} ${to[1] - w * 0.1} Z`} fill={fill} {...EDGE_IN} />
  </g>
);

// ------------------------------------------------------------------ the name tag
/** The small white name tag a job character carries (black border, black capitals). */
export const NameTag: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 9, rot = 0}) => {
  const w = text.length * size * 0.66 + size * 1.2;
  const h = size * 1.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={1.5} fill="#ffffff" {...EDGE_IN} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK} letterSpacing={0.4}>{text.toUpperCase()}</text>
    </g>
  );
};

// ------------------------------------------------------------------ boards (the approval sheets)
/** A 1920 x 1080 approval sheet. Content starts below y = 160. */
export const Board: React.FC<{kicker: string; title: string; note?: string; page?: string; children: React.ReactNode}> = ({kicker, title, note, page, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: BG, fontFamily: FONT, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 10, background: CLOTH.teal}} />
    <div style={{position: 'absolute', left: 56, top: 30, fontSize: 19, fontWeight: 800, letterSpacing: 1.6, color: CLOTH.teal}}>{kicker.toUpperCase()}</div>
    <div style={{position: 'absolute', left: 56, top: 52, fontSize: 44, fontWeight: 900, color: INK, letterSpacing: -0.5}}>{title}</div>
    {note && <div style={{position: 'absolute', left: 58, top: 112, width: 1500, fontSize: 19, fontWeight: 600, color: '#75645d'}}>{note}</div>}
    <div style={{position: 'absolute', right: 56, top: 34, fontSize: 16, fontWeight: 800, color: '#a3948c', textAlign: 'right', lineHeight: 1.4}}>MedPeak Toons · look v8 · code-drawn{page ? <><br />{page}</> : null}</div>
    {children}
  </div>
);
/** A label under a figure on a board: a bold name and an optional small note. (x = the middle, y = the top.) */
export const Caption: React.FC<{x: number; y: number; name: string; note?: string; w?: number; size?: number}> = ({x, y, name, note, w = 260, size = 22}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontFamily: FONT}}>
    <div style={{fontSize: size, fontWeight: 800, color: INK}}>{name}</div>
    {note && <div style={{fontSize: Math.max(13, size * 0.66), fontWeight: 600, color: '#8a7a72', marginTop: 2, lineHeight: 1.25}}>{note}</div>}
  </div>
);
/** A white panel behind a group of figures, with an optional small heading. */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; label?: string}> = ({x, y, w, h, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, background: '#ffffff', border: '2px solid #ece3d6', boxSizing: 'border-box'}}>
    {label && <div style={{position: 'absolute', left: 18, top: 12, fontFamily: FONT, fontSize: 16, fontWeight: 800, letterSpacing: 1.2, color: CLOTH.teal}}>{label.toUpperCase()}</div>}
  </div>
);
/** The floor mark under a standing figure: a flat pale ellipse (the only "shadow" on a board). */
export const Ground: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.06, width: w, height: w * 0.12, borderRadius: '50%', background: '#e9dfd2'}} />
);
