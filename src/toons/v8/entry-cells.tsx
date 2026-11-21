import React from 'react';
import {registerRoot, Still} from 'remotion';
import {CellsBoard} from './cells';

registerRoot(() => <Still id="V8Cells" component={CellsBoard} width={1920} height={1080} />);
