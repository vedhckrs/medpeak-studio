import React from 'react';
import {registerRoot, Still} from 'remotion';
import {
  V9CastCells, V9CastCells2, V9CastGerms, V9CastGerms2, V9CastOrgansA, V9CastOrgansA2, V9CastOrgansB, V9CastOrgansB2, V9CastPeople,
  V9EyesSheet, V9HandsSheet, V9PeopleFaces, V9Stubble,
} from './sheets-v9';
import {V9CaptionSheet, V9CrewSheet, V9EndCardSheet, V9PropSheet, V9RoomSheet, V9WatermarkSheet, V9CoverSheet} from './sheets-v9b';

const S: [string, React.FC][] = [
  ['V9Eyes', V9EyesSheet], ['V9Hands', V9HandsSheet], ['V9PeopleFaces', V9PeopleFaces], ['V9Stubble', V9Stubble],
  ['V9CastOrgansA', V9CastOrgansA], ['V9CastOrgansA2', V9CastOrgansA2], ['V9CastOrgansB', V9CastOrgansB], ['V9CastOrgansB2', V9CastOrgansB2],
  ['V9CastCells', V9CastCells], ['V9CastCells2', V9CastCells2], ['V9CastGerms', V9CastGerms], ['V9CastGerms2', V9CastGerms2], ['V9CastPeople', V9CastPeople],
  ['V9Crew', V9CrewSheet], ['V9Prop', V9PropSheet], ['V9Room', V9RoomSheet], ['V9EndCard', V9EndCardSheet], ['V9Watermark', V9WatermarkSheet],
  ['V9Caption', V9CaptionSheet], ['V9Cover', V9CoverSheet],
];

registerRoot(() => <>{S.map(([id, C]) => <Still key={id} id={id} component={C} width={1920} height={1080} />)}</>);
