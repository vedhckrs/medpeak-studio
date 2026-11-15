// The shape of videos/<slug>/video.json (the single source for a video) and timings.json.

export type Organ = 'liver' | 'pancreas' | 'heart' | 'brain' | 'vessel' | 'cell' | 'tooth' | 'body' | 'fatcell';

export type Visual =
  | {type: 'title'; text: string; sub?: string; accent?: string}
  | {type: 'stat'; value: number; unit?: string; label: string; decimals?: number; color?: string}
  | {type: 'compare'; items: {label: string; value: number; unit?: string; color?: string}[]; caption?: string}
  | {type: 'organ'; organ: Organ; label?: string; level?: number; callouts?: string[]; highlight?: string}
  | {type: 'flow'; steps: string[]; color?: string}
  | {type: 'list'; n: number; title: string; sub?: string}
  | {type: 'chapter'; n: number; title: string}
  | {type: 'twist'; text: string}
  | {type: 'fact'; text: string; source?: string}
  | {type: 'spoons'; count: number; label: string; limit?: number}
  | {type: 'clip'; src: string; label?: string}
  | {type: 'image'; src: string; label?: string};

export type SceneVisual = Visual & {panels?: Visual[]};

export type Scene = {
  id: string;
  chapter?: string;
  text: string;
  visual: SceneVisual;
  sources?: string[];
  sfx?: string;
};

export type RetentionPoint = {scene: string; line: string};
export type Retention = Record<'noIntro' | 'promise' | 'counting' | 'change3s' | 'twist' | 'bestLast' | 'loop', RetentionPoint>;

export type Short = {id: string; title: string; scenes: (string | Scene)[]; retention: Retention; package?: Pkg};

export type Pkg = {title: string; tags?: string[]; hashtags?: string; thumbnail?: {text: string; organ?: Organ}; description?: string};

export type Source = {id: string; label: string; url: string; note?: string};

export type Video = {
  slug: string;
  topic?: string;
  voice?: {voiceId: string; model?: string};
  music?: {prompt?: string; seconds?: number};
  retention: Retention;
  chapters: {id: string; title: string}[];
  scenes: Scene[];
  shorts?: Short[];
  sources: Source[];
  package: Pkg;
};

export type Word = {w: string; start: number; end: number};
export type Timings = {scenes: Record<string, {duration: number; file: string; words: Word[]}>};

export type VideoProps = {
  video: Video;
  timings: Timings | null;
  shortId?: string;
  hasMusic?: boolean;
  clips?: string[]; // clip files that exist in public/
};
