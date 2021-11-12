import React, { useState } from 'react' // eslint-disable-line

import './css/style.css'

/* eslint-disable-next-line */
export interface SolidityUnitTestingProps {}

export const SolidityUnitTesting = (props: SolidityUnitTestingProps) => {

  const [defaultPath, setDefaultPath] = useState('tests')
  const [disableCreateButton, setDisableCreateButton] = useState(true)
  const [disableStopButton, setDisableStopButton] = useState(true)
  const [checkSelectAll, setCheckSelectAll] = useState(true)

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

  const updateGenerateFileAction = () => {
    console.log('updateGenerateFileAction')
    return (
      <button
        className="btn border w-50"
        data-id="testTabGenerateTestFile"
        title="Generate sample test file."
      >
        Generate
      </button>)
    // const el = yo`
    //   <button
    //     class="btn border w-50"
    //     data-id="testTabGenerateTestFile"
    //     title="Generate sample test file."
    //     onclick="${this.testTabLogic.generateTestFile.bind(this.testTabLogic)}"
    //   >
    //     Generate
    //   </button>
    // `
    // if (!this.generateFileActionElement) {
    //   this.generateFileActionElement = el
    // } else {
    //   yo.update(this.generateFileActionElement, el)
    // }
    // return this.generateFileActionElement
  }

  const updateRunAction = (currentFile = null) => {

    console.log('updateRunAction --currentFile-->', currentFile)

    return (
      <button id="runTestsTabRunAction" title="Run tests" data-id="testTabRunTestsTabRunAction" className="w-50 btn btn-primary">
        <span className="fas fa-play ml-2"></span>
         <label className="${css.labelOnBtn} btn btn-primary p-1 ml-2 m-0">Run</label>
      </button>)

    // const el = yo`
    //   <button id="runTestsTabRunAction" title="Run tests" data-id="testTabRunTestsTabRunAction" class="w-50 btn btn-primary" onclick="${() => this.runTests()}">
    //     <span class="fas fa-play ml-2"></span>
    //     <label class="${css.labelOnBtn} btn btn-primary p-1 ml-2 m-0">Run</label>
    //   </button>
    // `
    // const isSolidityActive = this.appManager.isActive('solidity')
    // if (!isSolidityActive || !this.listTests().length) {
    //   el.setAttribute('disabled', 'disabled')
    //   if (!currentFile || (currentFile && currentFile.split('.').pop().toLowerCase() !== 'sol')) {
    //     el.setAttribute('title', 'No solidity file selected')
    //   } else {
    //     el.setAttribute('title', 'The "Solidity Plugin" should be activated')
    //   }
    // }
    // if (!this.runActionElement) {
    //   this.runActionElement = el
    // } else {
    //   yo.update(this.runActionElement, el)
    // }
    // return this.runActionElement
  }

  const stopTests = () => {

    console.log('stopTests')
    // this.hasBeenStopped = true
    // const stopBtnLabel = document.getElementById('runTestsTabStopActionLabel')
    // stopBtnLabel.innerText = 'Stopping'
    // const stopBtn = document.getElementById('runTestsTabStopAction')
    // stopBtn.setAttribute('disabled', 'disabled')
    // const runBtn = document.getElementById('runTestsTabRunAction')
    // runBtn.setAttribute('disabled', 'disabled')
  }

  const checkAll = (event: any) => {
    console.log('checkAll --event-->', event)

    // const checkBoxes = this._view.el.querySelectorAll('.singleTest')
    // const checkboxesLabels = this._view.el.querySelectorAll('.singleTestLabel')
    // // checks/unchecks all
    // for (let i = 0; i < checkBoxes.length; i++) {
    //   checkBoxes[i].checked = event.target.checked
    //   this.toggleCheckbox(event.target.checked, checkboxesLabels[i].innerText)
    // }
  }

  const updateTestFileList = (tests = []) => {
    return (<div className="testList py-2 mt-0 border-bottom">No test file available</div>)
    // const testsMessage = (tests && tests.length ? this.listTests() : 'No test file available')
    // const el = yo`<div class="${css.testList} py-2 mt-0 border-bottom">${testsMessage}</div>`
    // if (!this.testFilesListElement) {
    //   this.testFilesListElement = el
    // } else {
    //   yo.update(this.testFilesListElement, el)
    // }
    // this.updateRunAction()
    // return this.testFilesListElement
  }

  const createResultLabel = () => {
    return (<span className='text-info h6'>Progress: none finished (of none)</span>)
    // if (!this.data.selectedTests) return yo`<span></span>`
    // const ready = this.readyTestsNumber ? `${this.readyTestsNumber}` : '0'
    // return yo`<span class='text-info h6'>Progress: ${ready} finished (of ${this.runningTestsNumber})</span>`
  }

  const [resultStatistics] = useState(createResultLabel())

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
            <datalist id="utPathList"></datalist>
            </div>
          </div>
        </div>
        <div>          
          <div className="d-flex p-2">
            {updateGenerateFileAction()}
            <a className="btn border text-decoration-none pr-0 d-flex w-50 ml-2" title="Check out documentation." target="__blank" href="https://remix-ide.readthedocs.io/en/latest/unittesting.html#test-directory">
              <label className="btn p-1 ml-2 m-0">How to use...</label>
            </a>
          </div>
          <div className="d-flex p-2">
            {updateRunAction()}
            <button id="runTestsTabStopAction" data-id="testTabRunTestsTabStopAction" className="w-50 pl-2 ml-2 btn btn-secondary" disabled={disableStopButton} title="Stop running tests" onClick={stopTests}>
              <span className="fas fa-stop ml-2"></span>
              <label className="labelOnBtn btn btn-secondary p-1 ml-2 m-0" id="runTestsTabStopActionLabel">Stop</label>
            </button>
          </div>
          <div className="d-flex align-items-center mx-3 pb-2 mt-2 border-bottom">
            <input id="checkAllTests"
              type="checkbox"
              data-id="testTabCheckAllTests"
              onClick={checkAll}
              checked={checkSelectAll}
              onChange={() => {}}
            />
            <label className="text-nowrap pl-2 mb-0" htmlFor="checkAllTests"> Select all </label>
          </div>
          {updateTestFileList()}
          <div className="align-items-start flex-column mt-2 mx-3 mb-0">
            {resultStatistics}
            {/* ${this.testsExecutionStopped}
            ${this.testsExecutionStoppedError} */}
          </div>
          {/* ${this.testsOutput} */}
        </div>
      </div>
  )
}

export default SolidityUnitTesting
