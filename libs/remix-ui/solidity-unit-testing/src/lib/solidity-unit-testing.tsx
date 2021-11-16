import React, { useState, useEffect } from 'react' // eslint-disable-line

import './css/style.css'

/* eslint-disable-next-line */
export interface SolidityUnitTestingProps {}

export const SolidityUnitTesting = (props: any) => {

  const {helper, testTab, testTabLogic} = props

  const [defaultPath, setDefaultPath] = useState('tests')
  const [disableCreateButton, setDisableCreateButton] = useState(true)
  const [disableGenerateButton, setDisableGenerateButton] = useState(false)
  const [disableStopButton, setDisableStopButton] = useState(true)
  const [checkSelectAll, setCheckSelectAll] = useState(true)
  const [testsExecutionStoppedHidden, setTestsExecutionStoppedHidden] = useState(true)
  const [testsExecutionStoppedErrorHidden, setTestsExecutionStoppedErrorHidden] = useState(true)
  const [pathOptions, setPathOptions] = useState([])
  
  const [inputPathValue, setInputPathValue] = useState('')
  
  const trimTestDirInput = (input:string) => {
    if (input.includes('/')) return input.split('/').map(e => e.trim()).join('/')
    else return input.trim()
  }

   const updateForNewCurrent = async (file = null) => {
    // Ensure that when someone clicks on compilation error and that opens a new file
    // Test result, which is compilation error in this case, is not cleared
    // if (this.currentErrors) {
    //   if (Array.isArray(this.currentErrors) && this.currentErrors.length > 0) {
    //     const errFiles = this.currentErrors.map(err => { if (err.sourceLocation && err.sourceLocation.file) return err.sourceLocation.file })
    //     if (errFiles.includes(file)) return
    //   } else if (this.currentErrors.sourceLocation && this.currentErrors.sourceLocation.file && this.currentErrors.sourceLocation.file === file) return
    // }
    // // if current file is changed while debugging and one of the files imported in test file are opened
    // // do not clear the test results in SUT plugin
    // if (this.isDebugging && this.allFilesInvolved.includes(file)) return
    // this.data.allTests = []
    // this.updateTestFileList()
    // this.clearResults()
    // this.updateGenerateFileAction()
    // if (!this.areTestsRunning) this.updateRunAction(file)
    // try {
    //   await this.testTabLogic.getTests((error, tests) => {
    //     if (error) return tooltip(error)
    //     this.data.allTests = tests
    //     this.data.selectedTests = [...this.data.allTests]
    //     this.updateTestFileList(tests)
    //     if (!this.testsOutput) return // eslint-disable-line
    //   })
    // } catch (e) {
    //   console.log(e)
    // }
  }

  const updateDirList = (path: string) => {
    testTabLogic.dirList(path).then((options: any) => {
      setPathOptions(options)
    })
  }

  const handleTestDirInput = async (e: any) => {
    console.log('handleTestDirInput--e-->', e)

    let testDirInput = trimTestDirInput(inputPathValue)
    testDirInput = helper.removeMultipleSlashes(testDirInput)
    if (testDirInput !== '/') testDirInput = helper.removeTrailingSlashes(testDirInput)
    if (e.key === 'Enter') {
      setInputPathValue(testDirInput)
      if (await testTabLogic.pathExists(testDirInput)) {
        testTabLogic.setCurrentPath(testDirInput)
        updateForNewCurrent()
        return
      }
    }

    if (testDirInput) {
      if (testDirInput.endsWith('/') && testDirInput !== '/') {
        testDirInput = helper.removeTrailingSlashes(testDirInput)
        if (testTabLogic.currentPath === testDirInput.substr(0, testDirInput.length - 1)) {
          setDisableCreateButton(true)
          setDisableGenerateButton(true)
        }
        updateDirList(testDirInput)
      } else {
        // If there is no matching folder in the workspace with entered text, enable Create button
        if (await testTabLogic.pathExists(testDirInput)) {
          setDisableCreateButton(true)
          setDisableGenerateButton(false)
        } else {
          // Enable Create button
          setDisableCreateButton(false)
          // Disable Generate button because dir does not exist
          setDisableGenerateButton(true)
        }
      }
    } else {
      updateDirList('/')
    }
  }

  const handleEnter = async(e:any) => {
    console.log('handleEnter --e-->', e)

    // this.inputPath.value = removeMultipleSlashes(this.trimTestDirInput(this.inputPath.value))
    // if (this.createTestFolder.disabled) {
    //   if (await this.testTabLogic.pathExists(this.inputPath.value)) {
    //     this.testTabLogic.setCurrentPath(this.inputPath.value)
    //     this.updateForNewCurrent()
    //   }
    // }
  }

  const handleCreateFolder = () => {

    console.log('handleCreateFolder')
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

  // const updateGenerateFileAction = () => {
  //   console.log('updateGenerateFileAction')
  //   return (
  //     <button
  //       className="btn border w-50"
  //       data-id="testTabGenerateTestFile"
  //       title="Generate sample test file."
  //     >
  //       Generate
  //     </button>)
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
  // }

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
              value={inputPathValue}
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
            <datalist id="utPathList">{
              pathOptions.map(function (path) {
                return <option key={path} >{path}</option>
              })
              }
            </datalist>
            </div>
          </div>
        </div>
        <div>          
          <div className="d-flex p-2">
            <button
              className="btn border w-50"
              data-id="testTabGenerateTestFile"
              title="Generate sample test file."
              disabled={disableGenerateButton}
              onClick={testTabLogic.generateTestFile}
            >
              Generate
            </button>
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
            <label className="text-warning h6" data-id="testTabTestsExecutionStopped" hidden={testsExecutionStoppedHidden}>The test execution has been stopped</label>
            <label className="text-danger h6" data-id="testTabTestsExecutionStoppedError" hidden={testsExecutionStoppedErrorHidden}>The test execution has been stopped because of error(s) in your test file</label>
          </div>
          {/* ${this.testsOutput} */}
        </div>
      </div>
  )
}

export default SolidityUnitTesting
