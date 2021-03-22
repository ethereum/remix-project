import React from 'react';
import * as staticAnalysisRunner from '@remix-project/remix-analyzer';
import remixLib from '@remix-project/remix-lib';
import Renderer from '../../../../../apps/remix-ide/src/app/ui/renderer';
import SourceHighlighter from '../../../../../apps/remix-ide/src/app/editor/sourceHighlighter';

import EventManager from '../../../../../apps/remix-ide/src/lib/events';

import './css/static-analyser.css';

const utils = remixLib.util;
/* eslint-disable-next-line */
export interface RemixUiStaticAnalyserProps {}
//const StaticAnalysisRunner = staticAnalysisRunner.CodeAnalysis();

export const RemixUiStaticAnalyser = (props: RemixUiStaticAnalyserProps) => {
  return (
    <div>
      <h1>Welcome to remix-ui-static-analyser!</h1>
    </div>
  );
};

export default RemixUiStaticAnalyser;
