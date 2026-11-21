import React from 'react';
import {registerRoot, Still} from 'remotion';
import {PropsClinic, PropsHome} from './props';

registerRoot(() => (
  <>
    <Still id="V8PropsClinic" component={PropsClinic} width={1920} height={1080} />
    <Still id="V8PropsHome" component={PropsHome} width={1920} height={1080} />
  </>
));
