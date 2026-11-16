// Staging helpers: put characters on screen, keep their outlines thin at any size, hold a pose.
import React, {useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {ScaleCtx} from './ink';
import {STYLE} from './style';

/** A character slot: a `size` px box centred on (x, y). The character draws in a 200-unit box. */
export const Slot: React.FC<{x: number; y: number; size: number; children: React.ReactNode}> = ({x, y, size, children}) => {
  const parent = useContext(ScaleCtx);
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">
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

/** The camera: zoom on a point. Outlines stay thin in close-ups because the zoom is shared. */
export const Camera: React.FC<{zoom: number; cx: number; cy: number; children: React.ReactNode}> = ({zoom, cx, cy, children}) => (
  <ScaleCtx.Provider value={zoom}>
    <AbsoluteFill style={{transform: `translate(${540 - cx}px, ${960 - cy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`}}>{children}</AbsoluteFill>
  </ScaleCtx.Provider>
);
