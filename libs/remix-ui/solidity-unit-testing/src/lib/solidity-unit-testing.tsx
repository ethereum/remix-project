import React, { useState } from 'react' // eslint-disable-line

import './css/style.css'

/* eslint-disable-next-line */
export interface SolidityUnitTestingProps {}

export const SolidityUnitTesting = (props: SolidityUnitTestingProps) => {
  console.log('props---->', props)
  return (
    <div className="px-2" id="testView">
        <div className="infoBox">
          <p className="text-lg"> Test your smart contract in Solidity.</p>
          <p> Select directory to load and generate test files.</p>
          <label>Test directory:</label>
          {/* <div>
            <div className="d-flex p-2">
              ${this.inputPath}
              ${this.createTestFolder}
              ${this.uiPathList}
            </div>
          </div> */}
        </div>
        {/* <div>          
          <div className="d-flex p-2">
           ${this.updateGenerateFileAction()}
           ${this.infoButton()}
          </div>
          <div className="d-flex p-2">
            ${this.updateRunAction()}
            ${this.updateStopAction()}
          </div>
          ${this.selectAll()}
          ${this.updateTestFileList()}
          <div className="align-items-start flex-column mt-2 mx-3 mb-0">
            ${this.resultStatistics}
            ${this.testsExecutionStopped}
            ${this.testsExecutionStoppedError}
          </div>
          ${this.testsOutput}
        </div> */}
      </div>
  )
}

export default SolidityUnitTesting
