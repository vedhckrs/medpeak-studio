// MedPeak Toons style settings (v5): the ONE place that controls the look of every character
// and set. Change a number here, re-render the boards (ToonCast, ToonBlueprint, ToonSheet,
// ToonActing) and everything follows. 100% code-drawn: no AI art anywhere in this folder.
export const STYLE = {
  // ---- line
  line: 1.9, // outline thickness in character units (a character box is 200 units tall)
  maxLinePx: 4.2, // ...but never thicker than this many pixels on screen, however big the character
  lineDarkness: 0.66, // outlines are a darker shade of each fill colour; 0.5 = soft, 0.8 = near black
  // ---- face
  eyeScale: 1.25, // eye size (1 = small, 1.5 = huge)
  eyeGap: 13, // each eye's distance from the centre (12.5 = touching)
  pupilScale: 1, // pupil size (smaller = funnier, bigger = cuter)
  blush: 1, // cheek blush strength (0 = none)
  // ---- light
  shadow: 0.15, // cel shadow darkness (0 = flat colour)
  shadowDepth: 7, // how wide the shadow edge is, in character units
  topLight: 0.2, // soft light from the top-left
  gloss: 0.9, // highlight strength (0 = matte)
  // ---- motion and finish
  boil: 0, // hand-drawn line wobble. OFF: it read as a "burning screen" (owner, 2026-11-16)
  breathe: 0.007, // idle breathing (a moving hold); characters do not sway
  grain: 0.04, // paper grain over the frame (0 = clean)
  // ---- colours
  ink: '#2a2440', // deep colour for text and the darkest accents
  captionBg: '#1d2b4f',
  captionText: '#ffffff',
  captionKey: '#ffc93c',
  label: '#2ec4b6',
  fleshLine: '#8c3848', // outline colour inside the body sets
  roomLine: '#55608c', // outline colour in the real-world sets
  setLinePx: 3.2, // outline thickness in the sets, in pixels
};
export type ToonStyle = typeof STYLE;
