import {loadFont} from '@remotion/google-fonts/Inter';

const {fontFamily} = loadFont('normal', {weights: ['400', '600', '800', '900'], subsets: ['latin']});

/** The locked MedPeak Health look: deep clinical navy, teal science accent, warm sugar amber. */
export const theme = {
  font: fontFamily,
  bg: '#061528',
  bg2: '#0b2a4a',
  panel: 'rgba(255,255,255,0.06)',
  line: 'rgba(255,255,255,0.14)',
  white: '#f4f8fc',
  muted: '#9db4cc',
  teal: '#19c3b1',
  cyan: '#4fd1ff',
  amber: '#ffb547',
  coral: '#ff6b6b',
  red: '#e2493f',
  green: '#43d18a',
  violet: '#9b8cff',
};

export const FPS = 60;
export const LONG = {width: 1920, height: 1080};
export const SHORT = {width: 1080, height: 1920};
export const END_SCREEN_SECONDS = 12; // long video only: room for YouTube end-screen elements
