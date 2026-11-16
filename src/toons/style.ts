// MedPeak Toons style settings (v6): the ONE place that controls the look of every character
// and set. Change a number here, re-render the boards (ToonCast, ToonBlueprint, ToonSheet,
// ToonActing) and everything follows. 100% code-drawn: no AI art anywhere in this folder.
export const STYLE = {
  // ---- line
  line: 1.8, // outline thickness in character units (a character box is 200 units tall)
  maxLinePx: 4.2, // ...but never thicker than this many pixels on screen, however big the character
  lineDarkness: 0.66, // outlines are a darker shade of each fill colour; 0.5 = soft, 0.8 = near black
  // ---- face
  eyeScale: 1.25, // eye size (1 = small, 1.5 = huge)
  eyeGap: 13, // each eye's distance from the centre (12.5 = touching)
  pupilScale: 1, // pupil size (smaller = funnier, bigger = cuter)
  blush: 1, // cheek blush strength (0 = none)
  // ---- light (v6: volume paint). Light comes from the top-left.
  shadow: 0.17, // core shadow darkness: the crisp crescent on the lower right
  shadowDeep: 0.3, // the darker, thinner occlusion edge inside the core shadow
  shadowDepth: 8, // how wide the core shadow is, in character units
  form: 0.26, // soft roundness: a gradient from light (upper left) to shade (lower right); 0 = flat cel
  topLight: 0.3, // strength of the soft light on the upper left
  rim: 0.6, // bounce light: a thin lighter line hugging the shadow-side edge
  edge: 0.5, // a thin bright line hugging the light-side edge
  gloss: 0.92, // highlight strength (0 = matte)
  texture: 1, // surface texture strength (stipple, mottling, weave); 0 = clean vector
  // ---- motion and finish
  boil: 0, // hand-drawn line wobble. OFF: it read as a "burning screen" (owner, 2026-11-16)
  breathe: 0.007, // idle breathing (a moving hold); characters do not sway
  grain: 0.035, // paper grain over the frame (0 = clean)
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
