#!/usr/bin/env node
/**
 * Renders the look v8 approval sheets (code-drawn cast and props, 1920 x 1080 JPG) into
 * out/toons/sheets-v8/. Each sheet has its own entry file in src/toons/v8/, so one sheet's mistake
 * never breaks another's render. Works on macOS and Windows.
 *
 *   node pipeline/toon-v8-sheets.mjs            all sheets
 *   node pipeline/toon-v8-sheets.mjs cells      only the sheets whose name contains "cells"
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, isMain, remotion, ROOT} from './lib/util.mjs';

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
];

export const renderSheets = (only = []) => {
  const out = path.join(ROOT, 'out', 'toons', 'sheets-v8');
  fs.mkdirSync(out, {recursive: true});
  const list = SHEETS.filter(([, , name]) => !only.length || only.some((o) => name.includes(o)));
  for (const [entry, id, name] of list) {
    remotion(['still', path.join('src', 'toons', 'v8', entry), id, path.join(out, `${name}.jpg`), '--log=error']);
    console.log(`sheet ${name}.jpg`);
  }
  return list.length;
};

if (isMain(import.meta.url)) {
  const n = renderSheets(args()._);
  console.log(`${n} sheet${n === 1 ? '' : 's'} in out/toons/sheets-v8`);
}
