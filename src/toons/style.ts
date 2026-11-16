// MedPeak Toons style settings: the ONE place that controls the look of every character and set.
// Change a number here, re-render the boards (ToonCast, ToonSets, ToonActing) and the whole
// cast follows. Nothing in this look comes from AI art: it is all drawn by the code in this folder.
export const STYLE = {
  ink: '#1d2b4f', // outline colour (navy)
  line: 2.8, // outline thickness (character units; 2.2 = fine, 3.6 = chunky)
  shadowSideWeight: 0.6, // how much thicker the outline gets on the shadow side (0 = even)
  eyeScale: 1.32, // eye size (1 = small and cute, 1.5 = huge and goofy)
  eyeGap: 13.2, // distance of each eye from the centre (12.5 = touching, 16 = apart)
  pupilScale: 0.9, // pupil size (smaller = funnier, bigger = cuter)
  browWeight: 6.5, // eyebrow thickness
  shadow: 0.22, // body shadow strength (0 = flat, 0.35 = dramatic)
  gloss: 0.85, // highlight strength (0 = matte)
  boil: 1.6, // hand-drawn line wobble (0 = off, 3 = very shaky)
  grain: 0.09, // paper grain over the frame (0 = clean)
  sway: 2.4, // idle sway in degrees
  breathe: 0.014, // idle breathing amount
  captionBg: '#1d2b4f',
  captionText: '#ffffff',
  captionKey: '#ffc93c', // colour of the key word in captions
  label: '#2ec4b6', // colour of place labels like "GUT"
};
export type ToonStyle = typeof STYLE;
