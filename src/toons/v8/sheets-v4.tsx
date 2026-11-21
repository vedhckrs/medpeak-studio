/**
 * Look v4 (rabies v4, the owner, 2026-11-20): helpers for the 16:9 approval sheets. A 9:16 frame placed
 * small on a board, and a zoomed crop of a frame, so the owner sees the whole picture and the detail.
 */
import React from 'react';
import {FONT, INK} from './kit';
import {SCENE_H, SCENE_W} from './scene';

/** One 1080 x 1920 frame scaled by k, its top-left at (x, y), with a label above it. */
export const Mini: React.FC<{x: number; y: number; k: number; label?: string; children: React.ReactNode}> = ({x, y, k, label, children}) => (
  <>
    {label && <div style={{position: 'absolute', left: x, top: y - 34, width: SCENE_W * k, textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: 0.6}}>{label}</div>}
    <div style={{position: 'absolute', left: x, top: y, width: SCENE_W * k, height: SCENE_H * k, overflow: 'hidden', borderRadius: 14, border: `3px solid ${INK}`, boxSizing: 'content-box'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, transformOrigin: '0 0', transform: `scale(${k})`}}>{children}</div>
    </div>
  </>
);

/** A w x h window on a frame, zoomed by `zoom`, showing the frame area whose top-left is (fx, fy). */
export const Crop: React.FC<{x: number; y: number; w: number; h: number; fx: number; fy: number; zoom: number; label?: string; children: React.ReactNode}> = ({x, y, w, h, fx, fy, zoom, label, children}) => (
  <>
    {label && <div style={{position: 'absolute', left: x, top: y - 34, width: w, textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: 0.6}}>{label}</div>}
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 14, border: `3px solid ${INK}`, boxSizing: 'content-box'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, transformOrigin: '0 0', transform: `scale(${zoom}) translate(${-fx}px, ${-fy}px)`}}>{children}</div>
    </div>
  </>
);
