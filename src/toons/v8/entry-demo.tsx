import React from 'react';
import {registerRoot, Still} from 'remotion';
import {KitDemo} from './demo';

registerRoot(() => <Still id="V8Kit" component={KitDemo} width={1920} height={1080} />);
