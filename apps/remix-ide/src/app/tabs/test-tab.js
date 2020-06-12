var yo = require('yo-yo')
var async = require('async')
var tooltip = require('../ui/tooltip')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')
import { ViewPlugin } from '@remixproject/engine'
import { canUseWorker, urlFromVersion } from '../compiler/compiler-utils'

const TestTabLogic = require('./testTab/testTab')

const profile = {
  name: 'solidityUnitTesting',
  displayName: 'Solidity unit testing',
  methods: ['testFromPath', 'testFromSource'],
  events: [],
  icon: 'assets/img/unitTesting.webp',
  description: 'Fast tool to generate unit tests for your contracts',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/unittesting.html'
}

module.exports = class TestTab extends ViewPlugin {
  constructor (fileManager, filePanel, compileTab, appManager, renderer) {
    super(profile)
    this.compileTab = compileTab
    this._view = { el: null }
    this.fileManager = fileManager
    this.filePanel = filePanel
    this.data = {}
    this.appManager = appManager
    this.renderer = renderer
    this.hasBeenStopped = false
    this.runningTestsNumber = 0
    this.readyTestsNumber = 0
    this.areTestsRunning = false
    appManager.event.on('activate', (name) => {
      if (name === 'solidity') this.updateRunAction(fileManager.currentFile())
    })
    appManager.event.on('deactivate', (name) => {
      if (name === 'solidity') this.updateRunAction(fileManager.currentFile())
    })
  }

  onActivationInternal () {
    this.testTabLogic = new TestTabLogic(this.fileManager)
    this.listenToEvents()
  }

  listenToEvents () {
    this.filePanel.event.register('newTestFileCreated', file => {
      var testList = this.view.querySelector("[class^='testList']")
      var test = this.createSingleTest(file)
      testList.appendChild(test)
      this.data.allTests.push(file)
      this.data.selectedTests.push(file)
    })

    this.fileManager.events.on('noFileSelected', () => {
      this.updateGenerateFileAction()
      this.updateRunAction()
      this.updateTestFileList()
    })

    this.fileManager.events.on('currentFileChanged', (file, provider) => this.updateForNewCurrent(file))
  }

  updateForNewCurrent (file) {
    this.updateGenerateFileAction(file)
    if (!this.areTestsRunning) this.updateRunAction(file)
    this.testTabLogic.getTests((error, tests) => {
      if (error) return tooltip(error)
      this.data.allTests = tests
      this.data.selectedTests = [...this.data.allTests]
      this.updateTestFileList(tests)
      if (!this.testsOutput) return
    })
  }

  createSingleTest (testFile) {
    return yo`
      <div class="d-flex align-items-center py-1">
        <input class="singleTest" id="singleTest${testFile}" onchange=${(e) => this.toggleCheckbox(e.target.checked, testFile)} type="checkbox" checked="true">
        <label class="singleTestLabel text-nowrap pl-2 mb-0" for="singleTest${testFile}">${testFile}</label>
      </div>
    `
  }

  listTests () {
    return this.data.allTests.map(
      testFile => this.createSingleTest(testFile)
    )
  }

  toggleCheckbox (eChecked, test) {
    if (!this.data.selectedTests) {
      this.data.selectedTests = this._view.el.querySelectorAll('.singleTest:checked')
    }
    let selectedTests = this.data.selectedTests
    selectedTests = eChecked ? [...selectedTests, test] : selectedTests.filter(el => el !== test)
    this.data.selectedTests = selectedTests
    let checkAll = this._view.el.querySelector('[id="checkAllTests"]')
    const runBtn = document.getElementById('runTestsTabRunAction')

    if (eChecked) {
      checkAll.checked = true
      if ((this.readyTestsNumber === this.runningTestsNumber || this.hasBeenStopped) && document.getElementById('runTestsTabStopAction').innerText === 'Stop') {
        runBtn.removeAttribute('disabled')
        runBtn.setAttribute('title', 'Run tests')
      }
    } else if (!selectedTests.length) {
      checkAll.checked = false
      runBtn.setAttribute('disabled', 'disabled')
      runBtn.setAttribute('title', 'No test file selected')
    }
  }

  checkAll (event) {
    const checkBoxes = this._view.el.querySelectorAll('.singleTest')
    const checkboxesLabels = this._view.el.querySelectorAll('.singleTestLabel')
    // checks/unchecks all
    for (let i = 0; i < checkBoxes.length; i++) {
      checkBoxes[i].checked = event.target.checked
      this.toggleCheckbox(event.target.checked, checkboxesLabels[i].innerText)
    }
  }

  testCallback (result) {
    this.testsOutput.hidden = false
    if (result.type === 'contract') {
      this.testSuite = result.value
      if (this.testSuites) {
        this.testSuites.push(this.testSuite)
      } else {
        this.testSuites = [this.testSuite]
      }
      this.rawFileName = result.filename
      this.runningTestFileName = this.cleanFileName(this.rawFileName, this.testSuite)
      this.outputHeader = yo`
        <div id="${this.runningTestFileName}" data-id="testTabSolidityUnitTestsOutputheader" class="pt-1">
          <span class="font-weight-bold">${this.testSuite} (${this.rawFileName})</span>
        </div>
      `
      this.testsOutput.appendChild(this.outputHeader)
    } else if (result.type === 'testPass') {
      this.testsOutput.appendChild(yo`
        <div id="${this.runningTestFileName}" data-id="testTabSolidityUnitTestsOutputheader" class="${css.testPass} ${css.testLog} text-success border-0">
          ✓ ${result.value}
        </div>
      `)
    } else if (result.type === 'testFailure') {
      this.testsOutput.appendChild(yo`
        <div class="${css.testFailure} ${css.testLog} d-flex flex-column text-danger border-0" id="UTContext${result.context}">
          <span> ✘ ${result.value}</span>
          <span>"${result.errMsg}"</span>
        </div>
      `)
    }
  }

  resultsCallback (_err, result, cb) {
    // total stats for the test
    // result.passingNum
    // result.failureNum
    // result.timePassed
    cb()
  }

  cleanFileName (fileName, testSuite) {
    return fileName ? fileName.replace(/\//g, '_').replace(/\./g, '_') + testSuite : fileName
  }

  setHeader (status) {
    if (status) {
      const label = yo`
        <div
          class="alert-success d-inline-block mb-1 mr-1 p-1 passed_${this.runningTestFileName}"
          title="All contract tests passed"
        >
          PASS
        </div>
      `

      this.outputHeader && yo.update(this.outputHeader, yo`
        <div id="${this.runningTestFileName}" data-id="testTabSolidityUnitTestsOutputheader" class="pt-1">
          ${label} <span class="font-weight-bold">${this.testSuite} (${this.rawFileName})</span>
        </div>
      `)
    } else {
      const label = yo`
        <div
          class="alert-danger d-inline-block mb-1 mr-1 p-1 failed_${this.runningTestFileName}"
          title="At least one contract test failed"
        >
          FAIL
        </div>
      `

      this.outputHeader && yo.update(this.outputHeader, yo`
        <div id="${this.runningTestFileName}"  data-id="testTabSolidityUnitTestsOutputheader" class="pt-1">
          ${label} <span class="font-weight-bold">${this.testSuite} (${this.rawFileName})</span>
        </div>
      `)
    }
  }

  updateFinalResult (_errors, result, filename) {
    ++this.readyTestsNumber
    this.testsOutput.hidden = false
    if (!result && (_errors || _errors.errors || Array.isArray(_errors) && (_errors[0].message || _errors[0].formattedMessage))) {
      this.testCallback({ type: 'contract', filename })
      this.setHeader(false)
    }
    if (_errors && _errors.errors) {
      _errors.errors.forEach((err) => this.renderer.error(err.formattedMessage || err.message, this.testsOutput, {type: err.severity}))
    } else if (_errors && Array.isArray(_errors) && (_errors[0].message || _errors[0].formattedMessage)) {
      _errors.forEach((err) => this.renderer.error(err.formattedMessage || err.message, this.testsOutput, {type: err.severity}))
    } else if (_errors && !_errors.errors && !Array.isArray(_errors)) {
      // To track error like this: https://github.com/ethereum/remix/pull/1438
      this.renderer.error(_errors.formattedMessage || _errors.message, this.testsOutput, {type: 'error'})
    }
    yo.update(this.resultStatistics, this.createResultLabel())
    if (result) {
      const totalTime = parseFloat(result.totalTime).toFixed(2)

      if (result.totalPassing > 0 && result.totalFailing > 0) {
        this.testsOutput.appendChild(yo`
          <div class="d-flex alert-secondary mb-3 p-3 flex-column">
            <span class="font-weight-bold">Result for ${filename}</span>
            <span class="text-success">Passing: ${result.totalPassing}</span>
            <span class="text-danger">Failing: ${result.totalFailing}</span>
            <span>Total time: ${totalTime}s</span>
          </div>
        `)
      } else if (result.totalPassing > 0 && result.totalFailing <= 0) {
        this.testsOutput.appendChild(yo`
          <div class="d-flex alert-secondary mb-3 p-3 flex-column">
            <span class="font-weight-bold">Result for ${filename}</span>
            <span class="text-success">Passing: ${result.totalPassing}</span>
            <span>Total time: ${totalTime}s</span>
          </div>
        `)
      } else if (result.totalPassing <= 0 && result.totalFailing > 0) {
        this.testsOutput.appendChild(yo`
          <div class="d-flex alert-secondary mb-3 p-3 flex-column">
            <span class="font-weight-bold">Result for ${filename}</span>
            <span class="text-danger">Failing: ${result.totalFailing}</span>
            <span>Total time: ${totalTime}s</span>
          </div>
        `)
      }
      // fix for displaying right label for multiple tests (testsuites) in a single file
      this.testSuites.forEach(testSuite => {
        this.testSuite = testSuite
        this.runningTestFileName = this.cleanFileName(filename, this.testSuite)
        this.outputHeader = document.querySelector(`#${this.runningTestFileName}`)
        this.setHeader(true)
      })

      result.errors.forEach((error, index) => {
        this.testSuite = error.context
        this.runningTestFileName = this.cleanFileName(filename, error.context)
        this.outputHeader = document.querySelector(`#${this.runningTestFileName}`)
        const isFailingLabel = document.querySelector(`.failed_${this.runningTestFileName}`)
        if (!isFailingLabel) this.setHeader(false)
      })
      this.testsOutput.appendChild(yo`
        <div>
          <p class="text-info mb-2 border-top m-0"></p>
        </div>
      `)
    }
    if (this.hasBeenStopped && (this.readyTestsNumber !== this.runningTestsNumber)) {
      // if all tests has been through before stopping no need to print this.
      this.testsExecutionStopped.hidden = false
    }
    if (_errors) this.testsExecutionStoppedError.hidden = false
    if (_errors || this.hasBeenStopped || this.readyTestsNumber === this.runningTestsNumber) {
      // All tests are ready or the operation has been canceled or there was a compilation error in one of the test files.
      const stopBtn = document.getElementById('runTestsTabStopAction')
      stopBtn.setAttribute('disabled', 'disabled')
      const stopBtnLabel = document.getElementById('runTestsTabStopActionLabel')
      stopBtnLabel.innerText = 'Stop'
      if (this.data.selectedTests.length !== 0) {
        const runBtn = document.getElemenstById('runTestsTabRunAction')
        runBtn.removeAttribute('disabled')
      }
      this.areTestsRunning = false
    }
  }

  async testFromPath (path) {
    const fileContent = await this.fileManager.readFile(path)
    return this.testFromSource(fileContent, path)
  }

  /*
    Test is not associated with the UI
  */
  testFromSource (content, path = 'browser/unit_test.sol') {
    return new Promise((resolve, reject) => {
      let runningTest = {}
      runningTest[path] = { content }
      const {currentVersion, evmVersion, optimize} = this.compileTab.getCurrentCompilerConfig()
      const currentCompilerUrl = urlFromVersion(currentVersion)
      const compilerConfig = {
        currentCompilerUrl,
        evmVersion,
        optimize,
        usingWorker: canUseWorker(currentVersion)
      }
      remixTests.runTestSources(runningTest, compilerConfig, () => {}, () => {}, (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }, (url, cb) => {
        return this.compileTab.compileTabLogic.importFileCb(url, cb)
      })
    })
  }

  runTest (testFilePath, callback) {
    if (this.hasBeenStopped) {
      this.updateFinalResult()
      return
    }
    this.resultStatistics.hidden = false
    this.fileManager.readFile(testFilePath).then((content) => {
      const runningTest = {}
      runningTest[testFilePath] = { content }
      const {currentVersion, evmVersion, optimize} = this.compileTab.getCurrentCompilerConfig()
      const currentCompilerUrl = urlFromVersion(currentVersion)
      const compilerConfig = {
        currentCompilerUrl,
        evmVersion,
        optimize,
        usingWorker: canUseWorker(currentVersion)
      }
      remixTests.runTestSources(
        runningTest,
        compilerConfig,
        (result) => this.testCallback(result),
        (_err, result, cb) => this.resultsCallback(_err, result, cb),
        (error, result) => {
          this.updateFinalResult(error, result, testFilePath)
          callback(error)
        }, (url, cb) => {
          return this.compileTab.compileTabLogic.importFileCb(url, cb)
        }
      )
    }).catch((error) => {
      if (error) return
    })
  }

  updateCurrentPath(e) {
    this.testTabLogic.setCurrentPath(e.target.value)
    // todo check if path exists if not create one.
  }

  runTests () {
    this.areTestsRunning = true
    this.hasBeenStopped = false
    this.readyTestsNumber = 0
    this.runningTestsNumber = this.data.selectedTests.length
    yo.update(this.resultStatistics, this.createResultLabel())
    const stopBtn = document.getElementById('runTestsTabStopAction')
    stopBtn.removeAttribute('disabled')
    const runBtn = document.getElementById('runTestsTabRunAction')
    runBtn.setAttribute('disabled', 'disabled')
    this.call('editor', 'clearAnnotations')
    this.testsOutput.innerHTML = ''
    this.testsOutput.hidden = true
    this.testsExecutionStopped.hidden = true
    this.testsExecutionStoppedError.hidden = true
    const tests = this.data.selectedTests
    if (!tests) return
    this.resultStatistics.hidden = tests.length === 0
    async.eachOfSeries(tests, (value, key, callback) => {
      if (this.hasBeenStopped) return
      this.runTest(value, callback)
    })
  }

  stopTests () {
    this.hasBeenStopped = true
    const stopBtnLabel = document.getElementById('runTestsTabStopActionLabel')
    stopBtnLabel.innerText = 'Stopping'
    const stopBtn = document.getElementById('runTestsTabStopAction')
    stopBtn.setAttribute('disabled', 'disabled')
    const runBtn = document.getElementById('runTestsTabRunAction')
    runBtn.setAttribute('disabled', 'disabled')
  }

  updateGenerateFileAction (currentFile) {
    let el = yo`
      <button
        class="btn border w-50"
        data-id="testTabGenerateTestFile"
        title="Generate sample test file."
        onclick="${this.testTabLogic.generateTestFile.bind(this.testTabLogic)}"
      >
        Generate
      </button>
    `
    if (
      !currentFile ||
      (currentFile && currentFile.split('.').pop().toLowerCase() !== 'sol')
    ) {
      //el.setAttribute('disabled', 'disabled')
      //el.setAttribute('title', 'No solidity file selected')
    }
    if (!this.generateFileActionElement) {
      this.generateFileActionElement = el
    } else {
      yo.update(this.generateFileActionElement, el)
    }
    return this.generateFileActionElement
  }

  updateRunAction (currentFile) {
    let el = yo`
      <button id="runTestsTabRunAction" title="Run tests" data-id="testTabRunTestsTabRunAction" class="w-50 btn btn-primary"  onclick="${() => this.runTests()}">
        <span class="fas fa-play ml-2"></span>
        <label class="${css.labelOnBtn} btn btn-primary p-1 ml-2 m-0">Run</label>
      </button>
    `
    const isSolidityActive = this.appManager.actives.includes('solidity')
    if (!currentFile || !isSolidityActive || (currentFile && currentFile.split('.').pop().toLowerCase() !== 'sol')) {
      el.setAttribute('disabled', 'disabled')
      if (!currentFile || (currentFile && currentFile.split('.').pop().toLowerCase() !== 'sol')) {
        el.setAttribute('title', 'No solidity file selected')
      } else {
        el.setAttribute('title', 'The "Solidity Plugin" should be activated')
        // @todo(#2747)  we can activate the plugin here
      }
    }
    if (!this.runActionElement) {
      this.runActionElement = el
    } else {
      yo.update(this.runActionElement, el)
    }
    return this.runActionElement
  }

  updateStopAction () {
    return yo`
      <button id="runTestsTabStopAction" data-id="testTabRunTestsTabStopAction" class="w-50 pl-2 ml-2 btn btn-secondary" disabled="disabled" title="Stop running tests" onclick=${() => this.stopTests()}">
        <span class="fas fa-stop ml-2"></span>
        <label class="${css.labelOnBtn} btn btn-secondary p-1 ml-2 m-0" id="runTestsTabStopActionLabel">Stop</label>
      </button>
    `
  }

  updateTestFileList (tests) {
    const testsMessage = (tests && tests.length ? this.listTests() : 'No test file available')
    let el = yo`<div class="${css.testList} py-2 mt-0 border-bottom">${testsMessage}</div>`
    if (!this.testFilesListElement) {
      this.testFilesListElement = el
    } else {
      yo.update(this.testFilesListElement, el)
    }
    return this.testFilesListElement
  }

  selectAll () {
    return yo`
      <div class="d-flex align-items-center mx-3 pb-2 mt-2 border-bottom">
        <input id="checkAllTests"
          type="checkbox"
          data-id="testTabCheckAllTests"
          onclick="${(event) => { this.checkAll(event) }}"
          checked="true"
        >
        <label class="text-nowrap pl-2 mb-0" for="checkAllTests"> Select all </label>
      </div>
    `
  }

  infoButton () {
    return yo`
      <a class="btn border text-decoration-none pr-0 d-flex w-50 ml-2" title="Check out documentation." target="__blank" href="https://remix-ide.readthedocs.io/en/latest/unittesting.html#generate-test-file">
        <label class="btn p-1 ml-2 m-0">How to use...</label>
      </a>
    `
  }

  createResultLabel () {
    if (!this.data.selectedTests) return yo`<span></span>`
    const ready = this.readyTestsNumber ? `${this.readyTestsNumber}` : '0'
    return yo`<span class='text-info h6'>Progress: ${ready} finished (of ${this.runningTestsNumber})</span>`
  }

  render () {
    this.onActivationInternal()
    this.testsOutput = yo`<div class="mx-3 mb-2 pb-4 border-top border-primary" hidden='true' id="solidityUnittestsOutput" data-id="testTabSolidityUnitTestsOutput"></a>`
    this.testsExecutionStopped = yo`<label class="text-warning h6" data-id="testTabTestsExecutionStopped">The test execution has been stopped</label>`
    this.testsExecutionStoppedError = yo`<label class="text-danger h6" data-id="testTabTestsExecutionStoppedError">The test execution has been stopped because of error(s) in your test file</label>`
    this.uiPathList = yo`<datalist id="utPathList"></datalist>`
    const availablePaths = yo`
      <div>
        <input
          placeholder="browser/tests"
          list="utPathList"
          class="custom-select"
          id="utPath"
          name="utPath"
          onchange=${(e)=>this.updateCurrentPath(e)}/>
          ${this.uiPathList}
      </div>
    `
    let options = ['browser', 'browser/ll/test']
    options.forEach((path) => {
      this.uiPathList.appendChild(yo`<option>${path}</option>`)
    })

    this.testsExecutionStopped.hidden = true
    this.testsExecutionStoppedError.hidden = true
    this.resultStatistics = this.createResultLabel()
    this.resultStatistics.hidden = true
    const el = yo`
      <div class="${css.testTabView} px-2" id="testView">
        <div class="${css.infoBox}">
          <p class="text-lg"> Test your smart contract in Solidity.</p>
          <p> Click on "Generate" to generate a sample test file in.</p>
          ${availablePaths}
        </div>
        <div class="${css.tests}">          
          <div class="d-flex p-2">
           ${this.updateGenerateFileAction()}
           ${this.infoButton()}
          </div>
          <div class="d-flex p-2">
            ${this.updateRunAction()}
            ${this.updateStopAction()}
          </div>
          ${this.selectAll()}
          ${this.updateTestFileList()}
          <div class="align-items-start flex-column mt-2 mx-3 mb-0">
            ${this.resultStatistics}
            ${this.testsExecutionStopped}
            ${this.testsExecutionStoppedError}
          </div>
          ${this.testsOutput}
        </div>
      </div>
    `
    this._view.el = el
    this.updateForNewCurrent(this.fileManager.currentFile())
    return el
  }

}
