import React, { useState } from 'react' // eslint-disable-line

import './css/style.css'

/* eslint-disable-next-line */
export interface SolidityUnitTestingProps {}

export const SolidityUnitTesting = (props: SolidityUnitTestingProps) => {

  const [defaultPath, setDefaultPath] = useState('tests')
  const [disableCreateButton, setDisableCreateButton] = useState(true)

  const handleTestDirInput = async (e:any) => {
    console.log('handleTestDirInput--e-->', e)

  //   let testDirInput = this.trimTestDirInput(this.inputPath.value)
  //   testDirInput = removeMultipleSlashes(testDirInput)
  //   if (testDirInput !== '/') testDirInput = removeTrailingSlashes(testDirInput)
  //   if (e.key === 'Enter') {
  //     this.inputPath.value = testDirInput
  //     if (await this.testTabLogic.pathExists(testDirInput)) {
  //       this.testTabLogic.setCurrentPath(testDirInput)
  //       this.updateForNewCurrent()
  //       return
  //     }
  //   }

  //   if (testDirInput) {
  //     if (testDirInput.endsWith('/') && testDirInput !== '/') {
  //       testDirInput = removeTrailingSlashes(testDirInput)
  //       if (this.testTabLogic.currentPath === testDirInput.substr(0, testDirInput.length - 1)) {
  //         this.createTestFolder.disabled = true
  //         this.updateGenerateFileAction().disabled = true
  //       }
  //       this.updateDirList(testDirInput)
  //     } else {
  //       // If there is no matching folder in the workspace with entered text, enable Create button
  //       if (await this.testTabLogic.pathExists(testDirInput)) {
  //         this.createTestFolder.disabled = true
  //         this.updateGenerateFileAction().disabled = false
  //       } else {
  //         // Enable Create button
  //         this.createTestFolder.disabled = false
  //         // Disable Generate button because dir does not exist
  //         this.updateGenerateFileAction().disabled = true
  //       }
  //     }
  //   } else {
  //     this.updateDirList('/')
  //   }
  }

  const handleEnter = async(e:any) => {
    console.log('handleTestDirInput --e-->', e)

    // this.inputPath.value = removeMultipleSlashes(this.trimTestDirInput(this.inputPath.value))
    // if (this.createTestFolder.disabled) {
    //   if (await this.testTabLogic.pathExists(this.inputPath.value)) {
    //     this.testTabLogic.setCurrentPath(this.inputPath.value)
    //     this.updateForNewCurrent()
    //   }
    // }
  }

  const handleCreateFolder = () => {

    console.log('handleTestDirInput')
    // this.inputPath.value = this.trimTestDirInput(this.inputPath.value)
    // let path = removeMultipleSlashes(this.inputPath.value)
    // if (path !== '/') path = removeTrailingSlashes(path)
    // if (this.inputPath.value === '') this.inputPath.value = this.defaultPath
    // this.inputPath.value = path
    // this.testTabLogic.generateTestFolder(this.inputPath.value)
    // this.createTestFolder.disabled = true
    // this.updateGenerateFileAction().disabled = false
    // this.testTabLogic.setCurrentPath(this.inputPath.value)
    // this.updateRunAction()
    // this.updateForNewCurrent()
    // this.uiPathList.appendChild(yo`<option>${this.inputPath.value}</option>`)
  }

  console.log('props---->', props)
  return (
    <div className="px-2" id="testView">
        <div className="infoBox">
          <p className="text-lg"> Test your smart contract in Solidity.</p>
          <p> Select directory to load and generate test files.</p>
          <label>Test directory:</label>
          <div>
            <div className="d-flex p-2">
            <input
              placeholder={defaultPath}
              list="utPathList"
              className="inputFolder custom-select"
              id="utPath"
              data-id="uiPathInput"
              name="utPath"
              title="Press 'Enter' to change the path for test files."
              style= {{ backgroundImage: "var(--primary)"}}
              onKeyUp= {handleTestDirInput}
              onChange={handleEnter}
            />
            <button
              className="btn border ml-2"
              data-id="testTabGenerateTestFolder"
              title="Create a test folder"
              disabled={disableCreateButton}
              onClick={handleCreateFolder}
            >
              Create
            </button>
              {/* ${this.uiPathList} */}
            </div>
          </div>
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
