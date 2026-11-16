// Staging helpers: put characters on screen, keep their outlines thin at any size, hold a pose.
import React, {useContext, useId} from 'react';
import {ScaleCtx} from './ink';
import {STYLE} from './style';

export {Camera} from './camera';

/**
 * A character slot: a `size` px box centred on (x, y). The character draws in a 200-unit box.
 * `blur` = out of focus (px). `tone` = the room's light on the character: how much red, green and
 * blue is left (a night room dims and cools the people in it).
 */
export const Slot: React.FC<{x: number; y: number; size: number; blur?: number; tone?: [number, number, number] | null; children: React.ReactNode}> = ({x, y, size, blur = 0, tone = null, children}) => {
  const parent = useContext(ScaleCtx);
  const id = `tone${useId().replace(/:/g, '')}`;
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', filter: blur > 0.3 ? `blur(${(blur / parent).toFixed(2)}px)` : undefined}} width={size} height={size} viewBox="-100 -100 200 200">
      {tone && <defs><filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`${tone[0]} 0 0 0 0  0 ${tone[1]} 0 0 0  0 0 ${tone[2]} 0 0  0 0 0 1 0`} /></filter></defs>}
      <ScaleCtx.Provider value={(parent * size) / 200}>{tone ? <g filter={`url(#${id})`}>{children}</g> : children}</ScaleCtx.Provider>
    </svg>
  );
};

/** Stand a character on the floor: its ground point (blueprint ground.y) lands on screen y = floor. */
export const Stand: React.FC<{x: number; floor: number; size: number; ground?: number; tone?: [number, number, number] | null; children: React.ReactNode}> = ({x, floor, size, ground = 96, tone, children}) => (
  <Slot x={x} y={floor - (ground / 200) * size} size={size} tone={tone}>{children}</Slot>
);

/** A moving hold: breathing only, around the ground point. No sway, no wobble. */
export const Hold: React.FC<{frame: number; seed?: number; ground?: number; children: React.ReactNode}> = ({frame, seed = 0, ground = 96, children}) => {
  const b = 1 + Math.sin((frame / 30) * 2.2 + seed) * STYLE.breathe;
  return <g transform={`translate(0 ${ground}) scale(${2 - b} ${b}) translate(0 ${-ground})`}>{children}</g>;
};
