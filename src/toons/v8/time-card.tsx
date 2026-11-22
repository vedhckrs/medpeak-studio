/**
 * MedPeak Toons, engine v9: the TIME CARD (decision 20, the owner's yes of 2026-11-23).
 * A black full frame with one short line in the caption font ("3 DAYS LATER"), 0.8-1.2 s, a hard cut in and out (it is a cut,
 * not a transition, so "no transitions" holds). The watermark stays on (the player draws it on top). The picture after the
 * card has the SAME framing as before it; only the state changed (the shot plays again with `pass: 2`).
 *
 * Its home is this small file so the player can draw it now; it may move into hud.tsx with the other screen pieces.
 */
import React from 'react';
import {FONT, INK} from './kit';

/** A time card is shown for this long (seconds): the gate fails anything outside it. */
export const TIME_CARD = {min: 0.8, max: 1.2, most: 3, bg: '#0d0a09'};

/** The card itself. `t` is seconds since the card began: the text is there from its first frame (no pop, no fade: a cut). */
export const TimeCard: React.FC<{text: string; t?: number; bg?: string}> = ({text, bg = TIME_CARD.bg}) => {
  const words = text.trim().toUpperCase();
  // one line: the size shrinks for a longer line so it never wraps (about 18 characters fit at 118 px)
  const size = Math.min(118, Math.floor(1900 / Math.max(8, words.length)));
  return (
    <div style={{position: 'absolute', inset: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: 2, color: '#ffffff', whiteSpace: 'nowrap',
        WebkitTextStroke: `${Math.round(size * 0.1)}px ${INK}`, paintOrder: 'stroke fill'}}>{words}</div>
    </div>
  );
};
