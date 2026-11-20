import React from 'react';
import {registerRoot, Still} from 'remotion';
import {AnimalsBoard} from './animals';

registerRoot(() => <Still id="V8Animals" component={AnimalsBoard} width={1920} height={1080} />);
