import React from 'react';
import {registerRoot, Still} from 'remotion';
import {EyeMoodCheck, OrgansB} from './organs-b';

registerRoot(() => (
  <>
    <Still id="V8OrgansB" component={OrgansB} width={1920} height={1080} />
    <Still id="V8OrgansBEyeCheck" component={EyeMoodCheck} width={1920} height={400} />
  </>
));
