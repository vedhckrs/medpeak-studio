/**
 * MedPeak Toons, look v8: the PROPS. Thirty everyday objects drawn in code with the shared kit
 * (src/toons/v8/kit.tsx): one ink outline, flat colour, one darker tone, a few inner lines, no faces.
 * Each prop draws itself in the 200-unit figure space centred on (0, 0), inside about -90..90,
 * so it can stand in a <Fig> anywhere. Two approval boards: PropsClinic and PropsHome.
 *
 * Pieces built here (not in the kit): Body (a Shape whose inner colour bands also get the darker
 * crescent), Tube (a stroked tube with the ink edge, for tubing, stems and smoke), and the small
 * path helpers rr / ell / poly / oct.
 */
import React, {useId} from 'react';
import {Board, Caption, CLOTH, EDGE, EDGE_IN, Eyes, Fig, FONT, INK, INLINE, Mouth, OUTLINE, Panel, Shape, shade, tint, type V8Props} from './kit';

// ------------------------------------------------------------------ path helpers
const rr = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2);
  return `M ${x + k} ${y} H ${x + w - k} A ${k} ${k} 0 0 1 ${x + w} ${y + k} V ${y + h - k} A ${k} ${k} 0 0 1 ${x + w - k} ${y + h} H ${x + k} A ${k} ${k} 0 0 1 ${x} ${y + h - k} V ${y + k} A ${k} ${k} 0 0 1 ${x + k} ${y} Z`;
};
const ell = (cx: number, cy: number, rx: number, ry: number) => `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
const poly = (p: number[]) => {
  let s = `M ${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 2) s += ` L ${p[i]} ${p[i + 1]}`;
  return s + ' Z';
};
const oct = (cx: number, cy: number, r: number) => {
  const p: number[] = [];
  for (let i = 0; i < 8; i++) { const a = ((22.5 + 45 * i) * Math.PI) / 180; p.push(+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)); }
  return poly(p);
};
/** An inner line. */
const L: React.FC<{d: string}> = ({d}) => <path d={d} {...INLINE} />;
/** An outline-weight open line (a needle, a clock hand). */
const O: React.FC<{d: string}> = ({d}) => <path d={d} {...OUTLINE} />;

/** Samples a centre line written with absolute M / L / H / V / Q / C commands into points. */
const sampleLine = (d: string): [number, number][] => {
  const tok = d.match(/[MLHVQC]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const pts: [number, number][] = [];
  let i = 0, cmd = 'M', x = 0, y = 0;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[A-Z]/i.test(tok[i])) cmd = tok[i++].toUpperCase();
    if (cmd === 'M' || cmd === 'L') { x = num(); y = num(); pts.push([x, y]); }
    else if (cmd === 'H') { x = num(); pts.push([x, y]); }
    else if (cmd === 'V') { y = num(); pts.push([x, y]); }
    else if (cmd === 'Q') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num();
      for (let k = 1; k <= 16; k++) { const t = k / 16, u = 1 - t; pts.push([u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2]); }
      x = x2; y = y2;
    } else if (cmd === 'C') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
      for (let k = 1; k <= 24; k++) { const t = k / 24, u = 1 - t; pts.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); }
      x = x3; y = y3;
    } else i++;
  }
  return pts.filter((p, k) => k === 0 || Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]) > 0.01);
};
/** The closed outline of a tube of width w around a centre line, with round ends. */
const tubePath = (d: string, w: number) => {
  const p = sampleLine(d);
  const r = w / 2;
  const nrm = p.map((_, k) => {
    const a = p[Math.max(0, k - 1)], b = p[Math.min(p.length - 1, k + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
  const f = (v: number) => v.toFixed(2);
  const left = p.map((q, k) => `${f(q[0] + nrm[k][0] * r)} ${f(q[1] + nrm[k][1] * r)}`);
  const right = p.map((q, k) => `${f(q[0] - nrm[k][0] * r)} ${f(q[1] - nrm[k][1] * r)}`).reverse();
  return `M ${left[0]} L ${left.slice(1).join(' L ')} A ${r} ${r} 0 0 0 ${right[0]} L ${right.slice(1).join(' L ')} A ${r} ${r} 0 0 0 ${left[0]} Z`;
};
/**
 * A tube (tubing, a stem, smoke): a closed filled shape built around the centre line, carrying the
 * kit outline (non-scaling, like every other shape) and the usual small darker crescent.
 */
const Tube: React.FC<{d: string; w: number; fill: string; shadow?: number}> = ({d, w, fill, shadow = 0.35}) => (
  <Shape d={tubePath(d, w + 2)} fill={fill} shadow={shadow} />
);

/**
 * Like the kit's Shape, but with colour bands (a label, a liquid, a cap) inside the shape, and the
 * darker crescent on the lower right drawn over every band in that band's own darker tone.
 */
const Body: React.FC<{d: string; fill: string; bands?: {d: string; fill: string}[]; shadow?: number; children?: React.ReactNode}> = ({d, fill, bands = [], shadow = 1, children}) => {
  const id = 'b' + useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-400} y={-400} width={800} height={800}>
          <path d={d} fill="#ffffff" />
          <path d={d} fill="#000000" transform={`translate(${-5 * shadow} ${-6 * shadow})`} />
        </mask>
      </defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${id}c)`}>{bands.map((b, i) => <path key={i} d={b.d} fill={b.fill} />)}</g>
      {shadow > 0 && (
        <g mask={`url(#${id}m)`}>
          <path d={d} fill={shade(fill)} />
          <g clipPath={`url(#${id}c)`}>{bands.map((b, i) => <path key={i} d={b.d} fill={shade(b.fill)} />)}</g>
        </g>
      )}
      {children && <g clipPath={`url(#${id}c)`}>{children}</g>}
      <path d={d} {...OUTLINE} />
    </g>
  );
};

const GLASS = tint(CLOTH.sky, 0.62); // clear glass or plastic
const WATER = tint(CLOTH.sky, 0.22); // a liquid in glass
const METAL = CLOTH.grey;

// =================================================================== SHEET 1: clinic and care

export const Clipboard: React.FC = () => (
  <g transform="rotate(-5)">
    <Shape d={rr(-58, -74, 116, 160, 8)} fill={CLOTH.brown} />
    <Shape d={rr(-46, -58, 92, 130, 3)} fill={CLOTH.white} shadow={0.6}>
      {[-36, -12, 12, 36].map((y, i) => (
        <g key={y}>
          <rect x={-34} y={y - 6} width={11} height={11} rx={2} fill="none" {...EDGE_IN} />
          <L d={`M -16 ${y} H ${i % 2 ? 22 : 32}`} />
          {i < 2 && <L d={`M -32 ${y - 1} L -29 ${y + 3} L -22 ${y - 7}`} />}
        </g>
      ))}
    </Shape>
    <Shape d={rr(-26, -86, 52, 22, 6)} fill={METAL} shadow={0.6}>
      <path d={rr(-10, -82, 20, 7, 3.5)} fill={shade(METAL, 0.3)} {...EDGE_IN} />
    </Shape>
    {/* the pen lying across the sheet */}
    <g transform="translate(22 50) rotate(-38)">
      <Shape d={rr(-48, -6.5, 10, 13, 4)} fill={CLOTH.navy} shadow={0.4} />
      <Shape d={rr(-42, -6.5, 74, 13, 4)} fill={CLOTH.blue} shadow={0.5} />
      <Shape d="M 32 -6.5 L 46 -2 Q 49 0 46 2 L 32 6.5 Z" fill={CLOTH.offwhite} shadow={0.4} />
      <Shape d={rr(-38, -11, 30, 5, 2.5)} fill={METAL} shadow={0} line="in" />
    </g>
  </g>
);

export const Stethoscope: React.FC = () => (
  <g transform="translate(0 2)">
    {/* tubing from the Y joint down, round and up into the chest piece */}
    <Tube d="M 0 -18 C 0 22 -14 38 -40 48 C -68 60 -60 88 -30 84 C 0 80 16 70 30 54" w={9} fill={CLOTH.teal} />
    {/* chest piece */}
    <Tube d="M 28 56 L 38 46" w={6} fill={METAL} />
    <Shape d={ell(50, 36, 24, 20)} fill={METAL}>
      <path d={ell(52, 34, 15, 12)} fill={tint(METAL, 0.45)} {...EDGE_IN} />
    </Shape>
    {/* metal ear tubes */}
    <Tube d="M -30 -78 C -42 -48 -26 -24 -3 -18" w={5} fill={METAL} />
    <Tube d="M 30 -78 C 42 -48 26 -24 3 -18" w={5} fill={METAL} />
    <Shape d={rr(-7, -24, 14, 16, 4)} fill={METAL} shadow={0.5} />
    <g transform="translate(-27 -82) rotate(-30)"><Shape d={ell(0, 0, 9, 6)} fill={CLOTH.charcoal} shadow={0.5} /></g>
    <g transform="translate(27 -82) rotate(30)"><Shape d={ell(0, 0, 9, 6)} fill={CLOTH.charcoal} shadow={0.5} /></g>
  </g>
);

export const Syringe: React.FC = () => (
  <g transform="rotate(-32) scale(1.12)">
    {/* plunger rod and thumb rest */}
    <Shape d={rr(-86, -5, 44, 10, 2)} fill={CLOTH.offwhite} shadow={0.4} />
    <Shape d={rr(-94, -17, 9, 34, 3)} fill={CLOTH.offwhite} shadow={0.6} />
    {/* the clear barrel with the stopper and the dose inside */}
    <Body d={rr(-46, -15, 92, 30, 4)} fill={GLASS} bands={[
      {d: rr(-60, -4, 44, 8, 0), fill: CLOTH.offwhite},
      {d: rr(-18, -20, 8, 40, 0), fill: CLOTH.charcoal},
      {d: rr(-10, -20, 70, 40, 0), fill: WATER},
    ]}>
      {[-34, -24, -14, -4, 6, 16, 26, 36].map((x, i) => <L key={x} d={`M ${x} -15 V ${i % 2 ? -10 : -6}`} />)}
    </Body>
    <Shape d={rr(-51, -27, 7, 54, 3)} fill={CLOTH.offwhite} shadow={0.5} />
    {/* hub and needle */}
    <Shape d={rr(45, -7, 11, 14, 2)} fill={CLOTH.offwhite} shadow={0.5} />
    <Shape d="M 56 -4 L 63 -2 L 63 2 L 56 4 Z" fill={METAL} shadow={0} />
    <O d="M 63 0 L 94 0" />
  </g>
);

export const VaccineVial: React.FC = () => (
  <g transform="translate(0 4)">
    <Body d="M -20 -52 L 20 -52 L 20 -44 Q 20 -38 34 -34 Q 40 -32 40 -24 L 40 72 Q 40 80 32 80 L -32 80 Q -40 80 -40 72 L -40 -24 Q -40 -32 -34 -34 Q -20 -38 -20 -44 Z" fill={GLASS} bands={[
      {d: rr(-50, -8, 100, 100, 0), fill: WATER},
      {d: rr(-50, 10, 100, 46, 0), fill: CLOTH.white},
      {d: rr(-50, 10, 100, 9, 0), fill: CLOTH.blue},
    ]}>
      <L d="M -40 -8 H 40" />
      <L d="M -40 10 H 40" />
      <L d="M -40 19 H 40" />
      <L d="M -40 56 H 40" />
      <L d="M -26 32 H 20" />
      <L d="M -26 43 H 8" />
    </Body>
    <Shape d={rr(-28, -68, 56, 20, 4)} fill={METAL}>
      <L d="M -28 -58 H 28" />
    </Shape>
    <Shape d={rr(-24, -82, 48, 15, 5)} fill={CLOTH.blue} />
  </g>
);

export const Thermometer: React.FC = () => (
  <g transform="rotate(-35) scale(1.12)">
    <Shape d={rr(52, -5, 38, 10, 5)} fill={METAL} shadow={0.5} />
    <Body d="M -82 -15 Q -94 0 -82 15 L 56 9 Q 61 0 56 -9 Z" fill={CLOTH.white} bands={[{d: rr(-100, -20, 30, 40, 0), fill: CLOTH.teal}]}>
      <L d="M -70 -14 V 14" />
      <path d={rr(-56, -9, 44, 18, 3)} fill={tint(CLOTH.green, 0.6)} {...EDGE_IN} />
      <text x={-34} y={4.5} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={12} fill={INK}>36.8</text>
      <circle cx={6} cy={0} r={5} fill={CLOTH.blue} {...EDGE_IN} />
    </Body>
  </g>
);

export const PillBottle: React.FC = () => (
  <g transform="translate(0 4)">
    <Body d={rr(-44, -46, 88, 128, 10)} fill={CLOTH.orange} bands={[{d: rr(-60, -14, 120, 62, 0), fill: CLOTH.white}]}>
      <L d="M -44 -14 H 44" />
      <L d="M -44 48 H 44" />
    </Body>
    <Shape d={rr(-50, -84, 100, 40, 7)} fill={CLOTH.offwhite}>
      {[-36, -24, -12, 0, 12, 24, 36].map((x) => <L key={x} d={`M ${x} -70 V -50`} />)}
    </Shape>
  </g>
);

export const BlisterStrip: React.FC = () => {
  const foil = tint(METAL, 0.45);
  return (
    <g transform="rotate(-12)">
      <Shape d={rr(-84, -48, 168, 96, 9)} fill={foil}>
        <path d="M 0 -48 V 48" {...INLINE} strokeDasharray="5 6" />
      </Shape>
      {[-58, -21, 21, 58].flatMap((x) => [-20, 20].map((y) => {
        if (x === 58 && y === 20) {
          return (
            <g key={`${x}${y}`}>
              <Shape d={ell(x, y, 15, 15)} fill={shade(foil, 0.22)} shadow={0} line="in" />
              <L d={`M ${x - 11} ${y - 2} L ${x - 6} ${y + 3} L ${x - 1} ${y - 3} L ${x + 4} ${y + 3} L ${x + 10} ${y - 2}`} />
            </g>
          );
        }
        return (
          <Shape key={`${x}${y}`} d={ell(x, y, 15, 15)} fill={CLOTH.white} shadow={0.7}>
            <L d={`M ${x - 8} ${y} H ${x + 8}`} />
          </Shape>
        );
      }))}
    </g>
  );
};

export const BandageRoll: React.FC = () => {
  const gauze = CLOTH.offwhite;
  return (
    <g transform="translate(-10 10) scale(1.14)">
      {/* the loose end, unrolled flat on the table */}
      <Shape d="M -20 34 L 68 34 L 78 25 L 88 14 L 0 14 Z" fill={gauze} shadow={0.5}>
        {/* the open gauze weave: one thread along, a few across */}
        <L d="M -10 24 H 84" />
        {[12, 30, 64].map((x) => <L key={x} d={`M ${x} 34 L ${x + 18} 14`} />)}
      </Shape>
      {/* the small metal clip that holds the end */}
      <Shape d={poly([42, 10, 56, 10, 58, 38, 40, 38])} fill={METAL} shadow={0.4}>
        <L d="M 43 18 H 56" />
        <L d="M 42 30 H 57" />
      </Shape>
      {/* the roll lying on its side, its end towards us */}
      <Shape d="M -40.6 -44.3 L -20.6 -56.3 A 40 40 0 0 1 20.6 12.3 L 0.6 24.3 Z" fill={gauze} />
      <Shape d={ell(-20, -10, 40, 40)} fill={CLOTH.white} shadow={0.6}>
        <path d={ell(-20, -10, 29, 29)} {...INLINE} />
        <path d={ell(-20, -10, 19, 19)} {...INLINE} />
      </Shape>
      <Shape d={ell(-20, -10, 9, 9)} fill={shade(gauze, 0.3)} shadow={0} line="in" />
    </g>
  );
};

export const Plaster: React.FC = () => (
  <g transform="rotate(-28)">
    <Shape d={rr(-86, -27, 172, 54, 27)} fill={CLOTH.tan}>
      {[-70, -58, -46, 46, 58, 70].flatMap((x) => [-10, 0, 10].map((y) => (Math.abs(x) === 70 && y !== 0 ? null : <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} fill={INK} />)))}
    </Shape>
    <Shape d={rr(-30, -20, 60, 40, 6)} fill={tint(CLOTH.tan, 0.5)} line="in" shadow={0.6} />
  </g>
);

export const Soap: React.FC = () => (
  <g transform="translate(0 6)">
    <Shape d={rr(-76, -6, 152, 72, 28)} fill={CLOTH.pink} />
    <Shape d={rr(-67, -12, 134, 52, 24)} fill={tint(CLOTH.pink, 0.4)} shadow={0} line="in">
      <path d={ell(0, 14, 32, 11)} {...INLINE} />
    </Shape>
    <Shape d={ell(30, -46, 22, 22)} fill={GLASS} shadow={0.5}>
      <L d="M 38 -34 Q 44 -38 46 -46" />
    </Shape>
    <Shape d={ell(62, -76, 12, 12)} fill={GLASS} shadow={0.4} />
  </g>
);

export const Toothbrush: React.FC = () => (
  <g transform="translate(-2 6) rotate(-35) scale(1.1)">
    {/* bristle tufts */}
    <Body d="M 38 -6 L 38 -25 Q 43 -31 48 -25 Q 53 -31 58 -25 Q 63 -31 68 -25 Q 73 -31 78 -25 Q 83 -31 88 -25 L 88 -6 Z" fill={CLOTH.white} bands={[{d: rr(48, -40, 20, 40, 0), fill: tint(CLOTH.sky, 0.3)}]} shadow={0.6}>
      <L d="M 48 -25 V -6" />
      <L d="M 58 -25 V -6" />
      <L d="M 68 -25 V -6" />
      <L d="M 78 -25 V -6" />
    </Body>
    <Shape d="M -92 -7 Q -98 0 -92 8 Q -60 12 -24 7 Q 8 4 32 5 L 92 5 Q 96 0 92 -6 L 32 -5 Q 8 -5 -24 -7 Q -60 -13 -92 -7 Z" fill={CLOTH.teal} shadow={0.7}>
      <path d={rr(-74, -4, 36, 8, 4)} fill={tint(CLOTH.teal, 0.45)} {...EDGE_IN} />
    </Shape>
  </g>
);

export const Toothpaste: React.FC = () => (
  <g transform="translate(-4 4) rotate(-18)">
    <Body d="M -84 -22 L -70 -24 Q -10 -34 44 -28 Q 58 -26 60 -14 L 60 14 Q 58 26 44 28 Q -10 34 -70 24 L -84 22 L -88 16 L -84 11 L -88 5 L -84 0 L -88 -5 L -84 -11 L -88 -16 Z" fill={CLOTH.white} bands={[
      {d: rr(-100, -40, 30, 80, 0), fill: tint(METAL, 0.3)},
      {d: rr(14, -40, 60, 80, 0), fill: CLOTH.blue},
    ]}>
      <L d="M -70 -24 V 24" />
      <L d="M 14 -31 V 31" />
      <L d="M -50 -8 H -2" />
      <L d="M -50 6 H -16" />
    </Body>
    <Shape d={rr(58, -9, 10, 18, 2)} fill={CLOTH.white} shadow={0.4} />
    <Shape d={rr(66, -15, 24, 30, 4)} fill={CLOTH.blue}>
      <L d="M 72 -15 V 15" />
      <L d="M 78 -15 V 15" />
      <L d="M 84 -15 V 15" />
    </Shape>
  </g>
);

export const NailClipper: React.FC = () => (
  <g transform="translate(0 16) rotate(-6)">
    {/* the two jaws, joined at the back, cutting edge at the front */}
    <Shape d="M -82 2 Q -92 12 -82 22 L 54 32 Q 82 34 90 18 Q 92 4 80 -2 L 54 -6 Z" fill={METAL}>
      <L d="M -76 12 Q 0 14 76 14" />
      <L d="M 91 12 L 78 14" />
      <circle cx={-74} cy={12} r={4.5} fill={CLOTH.white} {...EDGE_IN} />
    </Shape>
    <Shape d={rr(48, -24, 9, 44, 3)} fill={tint(METAL, 0.35)} shadow={0.5} />
    {/* the arched lever on the pin */}
    <Shape d="M 68 -18 Q 70 -32 54 -30 Q 0 -62 -70 -52 Q -88 -48 -86 -38 Q -84 -30 -70 -33 Q 0 -44 46 -15 Q 62 -8 68 -18 Z" fill={METAL}>
      <L d="M -70 -50 L -70 -35" />
      <L d="M -60 -52 L -60 -36" />
      <L d="M -50 -53 L -50 -37" />
    </Shape>
    <Shape d={ell(56, -22, 8, 4.5)} fill={tint(METAL, 0.35)} shadow={0} line="in" />
  </g>
);

export const Tweezers: React.FC = () => (
  <g transform="rotate(22) scale(1.06)">
    <Shape d="M -3 -86 L -2 -60 Q -4 10 -12 84 Q -16 92 -23 87 Q -28 20 -15 -84 Z" fill={METAL} />
    <Shape d="M 3 -86 L 2 -60 Q 4 10 12 84 Q 16 92 23 87 Q 28 20 15 -84 Z" fill={METAL} />
    <Shape d={rr(-16, -96, 32, 18, 8)} fill={METAL} />
    {/* coloured grip pads */}
    <Shape d="M -20 -22 L -7 -22 L -9 24 L -22 24 Z" fill={CLOTH.teal} shadow={0.4} line="in" />
    <Shape d="M 20 -22 L 7 -22 L 9 24 L 22 24 Z" fill={CLOTH.teal} shadow={0.4} line="in" />
  </g>
);

export const StopSign: React.FC = () => (
  <g>
    <Shape d={rr(-6, 28, 12, 50, 3)} fill={METAL} shadow={0.5} />
    <Shape d={rr(-10, 56, 20, 34, 7)} fill={CLOTH.charcoal} shadow={0.5}>
      <L d="M -10 66 H 10" />
      <L d="M -10 74 H 10" />
    </Shape>
    <Shape d={oct(0, -26, 64)} fill={CLOTH.white} />
    <Shape d={oct(0, -26, 54)} fill={CLOTH.red} line="in" shadow={0.8} />
    <text x={0} y={-15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} letterSpacing={0.5} fill={CLOTH.white}>STOP</text>
  </g>
);

// =================================================================== SHEET 2: home and habits

export const GlassOfWater: React.FC = () => (
  <g transform="translate(0 4)">
    <Body d="M -50 -74 L -38 74 Q -37 82 -30 82 L 30 82 Q 37 82 38 74 L 50 -74 Z" fill={GLASS} bands={[{d: rr(-70, -26, 140, 120, 0), fill: WATER}]}>
      <path d={ell(0, -26, 47, 7)} fill={tint(CLOTH.sky, 0.45)} {...EDGE_IN} />
      <L d="M -36 64 Q 0 70 36 64" />
    </Body>
    <Shape d={ell(0, -74, 50, 9)} fill={tint(CLOTH.sky, 0.8)} shadow={0} />
  </g>
);

export const SodaCan: React.FC = () => (
  <g transform="translate(0 4)">
    <Body d="M -34 -72 L 34 -72 L 42 -58 L 42 66 Q 42 74 34 78 L -34 78 Q -42 74 -42 66 L -42 -58 Z" fill={CLOTH.red} bands={[
      {d: 'M -60 22 Q 0 4 60 30 L 60 42 Q 0 18 -60 34 Z', fill: CLOTH.white},
      {d: rr(-60, -90, 120, 32, 0), fill: METAL},
      {d: rr(-60, 66, 120, 30, 0), fill: METAL},
    ]}>
      <L d="M -42 -58 H 42" />
      <L d="M -42 66 H 42" />
      <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} letterSpacing={1} fill={CLOTH.white}>SODA</text>
    </Body>
    <Shape d={ell(0, -72, 34, 8)} fill={tint(METAL, 0.4)} shadow={0} />
    <Shape d={rr(-7, -76, 18, 7, 3.5)} fill={METAL} shadow={0} line="in" />
  </g>
);

export const Burger: React.FC = () => {
  const bun = tint(CLOTH.orange, 0.3);
  return (
    <g transform="translate(0 4)">
      <Shape d="M -74 36 Q -76 62 -50 64 L 50 64 Q 76 62 74 36 Z" fill={bun} />
      <Shape d={rr(-80, 12, 160, 28, 13)} fill={CLOTH.brown}>
        <L d="M -56 28 q 7 -4 14 0" />
        <L d="M -12 30 q 7 -4 14 0" />
        <L d="M 34 28 q 7 -4 14 0" />
      </Shape>
      <Shape d="M -78 4 L 78 4 L 78 13 L 60 13 L 52 30 L 44 13 L -16 13 L -26 32 L -36 13 L -78 13 Z" fill={CLOTH.yellow} shadow={0.5} />
      <Shape d={rr(-72, -6, 144, 12, 6)} fill={CLOTH.red} shadow={0.5} />
      <Shape d="M -84 -14 L 84 -14 L 84 -8 Q 78 4 68 -4 Q 58 6 48 -4 Q 38 6 28 -4 Q 18 6 8 -4 Q -2 6 -12 -4 Q -22 6 -32 -4 Q -42 6 -52 -4 Q -62 6 -72 -4 Q -80 4 -84 -8 Z" fill={CLOTH.green} shadow={0.5} />
      <Shape d="M -80 -10 Q -84 -18 -78 -24 C -66 -78 66 -78 78 -24 Q 84 -18 80 -10 Z" fill={bun}>
        {[[-42, -44, -20], [-12, -58, 10], [18, -52, -15], [46, -38, 25], [-24, -28, 15], [24, -28, -10]].map(([x, y, a]) => (
          <path key={`${x}${y}`} d={ell(0, 0, 4.5, 2.2)} transform={`translate(${x} ${y}) rotate(${a})`} fill={CLOTH.offwhite} {...EDGE_IN} />
        ))}
      </Shape>
    </g>
  );
};

const CandyOne: React.FC<{c: string}> = ({c}) => (
  <g>
    <Shape d="M -26 -7 L -68 -30 Q -60 0 -68 30 L -26 7 Z" fill={c} shadow={0.6}>
      <L d="M -30 -2 L -62 -16" />
      <L d="M -30 2 L -62 16" />
    </Shape>
    <Shape d="M 26 -7 L 68 -30 Q 60 0 68 30 L 26 7 Z" fill={c} shadow={0.6}>
      <L d="M 30 -2 L 62 -16" />
      <L d="M 30 2 L 62 16" />
    </Shape>
    <Shape d={ell(0, 0, 32, 24)} fill={c}>
      <path d="M -26 -30 L -12 -30 L -30 30 L -44 30 Z" fill={tint(c, 0.45)} />
      <path d="M 2 -30 L 16 -30 L -2 30 L -16 30 Z" fill={tint(c, 0.45)} />
      <path d="M 30 -30 L 44 -30 L 26 30 L 12 30 Z" fill={tint(c, 0.45)} />
    </Shape>
  </g>
);
export const Candy: React.FC = () => (
  <g>
    <g transform="translate(-22 44) rotate(14) scale(0.72)"><CandyOne c={CLOTH.yellow} /></g>
    <g transform="translate(12 -22) rotate(-16)"><CandyOne c={CLOTH.pink} /></g>
  </g>
);

export const ChewingGum: React.FC = () => {
  const stick = (y: number, out: number) => (
    <Body d={rr(-10, y, 46 + out, 16, 2)} fill={CLOTH.offwhite} bands={[{d: rr(22 + out, y - 4, 30, 24, 0), fill: METAL}]} shadow={0.5}>
      <L d={`M ${22 + out} ${y} V ${y + 16}`} />
    </Body>
  );
  return (
    <g transform="translate(-4 4) rotate(-12) scale(1.18)">
      {stick(-26, 38)}
      {stick(-8, 16)}
      <Body d={rr(-80, -30, 116, 60, 5)} fill={CLOTH.green} bands={[{d: rr(-90, -10, 140, 20, 0), fill: CLOTH.white}]}>
        <L d="M -80 -10 H 36" />
        <L d="M -80 10 H 36" />
        <text x={-22} y={5.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={14} letterSpacing={1.5} fill={shade(CLOTH.green, 0.25)}>GUM</text>
      </Body>
    </g>
  );
};

const leaf = (x: number, y: number, a: number, s = 1) => (
  <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <Shape d="M 0 0 Q 10 -14 28 -10 Q 22 6 0 0 Z" fill={CLOTH.green} shadow={0.4}>
      <L d="M 2 -1 Q 14 -6 24 -9" />
    </Shape>
  </g>
);
export const PlateOfFood: React.FC = () => (
  <g transform="translate(-6 4)">
    <Shape d={ell(-8, 10, 80, 48)} fill={CLOTH.white} />
    <Shape d={ell(-8, 8, 60, 34)} fill={CLOTH.offwhite} shadow={0} line="in" />
    {/* rice */}
    {/* greens, behind */}
    {leaf(-6, -6, -70, 1.05)}
    {leaf(4, -8, -105, 1.0)}
    {leaf(10, -6, -40, 1.05)}
    {leaf(18, -4, -10, 0.95)}
    {/* rice */}
    <Shape d="M -62 18 Q -70 -8 -48 -16 Q -38 -32 -18 -24 Q 2 -22 0 0 Q 4 20 -14 26 Q -40 34 -62 18 Z" fill={CLOTH.white} shadow={0.6}>
      <L d="M -48 -4 l 5 -2" />
      <L d="M -32 -12 l 4 3" />
      <L d="M -24 6 l 5 -1" />
      <L d="M -48 12 l 4 3" />
      <L d="M -14 -6 l 2 4" />
    </Shape>
    {/* a piece of chicken (a drumstick) */}
    <Shape d={rr(36, 16, 24, 10, 5)} fill={CLOTH.offwhite} shadow={0} line="in" />
    <Shape d={ell(61, 15, 6.5, 6.5)} fill={CLOTH.offwhite} shadow={0} line="in" />
    <Shape d={ell(61, 27, 6.5, 6.5)} fill={CLOTH.offwhite} shadow={0} line="in" />
    {/* the drumstick: a round end tapering to the bone */}
    <Shape d="M -12 22 Q -14 -4 10 -6 Q 28 -8 40 12 Q 44 21 40 28 Q 26 44 6 42 Q -10 40 -12 22 Z" fill={shade(CLOTH.orange, 0.12)}>
      <L d="M 0 8 q 10 -4 20 1" />
      <L d="M 2 26 q 9 -3 18 0" />
    </Shape>
    {/* fork beside the plate */}
    <g transform="translate(80 2) rotate(8)">
      <Shape d={rr(-4.5, -6, 9, 76, 4.5)} fill={METAL} shadow={0.4} />
      <Shape d="M -12 -62 L -12 -26 Q -12 -10 0 -6 Q 12 -10 12 -26 L 12 -62 Z" fill={METAL} shadow={0.5}>
        <L d="M -4 -62 V -34" />
        <L d="M 4 -62 V -34" />
      </Shape>
    </g>
  </g>
);

export const Apple: React.FC = () => (
  <g transform="translate(0 8)">
    <Tube d="M 0 -42 Q 0 -60 8 -70" w={5} fill={CLOTH.brown} />
    <Shape d="M 0 -44 C 20 -64 68 -56 70 -6 C 72 40 40 76 14 70 C 6 68 -6 68 -14 70 C -40 76 -72 40 -70 -6 C -68 -56 -20 -64 0 -44 Z" fill={CLOTH.red} shadow={1.2}>
      <L d="M -12 -44 Q 0 -36 12 -44" />
    </Shape>
    <Shape d="M 6 -60 Q 24 -80 46 -70 Q 30 -50 6 -60 Z" fill={CLOTH.green} shadow={0.5}>
      <L d="M 10 -61 Q 26 -66 40 -69" />
    </Shape>
  </g>
);

export const Cigarette: React.FC = () => (
  <g>
    <g transform="translate(-8 34) rotate(-12) scale(1.1)">
      <Body d={rr(-84, -11, 162, 22, 5)} fill={CLOTH.white} bands={[
        {d: rr(-100, -20, 56, 40, 0), fill: tint(CLOTH.orange, 0.25)},
        {d: rr(52, -20, 11, 40, 0), fill: CLOTH.orange},
        {d: rr(63, -20, 30, 40, 0), fill: METAL},
      ]} shadow={0.6}>
        <L d="M -44 -11 V 11" />
        <L d="M 52 -11 V 11" />
        <L d="M 63 -11 V 11" />
        {[[-74, -4], [-66, 3], [-58, -3], [-52, 4], [-70, 5], [-62, -5]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.3} fill={INK} />)}
      </Body>
    </g>
    <Tube d="M 76 10 C 66 -8 86 -20 76 -36 C 66 -52 86 -64 76 -82" w={4} fill={tint(METAL, 0.55)} />
  </g>
);

export const VapePen: React.FC = () => (
  <g transform="rotate(32)">
    <Shape d="M -8 -88 Q -8 -92 -4 -92 L 4 -92 Q 8 -92 8 -88 L 11 -66 L -11 -66 Z" fill={CLOTH.charcoal} shadow={0.5} />
    <Body d={rr(-13, -68, 26, 48, 3)} fill={GLASS} bands={[{d: rr(-20, -46, 40, 30, 0), fill: tint(CLOTH.purple, 0.45)}]} shadow={0.6}>
      <L d="M -13 -46 H 13" />
      <L d="M -3 -68 V -20" />
      <L d="M 3 -68 V -20" />
    </Body>
    <Shape d={rr(-15, -22, 30, 8, 2)} fill={METAL} shadow={0.4} />
    <Shape d={rr(-15, -14, 30, 104, 8)} fill={CLOTH.purple}>
      <circle cx={0} cy={10} r={6} fill={tint(CLOTH.purple, 0.45)} {...EDGE_IN} />
      <path d={rr(-2.5, 26, 5, 16, 2.5)} fill={CLOTH.white} {...EDGE_IN} />
      <L d="M -15 74 H 15" />
    </Shape>
  </g>
);

export const BeerBottle: React.FC = () => (
  <g>
    <Body d="M -12 -78 L 12 -78 L 12 -40 Q 14 -18 32 -4 Q 38 2 38 14 L 38 78 Q 38 86 30 86 L -30 86 Q -38 86 -38 78 L -38 14 Q -38 2 -32 -4 Q -14 -18 -12 -40 Z" fill={CLOTH.brown} bands={[
      {d: rr(-60, 18, 120, 46, 0), fill: CLOTH.offwhite},
      {d: rr(-60, 34, 120, 10, 0), fill: CLOTH.red},
      {d: rr(-40, -56, 80, 14, 0), fill: CLOTH.offwhite},
    ]}>
      <L d="M -40 18 H 40" />
      <L d="M -40 64 H 40" />
      <L d="M -40 34 H 40" />
      <L d="M -40 44 H 40" />
      <L d="M -14 -56 H 14" />
      <L d="M -14 -42 H 14" />
    </Body>
    <Shape d="M -14 -78 L -14 -87 Q -14 -91 -10 -91 L 10 -91 Q 14 -91 14 -87 L 14 -78 L 11 -75 L 8 -78 L 5 -75 L 2 -78 L -1 -75 L -4 -78 L -7 -75 L -10 -78 L -13 -75 Z" fill={CLOTH.yellow} shadow={0.5} />
  </g>
);

export const Phone: React.FC = () => {
  const tiles = [CLOTH.teal, CLOTH.yellow, CLOTH.pink, CLOTH.blue, CLOTH.green, CLOTH.orange];
  return (
    <g transform="rotate(-8)">
      <Shape d={rr(44, -52, 5, 22, 2.5)} fill={CLOTH.charcoal} shadow={0} line="in" />
      <Shape d={rr(-44, -84, 88, 168, 14)} fill={CLOTH.charcoal} />
      <Shape d={rr(-37, -74, 74, 146, 8)} fill={tint(CLOTH.sky, 0.3)} shadow={0} line="in">
        {tiles.map((c, i) => <path key={i} d={rr(-29 + (i % 3) * 22, -50 + Math.floor(i / 3) * 22, 14, 14, 4)} fill={c} {...EDGE_IN} />)}
        <L d="M -14 62 H 14" />
      </Shape>
      <path d={rr(-12, -70, 24, 7, 3.5)} fill={CLOTH.charcoal} {...EDGE_IN} />
    </g>
  );
};

export const AlarmClock: React.FC = () => {
  const bell = (x: number, a: number) => (
    <g transform={`translate(${x} -30) rotate(${a})`}>
      <Shape d="M -22 6 Q -22 -22 0 -22 Q 22 -22 22 6 Z" fill={CLOTH.yellow} />
    </g>
  );
  return (
    <g transform="translate(0 2)">
      <g transform="translate(-34 66) rotate(25)"><Shape d={rr(-5, -4, 10, 20, 4)} fill={CLOTH.charcoal} shadow={0.4} /></g>
      <g transform="translate(34 66) rotate(-25)"><Shape d={rr(-5, -4, 10, 20, 4)} fill={CLOTH.charcoal} shadow={0.4} /></g>
      {bell(-34, -36)}
      {bell(34, 36)}
      <Tube d="M 0 -42 V -62" w={4} fill={METAL} />
      <Shape d={ell(0, -66, 6, 6)} fill={METAL} shadow={0.4} />
      <Shape d={ell(0, 12, 56, 56)} fill={CLOTH.teal} shadow={1.2} />
      <Shape d={ell(0, 12, 43, 43)} fill={CLOTH.white} shadow={0} line="in">
        <L d="M 0 -26 V -20" />
        <L d="M 0 44 V 50" />
        <L d="M -38 12 H -32" />
        <L d="M 32 12 H 38" />
      </Shape>
      <O d="M 0 12 L -17 2" />
      <O d="M 0 12 L 24 -2" />
      <circle cx={0} cy={12} r={3.5} fill={INK} />
    </g>
  );
};

export const Pillow: React.FC = () => (
  <g transform="rotate(-6)">
    <Shape d="M -82 -44 Q -40 -56 0 -48 Q 40 -56 82 -44 Q 72 0 82 44 Q 40 56 0 48 Q -40 56 -82 44 Q -72 0 -82 -44 Z" fill={tint(CLOTH.sky, 0.4)} shadow={1.4}>
      <L d="M -82 -44 Q -70 -36 -62 -34" />
      <L d="M 82 -44 Q 70 -36 62 -34" />
      <L d="M -82 44 Q -70 36 -62 34" />
      <L d="M 82 44 Q 70 36 62 34" />
      <L d="M -24 -10 Q 0 4 26 -6" />
    </Shape>
  </g>
);

export const Bed: React.FC = () => {
  const wood = CLOTH.brown;
  return (
    <g transform="translate(0 6)">
      <Shape d={rr(-90, -64, 15, 132, 6)} fill={wood} />
      <Shape d={rr(-78, 18, 156, 14, 3)} fill={wood} />
      {/* the mattress, with its piping seam */}
      <Shape d={rr(-78, -10, 154, 30, 9)} fill={CLOTH.white}>
        <L d="M -78 8 H 76" />
      </Shape>
      {/* the pillow resting on the mattress */}
      <Shape d={ell(-57, -18, 20, 9)} fill={CLOTH.offwhite} shadow={0.7} />
      {/* the blanket lying flat on the mattress and hanging over its side; the mattress shows below it and at the foot */}
      <Body d="M -38 -14 L 61 -14 Q 66 -14 66 -9 L 66 13 Q 14 17 -38 14 Z" fill={CLOTH.blue} bands={[{d: 'M -50 -30 L -26 -30 L -26 30 L -50 30 Z', fill: CLOTH.white}]}>
        <L d="M -26 -14 V 15" />
        <L d="M 4 2 Q 8 9 5 16" />
        <L d="M 36 2 Q 40 9 37 15" />
      </Body>
      <Shape d={rr(74, -20, 15, 88, 6)} fill={wood} />
    </g>
  );
};

export const Chair: React.FC = () => {
  const wood = CLOTH.tan;
  return (
    <g transform="translate(-2 2)">
      {/* back posts running down into the back legs */}
      <Shape d={rr(-31, -84, 9, 146, 3)} fill={wood} shadow={0.5} />
      <Shape d={rr(46, -84, 9, 140, 3)} fill={wood} shadow={0.5} />
      <Shape d={rr(-36, -88, 96, 20, 6)} fill={wood} />
      <Shape d={rr(-31, -52, 86, 11, 3)} fill={wood} shadow={0.6} />
      {/* seat: cushion on top, wooden front and side */}
      <Shape d={poly([-58, 4, 28, 4, 28, 16, -58, 16])} fill={wood} shadow={0.6} />
      <Shape d={poly([28, 4, 55, -12, 55, 0, 28, 16])} fill={shade(wood)} shadow={0} />
      <Shape d={poly([-58, 4, 28, 4, 55, -12, -31, -12])} fill={CLOTH.teal} shadow={0.5} />
      {/* front legs */}
      <Shape d={rr(-57, 14, 9, 74, 3)} fill={wood} shadow={0.5} />
      <Shape d={rr(19, 14, 9, 74, 3)} fill={wood} shadow={0.5} />
    </g>
  );
};

// =================================================================== registry and boards

export const PROPS_V8: Record<string, React.FC> = {
  clipboard: Clipboard, stethoscope: Stethoscope, syringe: Syringe, vaccineVial: VaccineVial, thermometer: Thermometer,
  pillBottle: PillBottle, blisterStrip: BlisterStrip, bandageRoll: BandageRoll, plaster: Plaster, soap: Soap,
  toothbrush: Toothbrush, toothpaste: Toothpaste, nailClipper: NailClipper, tweezers: Tweezers, stopSign: StopSign,
  glassOfWater: GlassOfWater, sodaCan: SodaCan, burger: Burger, candy: Candy, chewingGum: ChewingGum,
  plateOfFood: PlateOfFood, apple: Apple, cigarette: Cigarette, vapePen: VapePen, beerBottle: BeerBottle,
  phone: Phone, alarmClock: AlarmClock, pillow: Pillow, bed: Bed, chair: Chair,
};

type Item = {C: React.FC; name: string; note?: string};
const COLS = [237, 598, 960, 1322, 1683];
const ROWS = [164, 456, 748];
const Grid: React.FC<{items: Item[]}> = ({items}) => (
  <>
    {items.map(({C, name, note}, i) => {
      const cx = COLS[i % 5];
      const top = ROWS[Math.floor(i / 5)];
      return (
        <React.Fragment key={name}>
          <Panel x={cx - 172} y={top} w={344} h={276} />
          <Fig x={cx} y={top + 118} size={212}><C /></Fig>
          <Caption x={cx} y={top + 220} name={name} note={note} w={320} size={21} />
        </React.Fragment>
      );
    })}
  </>
);

const CLINIC: Item[] = [
  {C: Clipboard, name: 'Clipboard', note: 'sheet and pen'},
  {C: Stethoscope, name: 'Stethoscope'},
  {C: Syringe, name: 'Syringe'},
  {C: VaccineVial, name: 'Vaccine vial'},
  {C: Thermometer, name: 'Thermometer', note: 'digital stick'},
  {C: PillBottle, name: 'Pill bottle', note: 'blank label'},
  {C: BlisterStrip, name: 'Blister strip', note: 'one tablet taken'},
  {C: BandageRoll, name: 'Bandage roll'},
  {C: Plaster, name: 'Sticking plaster'},
  {C: Soap, name: 'Bar of soap'},
  {C: Toothbrush, name: 'Toothbrush'},
  {C: Toothpaste, name: 'Toothpaste'},
  {C: NailClipper, name: 'Nail clipper'},
  {C: Tweezers, name: 'Tweezers'},
  {C: StopSign, name: 'STOP sign', note: 'hand-held'},
];
const HOME: Item[] = [
  {C: GlassOfWater, name: 'Glass of water'},
  {C: SodaCan, name: 'Soda can', note: 'our own plain design'},
  {C: Burger, name: 'Burger'},
  {C: Candy, name: 'Sweets', note: 'wrapped candy'},
  {C: ChewingGum, name: 'Chewing gum'},
  {C: PlateOfFood, name: 'Plate of food', note: 'rice, greens, chicken'},
  {C: Apple, name: 'Apple'},
  {C: Cigarette, name: 'Cigarette', note: 'lit, thin smoke'},
  {C: VapePen, name: 'Vape pen'},
  {C: BeerBottle, name: 'Beer bottle'},
  {C: Phone, name: 'Mobile phone'},
  {C: AlarmClock, name: 'Alarm clock'},
  {C: Pillow, name: 'Pillow'},
  {C: Bed, name: 'Bed', note: 'side view, blanket'},
  {C: Chair, name: 'Chair', note: 'clinic or dining'},
];

export const PropsClinic: React.FC = () => (
  <Board kicker="Props · clinic and care 1 of 2" title="Clinic and care: the objects in the doctor's room" note="Same outline, flat colour with one darker tone, a few inner lines · no faces · true-to-life shapes">
    <Grid items={CLINIC} />
  </Board>
);
export const PropsHome: React.FC = () => (
  <Board kicker="Props · home and habits 2 of 2" title="Home and habits: the objects in everyday scenes" note="Same outline, flat colour with one darker tone, a few inner lines · no faces · true-to-life shapes">
    <Grid items={HOME} />
  </Board>
);

// =====================================================================================================================
// ENGINE v9 (format 6): the HERO PROP and the INTRUDER (blueprint 4.6; A1 #8, A4 P3, H5). The one real object of a video is
// drawn a level up from the mascot props: 3 tones (light, mid, shade), 1 highlight line, 2-4 construction details, still
// the kit line. It enters the body from a frame edge or a stage slot at 30-60% of the frame height and may get kit eyes.
// =====================================================================================================================
/** The pilot's hero: a cigarette at hero detail. Paper with a seam, the printed gold ring, a cork filter with flecks, the
 * ash and a flat ember (no glow). `burn` 0..1 shortens it; `smoke` draws two flat smoke curls. Horizontal, about 180 units long. */
export const CigaretteHero: React.FC<{burn?: number; smoke?: boolean; t?: number}> = ({burn = 0, smoke = true, t = 0}) => {
  const len = 150 - 70 * Math.max(0, Math.min(1, burn));
  const x0 = -90, x1 = x0 + 46 + len; // filter 46 units, then paper
  const paper = '#fbf8f2', paperMid = '#efe9df', paperShade = '#d9d1c4';
  const cork = '#e39a4f', corkShade = '#c37b36';
  return (
    <g>
      {smoke && [0, 1].map((i) => <path key={i} d={`M ${x1 + 8} -12 C ${x1 - 4 + i * 10} ${-40 - Math.sin(t * 1.3 + i) * 6} ${x1 + 22} ${-60 + i * 4} ${x1 + 6 + i * 14} ${-92}`} stroke="#d9d4d0" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.85} />)}
      {/* the filter: cork, flecks, its own shade band below */}
      <path d={`M ${x0} -14 L ${x0 + 46} -14 L ${x0 + 46} 14 L ${x0} 14 Q ${x0 - 5} 0 ${x0} -14 Z`} fill={cork} />
      <path d={`M ${x0} 6 L ${x0 + 46} 6 L ${x0 + 46} 14 L ${x0} 14 Z`} fill={corkShade} />
      {[[-80, -6], [-72, 2], [-64, -8], [-56, 4], [-50, -2], [-84, 8], [-60, 9]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.7} fill={shade(corkShade, 0.25)} />)}
      {/* the paper: light top, mid body, shade band, the seam line along it */}
      <path d={`M ${x0 + 46} -14 L ${x1} -14 L ${x1} 14 L ${x0 + 46} 14 Z`} fill={paperMid} />
      <path d={`M ${x0 + 46} -14 L ${x1} -14 L ${x1} -6 L ${x0 + 46} -6 Z`} fill={paper} />
      <path d={`M ${x0 + 46} 7 L ${x1} 7 L ${x1} 14 L ${x0 + 46} 14 Z`} fill={paperShade} />
      <path d={`M ${x0 + 52} 2 L ${x1 - 4} 2`} stroke={paperShade} strokeWidth={1.6} strokeDasharray="10 6" />
      {/* the printed gold ring where filter meets paper */}
      <path d={`M ${x0 + 46} -14 L ${x0 + 52} -14 L ${x0 + 52} 14 L ${x0 + 46} 14 Z`} fill="#e8bd5c" {...EDGE_IN} />
      {/* the burning end: grey ash, a flat orange-red ember line */}
      <path d={`M ${x1} -14 L ${x1 + 14} -12 Q ${x1 + 20} 0 ${x1 + 14} 12 L ${x1} 14 Z`} fill="#8e8a88" />
      <path d={`M ${x1 + 6} -13 Q ${x1 + 12} 0 ${x1 + 6} 13`} stroke="#e2573f" strokeWidth={5} fill="none" />
      {[[x1 + 9, -5], [x1 + 12, 4]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="#5c5654" />)}
      {/* one highlight, then the kit outline over the whole */}
      <path d={`M ${x0 + 60} -9 L ${x0 + 60 + Math.min(70, len * 0.4)} -9`} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <path d={`M ${x0} -14 L ${x1} -14 L ${x1 + 14} -12 Q ${x1 + 20} 0 ${x1 + 14} 12 L ${x1} 14 L ${x0} 14 Q ${x0 - 5} 0 ${x0} -14 Z`} {...OUTLINE} />
      <path d={`M ${x0 + 46} -14 V 14 M ${x1} -14 V 14`} {...INLINE} />
    </g>
  );
};
/** An ashtray: a round dish seen a little from above, notches on the rim, a stubbed-out end inside. */
export const Ashtray: React.FC = () => (
  <g transform="translate(0 20)">
    <Shape d="M -86 0 Q -86 46 0 50 Q 86 46 86 0 Z" fill="#9fb4c4" shadow={0.8} />
    <path d={ell(0, 0, 86, 28)} fill="#bfd0dc" {...EDGE} />
    <path d={ell(0, 2, 62, 18)} fill="#8ea3b3" {...EDGE_IN} />
    {[-70, 70].map((x) => <path key={x} d={`M ${x - 9} ${-13} Q ${x} ${-2} ${x + 9} ${-13}`} fill="#8ea3b3" {...EDGE_IN} />)}
    <g transform="translate(-6 0) rotate(-14) scale(0.32)"><CigaretteHero burn={0.85} smoke={false} /></g>
    <path d="M 16 -2 q 10 -4 18 2 q -6 6 -18 -2 Z" fill="#8e8a88" />
  </g>
);

/** How a prop comes INTO a hand (A4 H5): over 0.15 s it scales in while the hand rises over 0.3 s; `start` = there from frame 0. */
export const handProp = (t: number, t0: number, enter: 'below' | 'pocket' | 'start' = 'below') => {
  if (enter === 'start') return {k: 1, op: 1, lift: 0};
  const u = Math.max(0, Math.min(1, (t - t0) / 0.3));
  const e = 1 - Math.pow(1 - u, 3);
  const s = Math.max(0, Math.min(1, (t - t0 - 0.12) / 0.15));
  return {k: 0.6 + 0.4 * s, op: s, lift: (1 - e) * (enter === 'below' ? 260 : 90)};
};

export type IntruderFrom = 'top' | 'left' | 'right' | 'bottom';
/**
 * A real object entering the body (A1 #8): it slides in from a frame edge (or from a stage slot: pass `from` as the slot's
 * {x, y}) to `at`, eased out with a 4% overshoot at most, over `dur` seconds from `t0`, then holds. `height` is its size as
 * a share of the 1920 frame (0.3-0.6). Children are drawn in the 200-unit figure space; `eyes` adds the kit face.
 */
export const Intruder: React.FC<{from: IntruderFrom | {x: number; y: number}; at: [number, number]; t: number; t0?: number; dur?: number; height?: number; rot?: number; eyes?: V8Props & {x?: number; y?: number; r?: number}; children: React.ReactNode}> = ({from, at, t, t0 = 0, dur = 0.6, height = 0.4, rot = 0, eyes, children}) => {
  const size = 1920 * Math.max(0.2, Math.min(0.7, height));
  const start: [number, number] = typeof from === 'object' ? [from.x, from.y]
    : from === 'left' ? [-size * 0.6, at[1]] : from === 'right' ? [1080 + size * 0.6, at[1]] : from === 'top' ? [at[0], -size * 0.6] : [at[0], 1920 + size * 0.6];
  const u = Math.max(0, Math.min(1, (t - t0) / dur));
  // ease out with a small overshoot (4% at most), then settle
  const e = u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.04;
  const x = start[0] + (at[0] - start[0]) * e, y = start[1] + (at[1] - start[1]) * e;
  if (t < t0) return null;
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', pointerEvents: 'none'}} width={size} height={size} viewBox="-100 -100 200 200">
      <g transform={`rotate(${rot})`}>
        {children}
        {eyes && <><Eyes x={eyes.x ?? 0} y={eyes.y ?? -10} r={eyes.r ?? 12} mood={eyes.mood} look={eyes.look} /><Mouth x={eyes.x ?? 0} y={(eyes.y ?? -10) + (eyes.r ?? 12) * 1.7} w={(eyes.r ?? 12) * 0.95} kind={eyes.mouth ?? 'flat'} /></>}
      </g>
    </svg>
  );
};
