// Staging helpers: put characters on screen, keep their outlines thin at any size, hold a pose.
import React, {useContext} from 'react';
import {ScaleCtx} from './ink';
import {STYLE} from './style';

export {Camera} from './camera';

/** A character slot: a `size` px box centred on (x, y). The character draws in a 200-unit box. `blur` = out of focus (px). */
export const Slot: React.FC<{x: number; y: number; size: number; blur?: number; children: React.ReactNode}> = ({x, y, size, blur = 0, children}) => {
  const parent = useContext(ScaleCtx);
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', filter: blur > 0.3 ? `blur(${(blur / parent).toFixed(2)}px)` : undefined}} width={size} height={size} viewBox="-100 -100 200 200">
      <ScaleCtx.Provider value={(parent * size) / 200}>{children}</ScaleCtx.Provider>
    </svg>
  );
};

/** Stand a character on the floor: its ground point (blueprint ground.y) lands on screen y = floor. */
export const Stand: React.FC<{x: number; floor: number; size: number; ground?: number; children: React.ReactNode}> = ({x, floor, size, ground = 96, children}) => (
  <Slot x={x} y={floor - (ground / 200) * size} size={size}>{children}</Slot>
);

/** A moving hold: breathing only, around the ground point. No sway, no wobble. */
export const Hold: React.FC<{frame: number; seed?: number; ground?: number; children: React.ReactNode}> = ({frame, seed = 0, ground = 96, children}) => {
  const b = 1 + Math.sin((frame / 30) * 2.2 + seed) * STYLE.breathe;
  return <g transform={`translate(0 ${ground}) scale(${2 - b} ${b}) translate(0 ${-ground})`}>{children}</g>;
};
