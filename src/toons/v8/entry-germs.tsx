import React from 'react';
import {registerRoot, Still} from 'remotion';
import {GermsBoard} from './germs';

registerRoot(() => <Still id="V8Germs" component={GermsBoard} width={1920} height={1080} />);
