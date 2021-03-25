import React, { useEffect, useState } from 'react';

import { staticAnalysisRunner } from '@remix-ui/static-analyser';
import CheckBox from './Checkbox/StaticAnalyserCheckedBox';
import Button from './Button/StaticAnalyserButton';

export interface RemixUiStaticAnalyserProps {
  renderStaticAnalysis: any;
}

export const RemixUiStaticAnalyser = (props: RemixUiStaticAnalyserProps) => {
  const staticAnalysisViewRender = () => (
    <div>
      {' '}
      <div className="my-2 d-flex flex-column align-items-left">
        <div className="${``} d-flex justify-content-between">
          <div className="${``}">
            <CheckBox
              id="checkAllEntries"
              inputType="checkbox"
              onClick={() => {}}
              checked={true}
              label="Select all"
            />
          </div>
          <div className="${``}">
            <CheckBox
              id="autorunstaticanalysis"
              inputType="checkbox"
              onClick={() => {}}
              checked={true}
              label="Autorun"
            />
          </div>
          <Button buttonText="Run" onClick={() => {}} />
        </div>
      </div>
      <div id="staticanalysismodules" className="list-group list-group-flush">
        ${``}//this.modulesView
      </div>
      <div className="mt-2 p-2 d-flex border-top flex-column">
        <span>last results for:</span>
        <span
          className="text-break break-word word-break font-weight-bold"
          id="staticAnalysisCurrentFile"
        >
          $
          {`` //this.currentFile
          }
        </span>
      </div>
      <div className="${``} my-1" id="staticanalysisresult"></div>
    </div>
  );

  return <div>{staticAnalysisViewRender()}</div>;
};

export default RemixUiStaticAnalyser;
