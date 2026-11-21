import React from 'react';
import {registerRoot, Still} from 'remotion';
import {OrgansA} from './organs-a';

registerRoot(() => <Still id="V8OrgansA" component={OrgansA} width={1920} height={1080} />);
