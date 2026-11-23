#!/usr/bin/env node
/**
 * Renders the look v8 approval sheets (code-drawn cast and props, 1920 x 1080 JPG) into
 * out/toons/sheets-v8/. Each sheet has its own entry file in src/toons/v8/, so one sheet's mistake
 * never breaks another's render. Works on macOS and Windows.
 *
 *   node pipeline/toon-v8-sheets.mjs            all sheets
 *   node pipeline/toon-v8-sheets.mjs cells      only the sheets whose name contains "cells"
 *   node pipeline/toon-v8-sheets.mjs --scenes   the scene frames (1080 x 1920) into out/toons/scenes-v8/
 *   node pipeline/toon-v8-sheets.mjs --scenes c1   only the scene frames whose name contains "c1"
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, isMain, remotion, ROOT, syncBrand} from './lib/util.mjs';

// [entry file, still id, output name]
export const SHEETS = [
  ['entry-people.tsx', 'V8PeopleLineup', 'people-lineup'],
  ['entry-people.tsx', 'V8PersonDoctor', 'person-doctor'],
  ['entry-people.tsx', 'V8PersonPatient', 'person-patient'],
  ['entry-people.tsx', 'V8PersonMom', 'person-mom'],
  ['entry-people.tsx', 'V8PersonDad', 'person-dad'],
  ['entry-people.tsx', 'V8PersonKid', 'person-kid'],
  ['entry-people.tsx', 'V8PersonGrandpa', 'person-grandpa'],
  ['entry-people.tsx', 'V8PersonGrandma', 'person-grandma'],
  ['entry-people.tsx', 'V8PersonBaby', 'person-baby'],
  ['entry-people.tsx', 'V8PeopleHands', 'people-hands'],
  ['entry-organs-a.tsx', 'V8OrgansA', 'organs-a'],
  ['entry-organs-b.tsx', 'V8OrgansB', 'organs-b'],
  ['entry-cells.tsx', 'V8Cells', 'cells'],
  ['entry-germs.tsx', 'V8Germs', 'germs'],
  ['entry-animals.tsx', 'V8Animals', 'animals'],
  ['entry-props.tsx', 'V8PropsClinic', 'props-clinic'],
  ['entry-props.tsx', 'V8PropsHome', 'props-home'],
  ['entry-demo.tsx', 'V8Kit', '_kit'],
  // rabies v4 look sheets (2026-11-20)
  ['entry-micro-v4.tsx', 'V4Micro1', 'v4-micro-1'],
  ['entry-micro-v4.tsx', 'V4Micro2', 'v4-micro-2'],
  ['entry-hud-v4.tsx', 'V4HudCta', 'v4-cta'],
  ['entry-hud-v4.tsx', 'V4HudWatermark', 'v4-watermark'],
  ['entry-hud-v4.tsx', 'V4HudIcons', 'v4-icons'],
  ['entry-hud-v4.tsx', 'V4HudTags', 'v4-tags'],
  ['entry-people-v4.tsx', 'V4PeopleClothes', 'v4-clothes'],
  // no-sleep (2026-11-21)
  ['entry-sleep.tsx', 'SleepCast', 'sleep-cast'],
  ['entry-sleep.tsx', 'SleepPlace', 'sleep-place'],
  ['entry-sleep.tsx', 'SleepRoom', 'sleep-room'],
  // creatine (2026-11-21)
  ['entry-crea.tsx', 'CreaCast', 'crea-cast'],
  ['entry-crea.tsx', 'CreaPlace', 'crea-place'],
  ['entry-crea.tsx', 'CreaPlace2', 'crea-place-close'],
  ['entry-crea.tsx', 'CreaGym', 'crea-gym'],
  // quit-sugar (2026-11-22)
  ['entry-sugar.tsx', 'SugarCast', 'sugar-cast'],
  ['entry-sugar.tsx', 'SugarPlace', 'sugar-place'],
  ['entry-sugar.tsx', 'SugarPlace2', 'sugar-place-close'],
  ['entry-sugar.tsx', 'SugarKitchen', 'sugar-kitchen'],
  // snake-bite (2026-11-22)
  ['entry-snake.tsx', 'SnakeCast', 'snake-cast'],
  ['entry-snake.tsx', 'SnakePlace', 'snake-place'],
  ['entry-snake.tsx', 'SnakeCheck', 'snake-check'],
  // quit-smoking, the engine v9 pilot (2026-11-23)
  ['entry-quit-smoking.tsx', 'SmokePlaces1', 'smoke-place-1'],
  ['entry-quit-smoking.tsx', 'SmokePlaces2', 'smoke-place-2'],
  ['entry-bee-sting.tsx', 'BeePlaces1', 'bee-place-1'],
  ['entry-bee-sting.tsx', 'BeePlaces2', 'bee-place-2'],
  // fasting (2026-11-22)
  ['entry-fast.tsx', 'FastCast', 'fast-cast'],
  ['entry-fast.tsx', 'FastPlace', 'fast-place'],
  ['entry-fast.tsx', 'FastRoom', 'fast-room'],
  // engine v9 / format 6 samples (agent B, 2026-11-23): `node pipeline/toon-v8-sheets.mjs v9-`
  ['entry-v9.tsx', 'V9Eyes', 'v9-closeup-eyes'],
  ['entry-v9.tsx', 'V9Hands', 'v9-closeup-hands-line'],
  ['entry-v9.tsx', 'V9PeopleFaces', 'v9-closeup-people-marks'],
  ['entry-v9.tsx', 'V9Stubble', 'v9-dad-stubble-ab'],
  ['entry-v9.tsx', 'V9CastOrgansA', 'v9-cast-1-organs-a'],
  ['entry-v9.tsx', 'V9CastOrgansA2', 'v9-cast-2-organs-a'],
  ['entry-v9.tsx', 'V9CastOrgansB', 'v9-cast-3-organs-b'],
  ['entry-v9.tsx', 'V9CastOrgansB2', 'v9-cast-4-organs-b'],
  ['entry-v9.tsx', 'V9CastCells', 'v9-cast-5-cells'],
  ['entry-v9.tsx', 'V9CastCells2', 'v9-cast-6-cells'],
  ['entry-v9.tsx', 'V9CastGerms', 'v9-cast-7-germs'],
  ['entry-v9.tsx', 'V9CastGerms2', 'v9-cast-8-germs'],
  ['entry-v9.tsx', 'V9CastPeople', 'v9-cast-9-people'],
  ['entry-v9.tsx', 'V9Crew', 'v9-crew'],
  ['entry-v9.tsx', 'V9Prop', 'v9-hero-prop'],
  ['entry-v9.tsx', 'V9Room', 'v9-pale-room'],
  ['entry-v9.tsx', 'V9EndCard', 'v9-end-card'],
  ['entry-v9.tsx', 'V9Watermark', 'v9-watermark'],
  ['entry-v9.tsx', 'V9Caption', 'v9-caption'],
  ['entry-v9.tsx', 'V9Cover', 'v9-cover'],
  ['entry-anatomy.tsx', 'AnatBoardChest', 'v9-stage-chest'],
  ['entry-anatomy.tsx', 'AnatBoardVessel', 'v9-stage-vessel'],
  ['entry-anatomy.tsx', 'AnatBoardTissue', 'v9-stage-tissue'],
  ['entry-anatomy.tsx', 'AnatBoardBelly', 'v9-stage-upper-belly'],
  ['entry-anatomy.tsx', 'AnatBoardThroat', 'v9-stage-throat'],
  ['entry-anatomy.tsx', 'AnatBoardSkull', 'v9-stage-skull'],
  ['entry-anatomy.tsx', 'AnatBoardSkin', 'v9-stage-skin'],
];

// The scene frames of the rabies video (rooms, the arm, inside the body): [entry file, still id, output name]
export const SCENES = [
  ['entry-scenes-body.tsx', 'V8SceneA', 'a'],
  ['entry-scenes-body.tsx', 'V8SceneB', 'b'],
  ['entry-scenes-body.tsx', 'V8SceneM2', 'm2'],
  ['entry-scenes-rooms.tsx', 'V8SceneC1', 'c1'],
  ['entry-scenes-rooms.tsx', 'V8SceneC2', 'c2'],
  ['entry-scenes-rooms.tsx', 'V8SceneD1', 'd1'],
  ['entry-scenes-rooms.tsx', 'V8SceneD3', 'd3'],
  ['entry-scenes-body.tsx', 'V8SceneE', 'e'],
  ['entry-scenes-body.tsx', 'V8SceneM3', 'm3'],
  ['entry-scenes-rooms.tsx', 'V8RoomKitchen', 'room-kitchen'],
  ['entry-scenes-rooms.tsx', 'V8RoomClinic', 'room-clinic'],
  ['entry-scenes-body.tsx', 'V8PlaceWound', 'place-wound'],
  ['entry-scenes-body.tsx', 'V8PlaceJunction', 'place-junction'],
  ['entry-scenes-body.tsx', 'V8PlaceAxon', 'place-axon'],
  ['entry-scenes-body.tsx', 'V8PlaceTissue', 'place-tissue'],
  // engine v9 stages, full 1080 x 1920 (agent B, 2026-11-23): `node pipeline/toon-v8-sheets.mjs --scenes v9-`
  ['entry-anatomy.tsx', 'AnatFullChest', 'v9-stage-chest'],
  ['entry-anatomy.tsx', 'AnatFullVessel', 'v9-stage-vessel'],
  ['entry-anatomy.tsx', 'AnatFullTissue', 'v9-stage-tissue'],
  ['entry-anatomy.tsx', 'AnatFullBelly', 'v9-stage-upper-belly'],
  ['entry-anatomy.tsx', 'AnatFullThroat', 'v9-stage-throat'],
  ['entry-anatomy.tsx', 'AnatFullSkull', 'v9-stage-skull'],
  ['entry-anatomy.tsx', 'AnatFullSkin', 'v9-stage-skin'],
  ['entry-anatomy.tsx', 'AnatFullRoom', 'v9-stage-room'],
];

const renderList = (all, dir, only) => {
  syncBrand();
  const out = path.join(ROOT, 'out', 'toons', dir);
  fs.mkdirSync(out, {recursive: true});
  const list = all.filter(([, , name]) => !only.length || only.some((o) => name.includes(o)));
  for (const [entry, id, name] of list) {
    remotion(['still', path.join('src', 'toons', 'v8', entry), id, path.join(out, `${name}.jpg`), '--log=error']);
    console.log(`${dir}/${name}.jpg`);
  }
  return list.length;
};

export const renderSheets = (only = []) => renderList(SHEETS, 'sheets-v8', only);
export const renderScenes = (only = []) => renderList(SCENES, 'scenes-v8', only);

if (isMain(import.meta.url)) {
  const a = args();
  // `--scenes c1` parses as {scenes: 'c1'}: take that word as a filter too
  const only = typeof a.scenes === 'string' ? [a.scenes, ...a._] : a._;
  const n = a.scenes ? renderScenes(only) : renderSheets(only);
  console.log(`${n} file${n === 1 ? '' : 's'} in out/toons/${a.scenes ? 'scenes-v8' : 'sheets-v8'}`);
}
