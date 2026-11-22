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
import React, {createContext, useContext, useId} from 'react';
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
export type Mood = 'open' | 'happy' | 'sad' | 'angry' | 'sleepy' | 'bored' | 'scared' | 'closed' | 'wink' | 'dizzy'
  // engine v9 lid moods (format 6; in the old look they fall back to the nearest old mood)
  | 'pain' | 'side' | 'squint' | 'shock';
/**
 * The v8 eyes: two white circles with a small black pupil. (x, y) is the point between them.
 *   r: radius of one eye (11 to 16 for a body character 200 units tall)
 *   gap: space between the two eyes (0 = touching, the usual; never more than r * 0.5)
 *   look: where the pupils look, x and y from -1 to 1
 * A mood changes lids and brows only; the eye stays a circle.
 */
const OLD_MOOD: Partial<Record<Mood, Mood>> = {pain: 'sad', side: 'bored', squint: 'bored', shock: 'scared'};
const EyesV8: React.FC<EyesProps> = ({x, y, r = 13, gap = 0, look = [0, 0], mood: mood0 = 'open', brows}) => {
  const mood = OLD_MOOD[mood0] ?? mood0;
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
const MouthV8: React.FC<{x: number; y: number; w?: number; kind?: MouthKind}> = ({x, y, w = 14, kind = 'smile'}) => {
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
/** Engine v9 extras for any body character's face (read by `Eyes` from `FaceCtx`, so no character file changes): see `Acting`. */
export type FaceExtras = {lid?: number; turn?: number; overlap?: number};

// ------------------------------------------------------------------ little arms and legs for body characters
/**
 * The arm of a body character: a thin tube in the body colour from the shoulder to the hand, curving
 * through `bend`, ending in a small mitten hand with a thumb. hand: 'mitten' | 'fist' | 'open' | 'none'.
 * Draw an arm BEFORE the body when it goes behind it, AFTER when it is in front.
 */
const TinyArmV8: React.FC<TinyArmProps> = ({from, to, bend, fill, w = 5.5, hand: hand0 = 'mitten'}) => {
  const hand = hand0 === 'grip' ? 'fist' : hand0;
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
const TinyLegV8: React.FC<TinyLegProps> = ({from, to, fill, w = 5.5, foot = 1}) => (
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

// =====================================================================================================================
// ENGINE v9 (format 6, 2026-11-23; plans/engine-upgrade-2026-11-23/05-blueprint.md Part 4.1). Everything below is
// switched on ONLY inside <V9> (the player wraps a format-6 video in it; the sheets wrap their "after" side). Outside it
// every piece above draws exactly as before, so the videos already out (rabies, no-sleep, creatine, quit-sugar, fasting,
// snake-bite) render unchanged.
// =====================================================================================================================

/** The look switch: false = look v8 as it was; true = engine v9 (oval turned eyes, rim pupils, lids, outlined arms...). */
export const LookCtx = createContext<{v9: boolean}>({v9: false});
export const useV9 = () => useContext(LookCtx).v9;
/** Turn engine v9 on (or off with on={false}) for everything inside. */
export const V9: React.FC<{on?: boolean; children: React.ReactNode}> = ({on = true, children}) => <LookCtx.Provider value={{v9: on}}>{children}</LookCtx.Provider>;

/**
 * Face extras for every `Eyes` inside (v9 only): `lid` 0..1 (a continuous upper lid: the 0.2 s blink is open, half,
 * shut, half, open), `turn` -1..1 (a three-quarter face: the eye on the turn side 10% smaller, both eyes shifted that
 * way), `overlap` 0..0.15 of an eye. Wrap a character: <Acting lid={blink(t, 3)} turn={0.4}><Stomach .../></Acting>.
 */
export const FaceCtx = createContext<FaceExtras>({});
export const Acting: React.FC<FaceExtras & {children: React.ReactNode}> = ({children, ...f}) => <FaceCtx.Provider value={f}>{children}</FaceCtx.Provider>;

// ------------------------------------------------------------------ the line under the camera's zoom
/**
 * The camera zooms with a CSS scale() on a div, which `vector-effect: non-scaling-stroke` does not undo, so the line
 * doubled in a 2x push (A1 #6). Fix: the camera div gets class `ink-zoom` and `--ink-k: 1/z`; this style sheet
 * rewrites the kit's line widths (5.6 outline, 3.2 inner, and the 11.2 / 6.4 outline passes) by that factor, so the
 * line stays 5.6 px ON SCREEN at any zoom. It matches only the kit's own widths: a drawing that set its own width
 * keeps it. Without the class nothing changes (old videos). Usage in the player:
 *   <InkZoom z={z} style={{transform: ...}}>...</InkZoom>
 * or by hand: className={INK_ZOOM_CLASS} style={{...inkZoomVars(z)}} and one <style>{INK_ZOOM_CSS}</style> inside.
 */
export const INK_ZOOM_CLASS = 'ink-zoom';
const INK_WIDTHS = [OUT, IN, OUT * 2, IN * 2];
export const INK_ZOOM_CSS = INK_WIDTHS.map((w) => `.${INK_ZOOM_CLASS} [stroke-width="${w}"]{stroke-width:calc(${w}px * var(--ink-k, 1))}`).join('\n');
export const inkZoomVars = (z: number) => ({['--ink-k' as string]: (1 / Math.max(0.05, z)).toFixed(4)}) as React.CSSProperties;
export const InkZoom: React.FC<{z: number; style?: React.CSSProperties; children: React.ReactNode}> = ({z, style, children}) => (
  <div className={INK_ZOOM_CLASS} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', ...style, ...inkZoomVars(z)}}>
    <style>{INK_ZOOM_CSS}</style>
    {children}
  </div>
);

// ------------------------------------------------------------------ palettes
/**
 * The warm flesh family measured on the reference Shorts (A1 #2): every body shot is built from these (60%+ warm, any
 * other colour family 8% or less, kept for the intruder). Added to FLESH (old keys unchanged).
 */
Object.assign(FLESH, {
  cavity: '#a6706e', cavityDeep: '#7f5956', organRed: '#aa4148', wallRim: '#c04355', wall: '#ec8391',
  gut: '#cd717f', gutShade: '#a34757', fat: '#f6db87', bile: '#e9ce80', bone: '#f4e4d5',
});
export const FLESH9 = FLESH as typeof FLESH & {cavity: string; cavityDeep: string; organRed: string; wallRim: string; wall: string; gut: string; gutShade: string; fat: string; bile: string; bone: string};
/** The pale, quiet room palette (saturation 0.22 or less, brightness 165+; A1 #2, decision 7). */
export const ROOM = {mint: '#f1fbfb', grey: '#e9eef2', cream: '#f3efe6', sky: '#dfe9f1', deepest: '#9db8c9', floor: '#d9dde2', floorEdge: '#c4cad1', trim: '#cdd6de', wood: '#d8c3a5'};

// ------------------------------------------------------------------ small helpers
type P2 = [number, number];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const r2 = (n: number) => Math.round(n * 100) / 100;
/** A seeded random 0..1 sequence (mulberry32): the same seed always draws the same folds and specks. */
export const seeded = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const qAt = (a: P2, b: P2, c: P2, u: number): P2 => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
const nrm2 = (v: P2): P2 => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const ptsD = (pts: P2[], close = true) => 'M ' + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(' L ') + (close ? ' Z' : '');
/** A smooth closed outline through points (Catmull-Rom as cubic beziers), for stage shapes. */
export const smoothD = (pts: P2[], k = 1): string => {
  const n = pts.length;
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C ${r2(p1[0] + ((p2[0] - p0[0]) * k) / 6)} ${r2(p1[1] + ((p2[1] - p0[1]) * k) / 6)} ${r2(p2[0] - ((p3[0] - p1[0]) * k) / 6)} ${r2(p2[1] - ((p3[1] - p1[1]) * k) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d + ' Z';
};
/** The same through an OPEN line (no closing segment). */
export const openD = (pts: P2[], k = 1): string => {
  const n = pts.length;
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    d += ` C ${r2(p1[0] + ((p2[0] - p0[0]) * k) / 6)} ${r2(p1[1] + ((p2[1] - p0[1]) * k) / 6)} ${r2(p2[0] - ((p3[0] - p1[0]) * k) / 6)} ${r2(p2[1] - ((p3[1] - p1[1]) * k) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
};

// ------------------------------------------------------------------ v9 eyes
export type EyesProps = {
  x: number; y: number; r?: number; gap?: number; look?: [number, number]; mood?: Mood; brows?: boolean;
  /** v9: a continuous upper lid 0..1 (1 = shut). */ lid?: number;
  /** v9: -1..1, a three-quarter face (the eye on the turn side is 10% smaller, both shift that way). */ turn?: number;
  /** v9: 0..0.15 of an eye, the eyes overlap a little. */ overlap?: number;
  /** v9: a point in the same units to look at (wins over `look`); the pupils go 0.85 of the way to the rim. */ lookAt?: [number, number];
};
/** How far a mood's upper lid comes down (0..1 of the eye) and its slant (+: the inner end lower, angry). */
const LID: Partial<Record<Mood, {L: number; tilt?: number; low?: number}>> = {
  angry: {L: 0.3, tilt: 0.5}, sad: {L: 0.28, tilt: -0.45}, pain: {L: 0.44, tilt: -0.38}, bored: {L: 0.32}, sleepy: {L: 0.5},
  side: {L: 0.3}, squint: {L: 0.46, low: 0.24},
};
/**
 * The v9 eye (decision 10): upright ovals (1.12 times taller than wide), pupils 0.18 of the eye (0.13 scared/shock)
 * that can touch the rim, a continuous lid, a turn and a small overlap. Still one eye for the whole cast.
 */
const EyesV9: React.FC<EyesProps> = ({x, y, r = 13, gap = 0, look, mood = 'open', brows, lid, turn, overlap, lookAt}) => {
  const id = 'e9' + useId().replace(/:/g, '');
  const fx = useContext(FaceCtx);
  const lidK = clamp(lid ?? fx.lid ?? 0, 0, 1);
  const tn = clamp(turn ?? fx.turn ?? 0, -1, 1);
  const ov = clamp(overlap ?? fx.overlap ?? 0, 0, 0.15) * 2 * r;
  const rs = [r * (tn < 0 ? 1 + 0.12 * tn : 1), r * (tn > 0 ? 1 - 0.12 * tn : 1)];
  const shift = tn * r * 0.32;
  const cx = [x + shift - gap / 2 - rs[0] + ov / 2, x + shift + gap / 2 + rs[1] - ov / 2];
  // where the pupils look: lookAt > look > the mood's own
  let lk: P2 = look ?? (mood === 'side' ? [0.92, 0.05] : [0, 0]);
  if (lookAt) { const v = nrm2([lookAt[0] - x, lookAt[1] - y]); lk = [v[0] * 0.85, v[1] * 0.85]; }
  const m = Math.hypot(lk[0], lk[1]);
  if (m > 1) lk = [lk[0] / m, lk[1] / m];
  const ml = LID[mood];
  const one = (i: number) => {
    const c = cx[i], rx = rs[i], ry = rx * 1.12;
    const inner = i === 0 ? 1 : -1; // +x is the inner side of the left eye
    const shut = mood === 'closed' || mood === 'happy' || (mood === 'wink' && i === 1) || lidK >= 0.93;
    if (shut) {
      const up = mood === 'happy' || (mood === 'wink' && i === 1);
      return <path key={i} d={`M ${r2(c - rx * 0.85)} ${r2(y + (up ? ry * 0.25 : -ry * 0.05))} Q ${r2(c)} ${r2(y + (up ? -ry * 0.7 : ry * 0.55))} ${r2(c + rx * 0.85)} ${r2(y + (up ? ry * 0.25 : -ry * 0.05))}`} {...OUTLINE} />;
    }
    // the upper lid: the mood's lid or the blink's, whichever is lower; a blink straightens the slant
    const Lm = ml?.L ?? 0;
    const L = Math.max(Lm, lidK);
    const tilt = (ml?.tilt ?? 0) * (lidK > Lm ? Math.max(0, 1 - (lidK - Lm) / (1 - Lm + 0.001)) : 1);
    const top = y - ry;
    const yl = top + L * 2 * ry;
    const yIn = yl + tilt * ry * 0.5, yOut = yl - tilt * ry * 0.5;
    const xa = c - inner * (rx + 3), xb = c + inner * (rx + 3);
    const hasLid = L > 0.005;
    const low = ml?.low ?? 0;
    const yLow = y + ry - low * 2 * ry;
    const clipD = (hasLid ? `M ${r2(xa)} ${r2(yOut)} L ${r2(xb)} ${r2(yIn)}` : `M ${r2(c - rx - 4)} ${r2(top - 4)} L ${r2(c + rx + 4)} ${r2(top - 4)}`)
      + (low > 0 ? ` L ${r2(xb)} ${r2(yLow)} L ${r2(xa)} ${r2(yLow)} Z` : ` L ${r2(hasLid ? xb : c + rx + 4)} ${r2(y + ry + 4)} L ${r2(hasLid ? xa : c - rx - 4)} ${r2(y + ry + 4)} Z`);
    // the pupil: up to the rim along `lk`, kept below the lid
    const pr = (mood === 'scared' || mood === 'shock' ? 0.13 : 0.18) * rx;
    const px = c + lk[0] * (rx - pr - 1.5);
    let py = y + lk[1] * (ry - pr - 1.5);
    if (hasLid) py = Math.max(py, yl + pr * 1.05);
    if (low > 0) py = Math.min(py, yLow - pr * 1.05);
    const eye = `M ${r2(c - rx)} ${r2(y)} A ${r2(rx)} ${r2(ry)} 0 1 0 ${r2(c + rx)} ${r2(y)} A ${r2(rx)} ${r2(ry)} 0 1 0 ${r2(c - rx)} ${r2(y)} Z`;
    return (
      <g key={i}>
        <defs>
          <clipPath id={`${id}c${i}`}><path d={clipD} /></clipPath>
          <clipPath id={`${id}o${i}`}><ellipse cx={c} cy={y} rx={rx + 1.2} ry={ry + 1.2} /></clipPath>
        </defs>
        <g clipPath={`url(#${id}c${i})`}>
          <path d={eye} fill="#ffffff" />
          {mood === 'dizzy'
            ? <path d={`M ${c - rx * 0.1} ${y} a ${rx * 0.2} ${rx * 0.2} 0 1 1 ${rx * 0.3} ${rx * 0.1} a ${rx * 0.42} ${rx * 0.42} 0 1 1 ${-rx * 0.62} ${-rx * 0.3} a ${rx * 0.62} ${rx * 0.62} 0 1 1 ${rx * 0.95} ${rx * 0.5}`} {...INLINE} />
            : <circle cx={r2(px)} cy={r2(py)} r={r2(pr)} fill={INK} />}
          <path d={eye} {...OUTLINE} />
        </g>
        {hasLid && <g clipPath={`url(#${id}o${i})`}><path d={`M ${r2(xa)} ${r2(yOut)} L ${r2(xb)} ${r2(yIn)}`} {...OUTLINE} /></g>}
        {low > 0 && <g clipPath={`url(#${id}o${i})`}><path d={`M ${r2(xa)} ${r2(yLow)} L ${r2(xb)} ${r2(yLow)}`} {...INLINE} /></g>}
      </g>
    );
  };
  const brow = brows ?? (['angry', 'sad', 'scared', 'pain', 'shock', 'squint'] as Mood[]).includes(mood);
  const b = (i: number) => {
    const c = cx[i], rx = rs[i], ry = rx * 1.12;
    const s = i === 0 ? 1 : -1;
    const tilt = mood === 'angry' ? 0.5 : mood === 'squint' ? 0.25 : mood === 'sad' || mood === 'scared' ? -0.45 : mood === 'pain' ? -0.6 : 0.1;
    const lift = mood === 'shock' ? rx * 0.7 : mood === 'scared' ? rx * 0.45 : mood === 'angry' || mood === 'squint' ? -rx * 0.05 : mood === 'pain' ? rx * 0.3 : rx * 0.25;
    const yy = y - ry - lift - rx * 0.18;
    return <path key={'b' + i} d={`M ${r2(c - s * rx * 0.75)} ${r2(yy - tilt * rx * 0.5)} Q ${r2(c)} ${r2(yy - rx * 0.28)} ${r2(c + s * rx * 0.75)} ${r2(yy + tilt * rx * 0.5)}`} {...INLINE} />;
  };
  // the far eye first, so the near one overlaps it
  const order = tn > 0 ? [1, 0] : [0, 1];
  return <g>{order.map(one)}{brow && <>{b(0)}{b(1)}</>}</g>;
};
/** THE eyes of the whole cast: the v8 eye, or the v9 eye inside <V9>. */
export const Eyes: React.FC<EyesProps> = (p) => (useV9() ? <EyesV9 {...p} /> : <EyesV8 {...p} />);

/** THE mouth. v9: no teeth-grid `grit` on body characters (it becomes `flat`; A1 #5, decision 10). */
export const Mouth: React.FC<{x: number; y: number; w?: number; kind?: MouthKind}> = (p) => {
  const v9 = useV9();
  return <MouthV8 {...p} kind={v9 && p.kind === 'grit' ? 'flat' : p.kind} />;
};

// ------------------------------------------------------------------ v9 arms and legs: outlined shapes, one line
export type TinyHand = 'mitten' | 'fist' | 'open' | 'grip' | 'none';
export type TinyArmProps = {from: [number, number]; to: [number, number]; bend?: [number, number]; fill: string; w?: number; hand?: TinyHand;
  /** v9 `grip`: the stick it holds (drawn through the fist, the fingers wrap it), length either side and colour. */ rod?: {len: number; color: string}};
export type TinyLegProps = {from: [number, number]; to: [number, number]; fill: string; w?: number; foot?: 1 | -1};
/** A tube along a quadratic curve: flat at the root (pushed `back` units into the body), round at the end. */
const tubeD = (a: P2, c: P2, b: P2, w: number, back: number) => {
  const n = 14;
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) pts.push(qAt(a, c, b, i / n));
  const t0 = nrm2([pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]]);
  pts.unshift([a[0] - t0[0] * back, a[1] - t0[1] * back]);
  const L: P2[] = [], R: P2[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const tg = nrm2([q[0] - o[0], q[1] - o[1]]);
    const nn: P2 = [-tg[1], tg[0]];
    L.push([p[0] + nn[0] * w / 2, p[1] + nn[1] * w / 2]); R.push([p[0] - nn[0] * w / 2, p[1] - nn[1] * w / 2]);
  });
  const end = pts[pts.length - 1], te = nrm2([end[0] - pts[pts.length - 2][0], end[1] - pts[pts.length - 2][1]]);
  const nE: P2 = [-te[1], te[0]];
  const cap: P2[] = [];
  for (let k = 1; k < 8; k++) { const ang = Math.PI / 2 - (Math.PI * k) / 8; const ca = Math.cos(ang), sa = Math.sin(ang); cap.push([end[0] + (nE[0] * sa + te[0] * ca) * w / 2, end[1] + (nE[1] * sa + te[1] * ca) * w / 2]); }
  return {fill: ptsD([...L, ...cap, ...R.slice().reverse()]), sideA: ptsD(L.slice(1), false), sideB: ptsD(R.slice(1), false), end: ptsD([...L.slice(1), ...cap, ...R.slice(1).reverse()], false)};
};
const capsuleD = (a: P2, ra: number, b: P2, rb: number) => {
  const d = nrm2([b[0] - a[0], b[1] - a[1]]), n: P2 = [-d[1], d[0]];
  const pts: P2[] = [];
  for (let k = 0; k <= 8; k++) { const ang = -Math.PI / 2 + (Math.PI * k) / 8; pts.push([b[0] + (d[0] * Math.cos(ang) - n[0] * Math.sin(ang)) * rb, b[1] + (d[1] * Math.cos(ang) - n[1] * Math.sin(ang)) * rb]); }
  for (let k = 0; k <= 8; k++) { const ang = Math.PI / 2 + (Math.PI * k) / 8; pts.push([a[0] + (d[0] * Math.cos(ang) - n[0] * Math.sin(ang)) * ra, a[1] + (d[1] * Math.cos(ang) - n[1] * Math.sin(ang)) * ra]); }
  return ptsD(pts);
};
/** The v9 hand shapes in the hand's own frame (+x along the forearm, unit r): outline parts and inner lines. */
const tinyHand = (hand: TinyHand, r: number): {parts: string[]; lines: string[]} => {
  const palm = `M ${r2(-r * 0.3)} ${r2(-r * 0.95)} Q ${r2(r * 1.45)} ${r2(-r * 1.2)} ${r2(r * 1.55)} 0 Q ${r2(r * 1.45)} ${r2(r * 1.2)} ${r2(-r * 0.3)} ${r2(r * 0.95)} Z`;
  const thumb = capsuleD([r * 0.25, -r * 0.7], r * 0.36, [r * 0.85, -r * 1.35], r * 0.3);
  if (hand === 'open') {
    // four short rounded fingers side by side, the thumb low on the side (A4 O5: no tulip crown)
    const base = `M ${r2(-r * 0.3)} ${r2(-r * 0.9)} Q ${r2(r * 0.7)} ${r2(-r * 1.05)} ${r2(r * 1.15)} ${r2(-r * 0.85)} L ${r2(r * 1.2)} ${r2(r * 0.85)} Q ${r2(r * 0.7)} ${r2(r * 1.05)} ${r2(-r * 0.3)} ${r2(r * 0.9)} Z`;
    const f = [[-0.64, -12], [-0.22, -4], [0.22, 4], [0.64, 12]].map(([yy, a], i) => {
      const t = (a * Math.PI) / 180, l = r * (i === 0 || i === 3 ? 0.7 : 0.86);
      const s: P2 = [r * 1.0, r * yy];
      return capsuleD(s, r * 0.24, [s[0] + Math.cos(t) * l, s[1] + Math.sin(t) * l], r * 0.23);
    });
    return {parts: [base, ...f, capsuleD([r * 0.1, -r * 0.75], r * 0.3, [r * 0.55, -r * 1.45], r * 0.26)], lines: []};
  }
  if (hand === 'fist' || hand === 'grip') {
    const lines = hand === 'grip'
      ? [`M ${r2(r * 0.5)} ${r2(-r * 0.9)} Q ${r2(r * 1.1)} ${r2(-r * 0.62)} ${r2(r * 0.62)} ${r2(-r * 0.3)}`, `M ${r2(r * 0.58)} ${r2(-r * 0.3)} Q ${r2(r * 1.18)} 0 ${r2(r * 0.62)} ${r2(r * 0.3)}`, `M ${r2(r * 0.56)} ${r2(r * 0.3)} Q ${r2(r * 1.08)} ${r2(r * 0.6)} ${r2(r * 0.52)} ${r2(r * 0.88)}`]
      : [`M ${r2(r * 0.7)} ${r2(-r * 0.45)} h ${r2(r * 0.6)} M ${r2(r * 0.75)} ${r2(r * 0.05)} h ${r2(r * 0.65)} M ${r2(r * 0.7)} ${r2(r * 0.5)} h ${r2(r * 0.55)}`];
    return {parts: [palm, thumb], lines};
  }
  // mitten: fingers together, one split line
  return {parts: [palm, thumb], lines: [`M ${r2(r * 1.5)} ${r2(r * 0.15)} L ${r2(r * 0.85)} ${r2(r * 0.18)}`]};
};
const FAT = {stroke: INK, strokeWidth: OUT * 2, strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke'} as const;
/**
 * The v9 arm (A4 O4, O5): a closed outlined shape with the SAME outline as the body (OUT, non-scaling), flat at the
 * root and pushed 8 units into the body so it grows out of it (no cap drawn over the body line), a hand of the same
 * line: `mitten`, `fist`, `open` (four short fingers, thumb low), `grip` (wraps a `rod`).
 */
const TinyArmV9: React.FC<TinyArmProps> = ({from, to, bend, fill, w = 5.5, hand = 'mitten', rod}) => {
  const W = w * 1.55;
  const mid: P2 = bend ?? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const tb = tubeD(from, mid, to, W, 8);
  const deg = (Math.atan2(to[1] - mid[1], to[0] - mid[0]) * 180) / Math.PI;
  const hr = Math.min(W, 9.2); // one hand size for the cast: a thick arm does not get a giant glove
  const h = hand === 'none' ? null : tinyHand(hand, hr);
  const ht = `translate(${r2(to[0])} ${r2(to[1])}) rotate(${r2(deg)})`;
  return (
    <g>
      {h && hand === 'grip' && rod && <g transform={ht}><path d={`M ${r2(hr * 0.62)} ${-rod.len} L ${r2(hr * 0.62)} ${rod.len}`} stroke={INK} strokeWidth={hr * 0.62 + 2.6} strokeLinecap="round" /><path d={`M ${r2(hr * 0.62)} ${-rod.len} L ${r2(hr * 0.62)} ${rod.len}`} stroke={rod.color} strokeWidth={hr * 0.62} strokeLinecap="round" /></g>}
      {h && <g transform={ht}>{h.parts.map((d, i) => <path key={i} d={d} fill={fill} {...FAT} />)}</g>}
      <path d={tb.fill} fill={fill} />
      <path d={tb.sideA} {...OUTLINE} />
      <path d={tb.sideB} {...OUTLINE} />
      {!h && <path d={tb.end} {...OUTLINE} />}
      {h && <g transform={ht}>{h.parts.map((d, i) => <path key={i} d={d} fill={fill} />)}{h.lines.map((d, i) => <path key={'l' + i} d={d} {...INLINE} />)}</g>}
    </g>
  );
};
const TinyLegV9: React.FC<TinyLegProps> = ({from, to, fill, w = 5.5, foot = 1}) => {
  const W = w * 1.55;
  const tb = tubeD(from, [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], to, W, 8);
  const fw = W * 0.9;
  const footD = `M ${r2(to[0] - foot * fw * 0.6)} ${r2(to[1] - fw * 0.5)} Q ${r2(to[0] - foot * fw * 0.95)} ${r2(to[1] + fw * 0.9)} ${r2(to[0])} ${r2(to[1] + fw * 0.9)} L ${r2(to[0] + foot * fw * 1.7)} ${r2(to[1] + fw * 0.9)} Q ${r2(to[0] + foot * fw * 2.2)} ${r2(to[1] + fw * 0.1)} ${r2(to[0] + foot * fw * 0.9)} ${r2(to[1] - fw * 0.45)} Z`;
  return (
    <g>
      <path d={footD} fill={fill} {...FAT} />
      <path d={tb.fill} fill={fill} />
      <path d={tb.sideA} {...OUTLINE} />
      <path d={tb.sideB} {...OUTLINE} />
      <path d={footD} fill={fill} />
    </g>
  );
};
/**
 * The arm of a body character (v8: a thin tube with a mitten; v9: an outlined shape with the body's own line).
 * Draw an arm BEFORE the body when it goes behind it, AFTER when it is in front.
 */
export const TinyArm: React.FC<TinyArmProps> = (p) => (useV9() ? <TinyArmV9 {...p} /> : <TinyArmV8 {...p} />);
/** The leg of a body character (v8 tube; v9 outlined shape). */
export const TinyLeg: React.FC<TinyLegProps> = (p) => (useV9() ? <TinyLegV9 {...p} /> : <TinyLegV8 {...p} />);

// ------------------------------------------------------------------ tissue pieces (stage units = frame pixels)
/** The ONE shine allowed on an organ: a short pale line (at most 0.25 of the shape's width, 70%). Replaces gloss streaks. */
export const Highlight: React.FC<{x: number; y: number; w: number; rot?: number; bend?: number}> = ({x, y, w, rot = -18, bend = 0.18}) => (
  <path transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`} d={`M ${r2(-w / 2)} 0 Q 0 ${r2(-w * bend)} ${r2(w / 2)} 0`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={IN * 1.6} strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
);
/** A flat contact shadow under a character standing on a floor (ink at 25%, no blur; decision 8). */
export const ContactShadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.11} fill={INK} opacity={0.25} />;

/**
 * The wall of a hollow organ or tube (A1 #4): the outline, a darker rim band inside it (default 20 px), a pale lining
 * line at the band's inner edge. Children are drawn inside, under the band.
 */
export const Wall: React.FC<{d: string; fill: string; rim?: number; lining?: boolean; rimColor?: string; children?: React.ReactNode}> = ({d, fill, rim = 20, lining = true, rimColor, children}) => {
  const id = 'w' + useId().replace(/:/g, '');
  const rimC = rimColor ?? shade(fill, 0.28);
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${id})`}>
        {children}
        {lining && <path d={d} fill="none" stroke={tint(fill, 0.45)} strokeWidth={rim * 2 + 7} />}
        <path d={d} fill="none" stroke={rimC} strokeWidth={rim * 2} />
      </g>
      <path d={d} {...OUTLINE} />
    </g>
  );
};
export type Box = {x0: number; y0: number; x1: number; y1: number};
/**
 * Fold lines and short wrinkle ticks on a big surface (A1 #4): about one fold per 150 x 150 px, none within 60 px of
 * an `avoid` box (faces). Seeded, so a held shot never boils. `clip` keeps them inside a shape.
 */
export const Folds: React.FC<{box: Box; seed?: number; density?: number; avoid?: Box[]; clip?: string; color?: string; len?: [number, number]; angle?: number; opacity?: number}> = ({box, seed = 1, density = 1, avoid = [], clip, color = INK, len = [60, 130], angle = 0, opacity = 1}) => {
  const id = 'f' + useId().replace(/:/g, '');
  const rnd = seeded(seed);
  const n = Math.max(1, Math.round(((box.x1 - box.x0) * (box.y1 - box.y0)) / (150 * 150) * density));
  const out: string[] = [];
  let made = 0;
  for (let i = 0; i < n * 4 && made < n; i++) {
    const x = box.x0 + rnd() * (box.x1 - box.x0), y = box.y0 + rnd() * (box.y1 - box.y0);
    const a = ((angle + (rnd() - 0.5) * 50) * Math.PI) / 180;
    const l = len[0] + rnd() * (len[1] - len[0]);
    const bow = (rnd() - 0.5) * 0.7;
    const tick = rnd();
    if (avoid.some((b) => x > b.x0 - 60 - l / 2 && x < b.x1 + 60 + l / 2 && y > b.y0 - 60 && y < b.y1 + 60)) continue;
    const dx = (Math.cos(a) * l) / 2, dy = (Math.sin(a) * l) / 2;
    out.push(`M ${r2(x - dx)} ${r2(y - dy)} Q ${r2(x - dy * bow)} ${r2(y + dx * bow)} ${r2(x + dx)} ${r2(y + dy)}`);
    if (tick < 0.5) { const tx = x + dx * 0.5, ty = y + dy * 0.5 + 18; out.push(`M ${r2(tx)} ${r2(ty)} q ${r2(10)} ${r2(4)} ${r2(22)} ${r2(-1)}`); }
    made++;
  }
  return (
    <g opacity={opacity}>
      {clip && <defs><clipPath id={id}><path d={clip} /></clipPath></defs>}
      <g clipPath={clip ? `url(#${id})` : undefined}>{out.map((d, i) => <path key={i} d={d} stroke={color} strokeWidth={IN} strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />)}</g>
    </g>
  );
};
/** A scalloped strip of lobes in two tones with a short highlight on every other lobe (gut, fat, brain folds). */
export const Lobes: React.FC<{points: P2[]; w: number; tones: [string, string]; highlight?: boolean; seed?: number}> = ({points, w, tones, highlight = true, seed = 2}) => {
  const rnd = seeded(seed);
  const lobes: {c: P2; a: number; rx: number; ry: number}[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(L / (w * 0.85)));
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; lobes.push({c: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], a: ang, rx: (L / n) * 0.62, ry: w * (0.5 + rnd() * 0.08)}); }
  }
  const el = (l: typeof lobes[0]) => `M ${r2(l.c[0] - l.rx)} ${r2(l.c[1])} a ${r2(l.rx)} ${r2(l.ry)} 0 1 0 ${r2(l.rx * 2)} 0 a ${r2(l.rx)} ${r2(l.ry)} 0 1 0 ${r2(-l.rx * 2)} 0 Z`;
  const rot = (l: typeof lobes[0]) => `rotate(${r2(l.a)} ${r2(l.c[0])} ${r2(l.c[1])})`;
  return (
    <g>
      {lobes.map((l, i) => <path key={'o' + i} d={el(l)} transform={rot(l)} fill={tones[0]} {...FAT} />)}
      {lobes.map((l, i) => <path key={'f' + i} d={el(l)} transform={rot(l)} fill={i % 2 ? tones[1] : tones[0]} />)}
      {lobes.map((l, i) => i > 0 && <path key={'s' + i} d={`M ${r2(l.c[0] - l.rx)} ${r2(l.c[1] - l.ry * 0.55)} Q ${r2(l.c[0] - l.rx * 1.1)} ${r2(l.c[1])} ${r2(l.c[0] - l.rx)} ${r2(l.c[1] + l.ry * 0.55)}`} transform={rot(l)} {...INLINE} />)}
      {highlight && lobes.map((l, i) => i % 2 === 0 && <g key={'h' + i} transform={rot(l)}><Highlight x={l.c[0] - l.rx * 0.15} y={l.c[1] - l.ry * 0.5} w={l.rx * 0.5} rot={0} /></g>)}
    </g>
  );
};
/** Sparse dots for bone and fat (seeded). */
export const Speckle: React.FC<{box: Box; seed?: number; n?: number; color: string; r?: [number, number]; clip?: string}> = ({box, seed = 3, n = 20, color, r = [2.5, 5], clip}) => {
  const id = 'sp' + useId().replace(/:/g, '');
  const rnd = seeded(seed);
  const dots = Array.from({length: n}, () => [box.x0 + rnd() * (box.x1 - box.x0), box.y0 + rnd() * (box.y1 - box.y0), r[0] + rnd() * (r[1] - r[0])]);
  return (
    <g>
      {clip && <defs><clipPath id={id}><path d={clip} /></clipPath></defs>}
      <g clipPath={clip ? `url(#${id})` : undefined}>{dots.map(([x, y, rr], i) => <circle key={i} cx={r2(x)} cy={r2(y)} r={r2(rr)} fill={color} />)}</g>
    </g>
  );
};
/**
 * See-through liquid in a container (decision 8 a): one flat colour at 55-65% opacity with a wavy surface and a few
 * white wave lines. `level` 0..1 of the box height, `t` seconds (the surface moves slowly).
 */
export const Liquid: React.FC<{clip: string; box: Box; level: number; color: string; t?: number; opacity?: number; seed?: number}> = ({clip, box, level, color, t = 0, opacity = 0.6, seed = 4}) => {
  const id = 'lq' + useId().replace(/:/g, '');
  if (level <= 0.001) return null;
  const ys = box.y1 - clamp(level, 0, 1) * (box.y1 - box.y0);
  const W = box.x1 - box.x0, n = 10;
  const wave: P2[] = Array.from({length: n + 1}, (_, i) => [box.x0 - 20 + ((W + 40) * i) / n, ys + Math.sin(i * 1.3 + t * 1.6) * 6]);
  const surf = openD(wave);
  const rnd = seeded(seed);
  const lines = Array.from({length: 5}, () => [box.x0 + 40 + rnd() * (W - 120), ys + 34 + rnd() * Math.max(10, box.y1 - ys - 70), 30 + rnd() * 40]);
  return (
    <g>
      <defs><clipPath id={id}><path d={clip} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <path d={`${surf} L ${box.x1 + 20} ${box.y1 + 60} L ${box.x0 - 20} ${box.y1 + 60} Z`} fill={color} opacity={opacity} />
        <path d={surf} stroke={shade(color, 0.25)} strokeWidth={IN} fill="none" vectorEffect="non-scaling-stroke" />
        {lines.filter(([, y]) => y < box.y1 - 10).map(([x, y, l], i) => <path key={i} d={`M ${r2(x + Math.sin(t * 0.8 + i) * 6)} ${r2(y)} q ${r2(l / 4)} -7 ${r2(l / 2)} 0 t ${r2(l / 2)} 0`} stroke="#ffffff" strokeOpacity={0.8} strokeWidth={IN} strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />)}
      </g>
    </g>
  );
};
/**
 * A window cut into an organ wall that shows its inside, the wall's thickness visible as a pale cut lip (A1 #3).
 * `inside` the colour of the hollow; children are the contents (drawn inside, under the lip).
 */
export const Cutaway: React.FC<{d: string; fill: string; inside?: string; wall?: number; children?: React.ReactNode}> = ({d, fill, inside = FLESH.maroon, wall = 20, children}) => {
  const id = 'cw' + useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <path d={d} fill={inside} />
        {children}
        <path d={d} fill="none" stroke={tint(fill, 0.4)} strokeWidth={wall * 2} />
        <path d={d} fill="none" stroke={shade(fill, 0.18)} strokeWidth={wall * 0.6} />
      </g>
      <path d={d} {...OUTLINE} />
    </g>
  );
};
/** Body damage marks, drawn in the kit line, no blood (A1 #3): a sore, a swelling (the ONE soft redness), a wound, a dark patch. */
export const Sore: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <ellipse cx={x} cy={y} rx={r * 1.35} ry={r * 1.15} fill="#e86b6f" opacity={0.55} />
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.82} fill="#f8e7c8" {...EDGE_IN} />
  </g>
);
export const Swelling: React.FC<{x: number; y: number; r: number; k?: number}> = ({x, y, r, k = 1}) => {
  const id = 'sw' + useId().replace(/:/g, '');
  return (
    <g opacity={clamp(k, 0, 1)}>
      <defs><radialGradient id={id}><stop offset="0%" stopColor="#e0464f" stopOpacity={0.55} /><stop offset="100%" stopColor="#e0464f" stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.8} fill={`url(#${id})`} />
    </g>
  );
};
export const Wound: React.FC<{x: number; y: number; len: number; rot?: number; open?: number}> = ({x, y, len, rot = -12, open = 1}) => {
  const h = len * 0.16 * clamp(open, 0.15, 1);
  const d = `M ${-len / 2} 0 Q 0 ${-h * 2} ${len / 2} 0 Q 0 ${h * 2} ${-len / 2} 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={len * 0.62} ry={len * 0.3} fill="#e86b6f" opacity={0.45} />
      <path d={d} fill={FLESH.deep} {...EDGE_IN} />
      <path d={`M ${-len * 0.3} ${h * 0.4} Q 0 ${h * 1.1} ${len * 0.3} ${h * 0.4}`} stroke={FLESH.artery} strokeWidth={IN} fill="none" vectorEffect="non-scaling-stroke" />
    </g>
  );
};
/** A dark damage patch (tar, dead tissue): an irregular blob, flat, with a few darker specks. `k` 0..1 fades it. */
export const Patch: React.FC<{x: number; y: number; r: number; seed?: number; color?: string; k?: number; line?: boolean}> = ({x, y, r, seed = 5, color = '#4a332e', k = 1, line = false}) => {
  if (k <= 0.01) return null;
  const rnd = seeded(seed);
  const n = 9;
  const pts: P2[] = Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2; const rr = r * (0.72 + rnd() * 0.45); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85]; });
  const specks = Array.from({length: 5}, () => [x + (rnd() - 0.5) * r, y + (rnd() - 0.5) * r * 0.8, r * (0.05 + rnd() * 0.05)]);
  const d = smoothD(pts);
  return (
    <g opacity={clamp(k, 0, 1)}>
      <path d={d} fill={color} opacity={0.88} />
      {line && <path d={d} {...INLINE} />}
      {specks.map(([sx, sy, sr], i) => <circle key={i} cx={r2(sx)} cy={r2(sy)} r={r2(sr)} fill={shade(color, 0.35)} />)}
    </g>
  );
};

// ------------------------------------------------------------------ labels
/**
 * A paper band wrapped round a body with its name on the curve (decision 13: a character that wears its name gets no
 * extra tag). (x, y) the band's middle, w its width, `curve` how much it bows (the body's roundness), `rot` its tilt.
 */
export const BandLabel: React.FC<{x: number; y: number; w: number; text: string; size?: number; curve?: number; rot?: number; paper?: string}> = ({x, y, w, text, size, curve = 0.14, rot = 0, paper = '#fbf4e4'}) => {
  const id = 'bl' + useId().replace(/:/g, '');
  const fs = size ?? Math.min(w * 0.17, (w * 1.4) / Math.max(4, text.length));
  const h = fs * 1.55, b = w * curve;
  const band = `M ${r2(-w / 2)} ${r2(-h / 2)} Q 0 ${r2(-h / 2 + b)} ${r2(w / 2)} ${r2(-h / 2)} L ${r2(w / 2)} ${r2(h / 2)} Q 0 ${r2(h / 2 + b)} ${r2(-w / 2)} ${r2(h / 2)} Z`;
  const mid = `M ${r2(-w / 2 + fs * 0.3)} ${r2(fs * 0.36)} Q 0 ${r2(fs * 0.36 + b)} ${r2(w / 2 - fs * 0.3)} ${r2(fs * 0.36)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={band} fill={paper} {...EDGE_IN} />
      <defs><path id={id} d={mid} /></defs>
      <text fontFamily={FONT} fontWeight={900} fontSize={r2(fs)} fill={INK} letterSpacing={r2(fs * 0.04)}><textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{text.toUpperCase()}</textPath></text>
    </g>
  );
};
