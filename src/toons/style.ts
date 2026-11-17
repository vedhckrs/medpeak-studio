// MedPeak Toons style settings (v6): the ONE place that controls the look of every character
// and set. Change a number here, re-render the boards (ToonCast, ToonBlueprint, ToonSheet,
// ToonActing) and everything follows. 100% code-drawn: no AI art anywhere in this folder.
export const STYLE = {
  // ---- line
  // Ink look (owner, 2026-11-17: "Yes, this look"; plans/reference-deep-study-2026-11-17.md): every
  // outline is one dark ink colour and bold. 'shade' = the v6 outline, a darker shade of each fill.
  outline: 'ink' as 'ink' | 'shade',
  inkLine: '#2b1a17',
  line: 2.6, // outline thickness in character units (a character box is 200 units tall) [1.8]
  maxLinePx: 6.5, // ...but never thicker than this many pixels on screen, however big the character [4.2]
  lineDarkness: 0.66, // outlines are a darker shade of each fill colour; 0.5 = soft, 0.8 = near black
  // ---- face
  eyeScale: 1.32, // eye size (1 = small, 1.5 = huge) [1.25]
  eyeGap: 13, // each eye's distance from the centre (12.5 = touching)
  pupilScale: 1.15, // pupil size (smaller = funnier, bigger = cuter) [1]
  blush: 0.3, // cheek blush strength (0 = none) [1]
  // Clean 2D look (owner's pick, 2026-11-17). 'dot' = a plain white eye with a dark pupil and one
  // small catchlight; 'iris' = the v6 eye (coloured shaded iris, lid shadow, two highlights).
  // 'ring' (ink look): a plain white eye, a black ring and a black dot, no catchlight.
  eye: 'ring' as 'ring' | 'dot' | 'iris',
  // Body characters (organs, cells, germs, the pill, the bone, poop) are anatomy, not mascots: no
  // arms, hands or legs. People keep theirs. true = v6 (arms on bodies, legs on travellers).
  bodyLimbs: false,
  // Costume pieces on body characters: the white cell's guard cap, the platelet's medic helmet,
  // the egg's bow and lashes. false = plain anatomy (clean 2D); true = v6.
  accessories: false,
  // ---- light (v6: volume paint). Light comes from the top-left.
  shadow: 0.15, // core shadow darkness: the crisp crescent on the lower right [0.17]
  shadowDeep: 0.15, // the darker, thinner occlusion edge inside the core shadow; same as `shadow` = one flat step [0.3]
  shadowDepth: 8, // how wide the core shadow is, in character units
  form: 0.1, // soft roundness: a gradient from light (upper left) to shade (lower right); 0 = flat cel [0.26]
  topLight: 0.12, // strength of the soft light on the upper left [0.3]
  // Clean-look proposal (owner, 2026-11-17: "remove glare and all unnecessary things"). Old values in brackets.
  rim: 0.2, // bounce light: a thin lighter line hugging the shadow-side edge [0.6]
  edge: 0, // a thin bright line hugging the light-side edge [0.5]
  gloss: 0, // highlight strength (0 = matte): streaks on bodies, arms, legs, veins and sparkles [0.92]
  texture: 0, // surface texture strength (stipple, mottling, weave); 0 = clean vector [1]
  // ---- camera and air. Clean 2D (owner, 2026-11-17: "remove bokeh"). 1 / true = v6.
  lensBlur: 0, // depth of field, out-of-focus actors, rack-focus softness and whip-pan blur
  foreground: false, // the layer in front of the characters (leaves, a curtain edge, a fold of tissue); it was drawn out of focus
  specks: 0, // drifting dust and ring bubbles in the air. Food, crumbs and oxygen stay: they are the story
  glow: 0, // soft light pools, light shafts, lamp glow and the soft ring around a prop's disc
  vignette: 0, // darkening toward the corners of the frame
  // ---- motion and finish
  boil: 0, // hand-drawn line wobble. OFF: it read as a "burning screen" (owner, 2026-11-16)
  tagStyle: 'hook' as 'hook' | 'label' | 'pill', // hook = bold yellow block, big words, a slight tilt; label = white chart box; pill = v6
  captionPop: false, // each caption word grows in over 4 frames (v6); the ink look just swaps the word, as the reference does [true]
  talkBeat: 0.2, // how much people's arms and heads beat on stressed words while they talk [1]
  roomLife: 0, // clouds, birds, a monitor, plants in the real-world rooms; 0 = the room holds still and only the people act (reference rooms are still) [1]
  breathe: 0, // idle breathing; 0 = hold still between actions, as the reference does (63% of frames still) [0.007]
  grain: 0, // paper grain over the frame (0 = clean) [0.035]
  // ---- colours
  ink: '#2a2440', // deep colour for text and the darkest accents
  captionBg: '#1d2b4f',
  captionText: '#ffffff',
  captionKey: '#ffc93c',
  label: '#2ec4b6',
  fleshLine: '#2b1a17', // outline colour inside the body sets [#8c3848]
  roomLine: '#2b1a17', // outline colour in the real-world sets [#55608c]
  setLinePx: 5, // outline thickness in the sets, in pixels [3.2]
};
export type ToonStyle = typeof STYLE;
