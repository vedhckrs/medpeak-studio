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
