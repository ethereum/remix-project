import React, { useState, useRef, useEffect, CSSProperties } from 'react' // eslint-disable-line
// import { TestTabLogic } from './logic/testTabLogic'
var async = require('async')
import { canUseWorker, urlFromVersion } from '@remix-project/remix-solidity'
import { format } from 'util'

import './css/style.css'

/* eslint-disable-next-line */
export interface SolidityUnitTestingProps {}

interface TestObject {
  fileName: string
  checked: boolean
}

interface TestSummary {
  filename: string
  passed: number
  failed: number
  timeTaken: any
}

export const SolidityUnitTesting = (props: any) => {

  const {helper, testTab} = props

  const { testTabLogic } = testTab

  const [defaultPath, setDefaultPath] = useState('tests')
  const [disableCreateButton, setDisableCreateButton] = useState(true)
  const [disableGenerateButton, setDisableGenerateButton] = useState(false)
  const [disableStopButton, setDisableStopButton] = useState(true)
  const [disableRunButton, setDisableRunButton] = useState(false)
  const [runButtonTitle, setRunButtonTitle] = useState('Run tests')
  const [stopButtonLabel, setStopButtonLabel] = useState('Stop')

  const [checkSelectAll, setCheckSelectAll] = useState(true)
  const [testsOutput, setTestsOutput] = useState<Element[]>([])
  let [testsSummary, setTestsSummary] = useState<TestSummary>()
  const [testsSummaryHidden, setTestsSummaryHidden] = useState('hidden')
  
  const [testsExecutionStoppedHidden, setTestsExecutionStoppedHidden] = useState(true)
  const [testsExecutionStoppedErrorHidden, setTestsExecutionStoppedErrorHidden] = useState(true)
  

  let [testFiles, setTestFiles] = useState<TestObject[]>([])
  const [pathOptions, setPathOptions] = useState([''])
  // let [allTests, setAllTests] = useState([])
  let [selectedTests, setSelectedTests] = useState<string[]>([])
  
  const [inputPathValue, setInputPathValue] = useState('tests')

  let [readyTestsNumber, setReadyTestsNumber] = useState(0)
  let [runningTestsNumber, setRunningTestsNumber] = useState(0)
  let [hasBeenStopped, setHasBeenStopped] = useState(false)
  let [areTestsRunning, setAreTestsRunning] = useState(false)
  let [isDebugging, setIsDebugging] = useState(false)
  
  let allTests: any = []
  
  let testSuite: any
  let testSuites: any
  let runningTestFileName: any




  let [testsResultByFilename, setTestsResultByFilename] = useState<Record<string, any>>({})
  
  const trimTestDirInput = (input:string) => {
    if (input.includes('/')) return input.split('/').map(e => e.trim()).join('/')
    else return input.trim()
  }

  const clearResults = () => {
    console.log('clearResults--->')
    // yo.update(this.resultStatistics, yo`<span></span>`)
    testTab.call('editor', 'clearAnnotations')
    setTestsOutput([])
    setTestsExecutionStoppedHidden(true)
    setTestsExecutionStoppedErrorHidden(true)
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
    console.log('Inside updateForNewCurrent --allTests-->', allTests)
    allTests = []
    updateTestFileList()
    clearResults()
    // if (!areTestsRunning) updateRunAction(file)
    try {
      testTabLogic.getTests((error: any, tests: any) => {
        // if (error) return tooltip(error)
        console.log('tests in updateForNewCurrent testTabLogic.getTests', tests)
        allTests = tests
        selectedTests = [...allTests]
        setSelectedTests(tests)
        updateTestFileList()
        // if (!this.testsOutput) return // eslint-disable-line
      })
    } catch (e) {
      console.log('error in updateForNewCurrent', e)
    }
  }

  useEffect(() => {
    updateDirList('/')
    updateForNewCurrent()
  }, [])

  const updateDirList = (path: string) => {
    testTabLogic.dirList(path).then((options: any) => {
      setPathOptions(options)
    })
  }

  const handleTestDirInput = async (e: any) => {
    console.log('handleTestDirInput--e-->', e.target)

    let testDirInput = trimTestDirInput(e.target.value)
    console.log('handleTestDirInput--e-->', testDirInput)
    testDirInput = helper.removeMultipleSlashes(testDirInput)
    if (testDirInput !== '/') testDirInput = helper.removeTrailingSlashes(testDirInput)
    setInputPathValue(testDirInput)
    if (e.key === 'Enter') {
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
          testTabLogic.setCurrentPath(testDirInput)
          updateForNewCurrent()
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
    let inputPath = e.target.value
    inputPath = helper.removeMultipleSlashes(trimTestDirInput(inputPath))
    setInputPathValue(inputPath)
    if (disableCreateButton) {
      if (await testTabLogic.pathExists(inputPath)) {
        testTabLogic.setCurrentPath(inputPath)
        updateForNewCurrent()
      }
    }
  }

  const handleCreateFolder = () => {
    let inputPath = trimTestDirInput(inputPathValue)
    let path = helper.removeMultipleSlashes(inputPath)
    if (path !== '/') path = helper.removeTrailingSlashes(path)
    if (inputPath === '') inputPath = defaultPath
    setInputPathValue(path)
    testTabLogic.generateTestFolder(inputPath)
    setDisableCreateButton(true)
    setDisableGenerateButton(false)
    testTabLogic.setCurrentPath(inputPath)
    console.log('path-->', path)
    console.log('inputPath-->', inputPath)
    updateRunAction()
    updateForNewCurrent()
    pathOptions.push(inputPath)
    setPathOptions(pathOptions)
  }

  const cleanFileName = (fileName: any, testSuite: any) => {
    return fileName ? fileName.replace(/\//g, '_').replace(/\./g, '_') + testSuite : fileName
  }

  const startDebug = async (txHash: any, web3: any) => {
    // this.isDebugging = true
    if (!await testTab.appManager.isActive('debugger')) await testTab.appManager.activatePlugin('debugger')
    testTab.call('menuicons', 'select', 'debugger')
    testTab.call('debugger', 'debug', txHash, web3)
  }

  const printHHLogs = (logsArr: any, testName: any) => {
    let finalLogs = `<b>${testName}:</b>\n`
    for (const log of logsArr) {
      let formattedLog
      // Hardhat implements the same formatting options that can be found in Node.js' console.log,
      // which in turn uses util.format: https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_util_format_format_args
      // For example: console.log("Name: %s, Age: %d", remix, 6) will log 'Name: remix, Age: 6'
      // We check first arg to determine if 'util.format' is needed
      if (typeof log[0] === 'string' && (log[0].includes('%s') || log[0].includes('%d'))) {
        formattedLog = format(log[0], ...log.slice(1))
      } else {
        formattedLog = log.join(' ')
      }
      finalLogs = finalLogs + '&emsp;' + formattedLog + '\n'
    }
    // _paq.push(['trackEvent', 'solidityUnitTesting', 'hardhat', 'console.log'])
    testTab.call('terminal', 'log', { type: 'info', value: finalLogs })
  }

  const discardHighlight = async () => {
    await testTab.call('editor', 'discardHighlight')
  }

  const highlightLocation = async (location: any, runningTests: any, fileName: any) => {
    if (location) {
      var split = location.split(':')
      var file = split[2]
      location = {
        start: parseInt(split[0]),
        length: parseInt(split[1])
      }
      location = testTab.offsetToLineColumnConverter.offsetToLineColumnWithContent(
        location,
        parseInt(file),
        runningTests[fileName].content
      )
      await testTab.call('editor', 'discardHighlight')
      await testTab.call('editor', 'highlight', location, fileName, '', { focus: true })
    }
  }

  const showTestsResult = () => {
    setTestsOutput([])
    let filenames = Object.keys(testsResultByFilename)
    for(const filename of filenames) {
      const fileTestsResult = testsResultByFilename[filename]
      const contracts = Object.keys(fileTestsResult)
      for(const contract of contracts) {
        if(contract && contract !== 'summary') {
          runningTestFileName = cleanFileName(filename, contract)
          // show contract and file name
          const ContractCard: any = (
            <div id={runningTestFileName} data-id="testTabSolidityUnitTestsOutputheader" className="pt-1">
              <span className="font-weight-bold">{contract} ({filename})</span>
            </div>
          )
          setTestsOutput(prevCards => ([...prevCards, ContractCard]))
          // show tests
          const tests = fileTestsResult[contract]
          if (tests?.length) {
            for(const test of tests) {
              if (test.type === 'testPass') {
                if (test.hhLogs && test.hhLogs.length) printHHLogs(test.hhLogs, test.value)
                const testPassCard: any = (
                  <div
                    id={runningTestFileName}
                    data-id="testTabSolidityUnitTestsOutputheader"
                    className="testPass testLog bg-light mb-2 px-2 text-success border-0"
                    onClick={() => discardHighlight()}
                  >
                    <div className="d-flex my-1 align-items-start justify-content-between">
                      <span > ✓ {test.value}</span>
                        {/* {debugBtn} */}
                      </div>
                  </div>
                )
                setTestsOutput(prevCards => ([...prevCards, testPassCard]))
              }
            }
          }
        }
      }
      // show testsSummary
    }
  //   let debugBtn
  //   if ((result.type === 'testPass' || result.type === 'testFailure') && result.debugTxHash) {
  //     const { web3, debugTxHash } = result
  //     debugBtn = (
  //     <div id={result.value.replaceAll(' ', '_')} className="btn border btn btn-sm ml-1" style={{ cursor: 'pointer' }} title="Start debugging" onClick={() => startDebug(debugTxHash, web3)}>
  //       <i className="fas fa-bug"></i>
  //     </div>
  //     )
  //   }
  //   if (result.type === 'contract') {
  //     var testSuite = result.value
  //     if (testSuites) {
  //       testSuites.push(testSuite)
  //     } else {
  //       testSuites = [testSuite]
  //     }
  //     runningTestFileName = cleanFileName(result.filename, testSuite)
  //     const ContractCard: any = (
  //       <div id={runningTestFileName} data-id="testTabSolidityUnitTestsOutputheader" className="pt-1">
  //         <span className="font-weight-bold">{testSuite} ({result.filename})</span>
  //       </div>
  //     )
  //     setTestsOutput(prevCards => ([...prevCards, ContractCard]))
  //   } else if (result.type === 'testPass') {
  //     if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
  //     const testPassCard: any = (
  //       <div
  //         id={runningTestFileName}
  //         data-id="testTabSolidityUnitTestsOutputheader"
  //         className="testPass testLog bg-light mb-2 px-2 text-success border-0"
  //         onClick={() => discardHighlight()}
  //       >
  //         <div className="d-flex my-1 align-items-start justify-content-between">
  //           <span > ✓ {result.value}</span>
  //            {debugBtn}
  //          </div>
  //       </div>
  //     )
  //     setTestsOutput(prevCards => ([...prevCards, testPassCard]))
  //   } else if (result.type === 'testFailure') {
  //     if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
  //     if (!result.assertMethod) {
  //       const testFailCard1: any = (<div
  //         className="bg-light mb-2 px-2 testLog d-flex flex-column text-danger border-0"
  //         id={"UTContext" + result.context}
  //         onClick={() => highlightLocation(result.location, runningTests, result.filename)}
  //       >
  //         <div className="d-flex my-1 align-items-start justify-content-between">
  //           <span> ✘ {result.value}</span>
  //           {debugBtn}
  //         </div>
  //         <span className="text-dark">Error Message:</span>
  //         <span className="pb-2 text-break">"{result.errMsg}"</span>
  //       </div>)
  //       setTestsOutput(prevCards => ([...prevCards, testFailCard1]))
  //     } else {
  //       const preposition = result.assertMethod === 'equal' || result.assertMethod === 'notEqual' ? 'to' : ''
  //       const method = result.assertMethod === 'ok' ? '' : result.assertMethod
  //       const expected = result.assertMethod === 'ok' ? '\'true\'' : result.expected
  //       const testFailCard2: any = (<div
  //         className="bg-light mb-2 px-2 testLog d-flex flex-column text-danger border-0"
  //         id="UTContext${result.context}"
  //         onClick={() => highlightLocation(result.location, runningTests, result.filename)}
  //       >
  //         <div className="d-flex my-1 align-items-start justify-content-between">  
  //           <span> ✘ {result.value}</span>
  //           {debugBtn}
  //         </div> 
  //         <span className="text-dark">Error Message:</span>
  //         <span className="pb-2 text-break">"{result.errMsg}"</span>
  //         <span className="text-dark">Assertion:</span>
  //         <div className="d-flex flex-wrap">
  //           <span>Expected value should be</span>
  //           <div className="mx-1 font-weight-bold">{method}</div>
  //           <div>{preposition} {expected}</div>
  //         </div>
  //         <span className="text-dark">Received value:</span>
  //         <span>{result.returned}</span>
  //         <span className="text-dark text-sm pb-2">Skipping the remaining tests of the function.</span>
  //       </div>)
  //       setTestsOutput(prevCards => ([...prevCards, testFailCard2]))
  //     }
  //   } else if (result.type === 'logOnly') {
  //     if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
  //   }
  }

  // const testCallback = (result: any, runningTests: any) => {
  //   console.log('result--------------in testCallback->', result)
  //   console.log('testsResultByFilename--------============------in testCallback->', testsResultByFilename)
  //   if(result.filename) {
  //     if(!testsResultByFilename[result.filename]) {
  //       testsResultByFilename[result.filename] = {}
  //       testsResultByFilename[result.filename][contract]['tests'] = []
  //       testsResultByFilename[result.filename]['summary'] = {}
  //     }
  //     testsResultByFilename[result.filename]['tests'].push(result)
  //   }
  // }

  const testCallback = (result: any, runningTests: any) => {
    console.log('result--------------in testCallback->', result)
    console.log('testsResultByFilename--------============------in testCallback->', testsResultByFilename)
    if(result.filename) {
      if(!testsResultByFilename[result.filename]) {
        testsResultByFilename[result.filename] = {}
        testsResultByFilename[result.filename]['summary'] = {}
      }
      if(result.type === 'contract') {
        testsResultByFilename[result.filename][result.value] = []
      } else 
        testsResultByFilename[result.filename][result.context].push(result)
      showTestsResult()
    }
    // let debugBtn
    // if ((result.type === 'testPass' || result.type === 'testFailure') && result.debugTxHash) {
    //   const { web3, debugTxHash } = result
    //   debugBtn = (
    //   <div id={result.value.replaceAll(' ', '_')} className="btn border btn btn-sm ml-1" style={{ cursor: 'pointer' }} title="Start debugging" onClick={() => startDebug(debugTxHash, web3)}>
    //     <i className="fas fa-bug"></i>
    //   </div>
    //   )
    // }
    // if (result.type === 'contract') {
    //   var testSuite = result.value
    //   if (testSuites) {
    //     testSuites.push(testSuite)
    //   } else {
    //     testSuites = [testSuite]
    //   }
    //   runningTestFileName = cleanFileName(result.filename, testSuite)
    //   const ContractCard: any = (
    //     <div id={runningTestFileName} data-id="testTabSolidityUnitTestsOutputheader" className="pt-1">
    //       <span className="font-weight-bold">{testSuite} ({result.filename})</span>
    //     </div>
    //   )
    //   setTestsOutput(prevCards => ([...prevCards, ContractCard]))
    // } else if (result.type === 'testPass') {
    //   if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
    //   const testPassCard: any = (
    //     <div
    //       id={runningTestFileName}
    //       data-id="testTabSolidityUnitTestsOutputheader"
    //       className="testPass testLog bg-light mb-2 px-2 text-success border-0"
    //       onClick={() => discardHighlight()}
    //     >
    //       <div className="d-flex my-1 align-items-start justify-content-between">
    //         <span > ✓ {result.value}</span>
    //          {debugBtn}
    //        </div>
    //     </div>
    //   )
    //   setTestsOutput(prevCards => ([...prevCards, testPassCard]))
    // } else if (result.type === 'testFailure') {
    //   if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
    //   if (!result.assertMethod) {
    //     const testFailCard1: any = (<div
    //       className="bg-light mb-2 px-2 testLog d-flex flex-column text-danger border-0"
    //       id={"UTContext" + result.context}
    //       onClick={() => highlightLocation(result.location, runningTests, result.filename)}
    //     >
    //       <div className="d-flex my-1 align-items-start justify-content-between">
    //         <span> ✘ {result.value}</span>
    //         {debugBtn}
    //       </div>
    //       <span className="text-dark">Error Message:</span>
    //       <span className="pb-2 text-break">"{result.errMsg}"</span>
    //     </div>)
    //     setTestsOutput(prevCards => ([...prevCards, testFailCard1]))
    //   } else {
    //     const preposition = result.assertMethod === 'equal' || result.assertMethod === 'notEqual' ? 'to' : ''
    //     const method = result.assertMethod === 'ok' ? '' : result.assertMethod
    //     const expected = result.assertMethod === 'ok' ? '\'true\'' : result.expected
    //     const testFailCard2: any = (<div
    //       className="bg-light mb-2 px-2 testLog d-flex flex-column text-danger border-0"
    //       id="UTContext${result.context}"
    //       onClick={() => highlightLocation(result.location, runningTests, result.filename)}
    //     >
    //       <div className="d-flex my-1 align-items-start justify-content-between">  
    //         <span> ✘ {result.value}</span>
    //         {debugBtn}
    //       </div> 
    //       <span className="text-dark">Error Message:</span>
    //       <span className="pb-2 text-break">"{result.errMsg}"</span>
    //       <span className="text-dark">Assertion:</span>
    //       <div className="d-flex flex-wrap">
    //         <span>Expected value should be</span>
    //         <div className="mx-1 font-weight-bold">{method}</div>
    //         <div>{preposition} {expected}</div>
    //       </div>
    //       <span className="text-dark">Received value:</span>
    //       <span>{result.returned}</span>
    //       <span className="text-dark text-sm pb-2">Skipping the remaining tests of the function.</span>
    //     </div>)
    //     setTestsOutput(prevCards => ([...prevCards, testFailCard2]))
    //   }
    // } else if (result.type === 'logOnly') {
    //   if (result.hhLogs && result.hhLogs.length) printHHLogs(result.hhLogs, result.value)
    // }
  }

  const resultsCallback = (_err: any, result: any, cb: any) => {
    // total stats for the test
    // result.passingNum
    // result.failureNum
    // result.timePassed
    cb()
  }

  const updateFinalResult = (_errors: any, result: any, filename: any) => {
    console.log('result---------------------------in updateFinalResult->', result, filename)
    console.log('testsResultByFilename---------------------------in updateFinalResult->', testsResultByFilename)
    ++readyTestsNumber
    setTestsSummaryHidden('visible')
    // if (!result && (_errors && (_errors.errors || (Array.isArray(_errors) && (_errors[0].message || _errors[0].formattedMessage))))) {
    //   this.testCallback({ type: 'contract', filename })
    //   this.currentErrors = _errors.errors
    //   this.setHeader(false)
    // }
    // if (_errors && _errors.errors) {
    //   _errors.errors.forEach((err) => this.renderer.error(err.formattedMessage || err.message, this.testsOutput, { type: err.severity, errorType: err.type }))
    // } else if (_errors && Array.isArray(_errors) && (_errors[0].message || _errors[0].formattedMessage)) {
    //   _errors.forEach((err) => this.renderer.error(err.formattedMessage || err.message, this.testsOutput, { type: err.severity, errorType: err.type }))
    // } else if (_errors && !_errors.errors && !Array.isArray(_errors)) {
    //   // To track error like this: https://github.com/ethereum/remix/pull/1438
    //   this.renderer.error(_errors.formattedMessage || _errors.message, this.testsOutput, { type: 'error' })
    // }
    // yo.update(this.resultStatistics, this.createResultLabel())
    if (result) {
      const totalTime = parseFloat(result.totalTime).toFixed(2)
      testsSummary = { filename, passed: result.totalPassing, failed: result.totalFailing, timeTaken: totalTime }
      testsResultByFilename[filename]['summary']= testsSummary
      // setTestsSummary(testsSummary)
      }
      // fix for displaying right label for multiple tests (testsuites) in a single file
      // this.testSuites.forEach(testSuite => {
      //   this.testSuite = testSuite
      //   this.runningTestFileName = this.cleanFileName(filename, this.testSuite)
      //   this.outputHeader = document.querySelector(`#${this.runningTestFileName}`)
      //   this.setHeader(true)
      // })

      // result.errors.forEach((error, index) => {
      //   this.testSuite = error.context
      //   this.runningTestFileName = this.cleanFileName(filename, error.context)
      //   this.outputHeader = document.querySelector(`#${this.runningTestFileName}`)
      //   const isFailingLabel = document.querySelector(`.failed_${this.runningTestFileName}`)
      //   if (!isFailingLabel) this.setHeader(false)
      // })
      // this.testsOutput.appendChild(yo`
      //   <div>
      //     <p class="text-info mb-2 border-top m-0"></p>
      //   </div>
      // `)
    // }
    // if (this.hasBeenStopped && (this.readyTestsNumber !== this.runningTestsNumber)) {
    //   // if all tests has been through before stopping no need to print this.
    //   this.testsExecutionStopped.hidden = false
    // }
    // if (_errors) this.testsExecutionStoppedError.hidden = false
    // if (_errors || this.hasBeenStopped || this.readyTestsNumber === this.runningTestsNumber) {
    //   // All tests are ready or the operation has been canceled or there was a compilation error in one of the test files.
    //   const stopBtn = document.getElementById('runTestsTabStopAction')
    //   stopBtn.setAttribute('disabled', 'disabled')
    //   const stopBtnLabel = document.getElementById('runTestsTabStopActionLabel')
    //   stopBtnLabel.innerText = 'Stop'
    //   if (this.data.selectedTests.length !== 0) {
    //     const runBtn = document.getElementById('runTestsTabRunAction')
    //     runBtn.removeAttribute('disabled')
    //   }
    //   this.areTestsRunning = false
    // }
  }

  const runTest = (testFilePath: any, callback: any) => {
    console.log('runTest----->', testFilePath, hasBeenStopped)
    isDebugging = false
    if (hasBeenStopped) {
      // this.updateFinalResult()
      return
    }
    // this.resultStatistics.hidden = false
    testTab.fileManager.readFile(testFilePath).then((content: any) => {
      const runningTests: any = {}
      runningTests[testFilePath] = { content }
      const { currentVersion, evmVersion, optimize, runs, isUrl } = testTab.compileTab.getCurrentCompilerConfig()
      const currentCompilerUrl = isUrl ? currentVersion : urlFromVersion(currentVersion)
      const compilerConfig = {
        currentCompilerUrl,
        evmVersion,
        optimize,
        usingWorker: canUseWorker(currentVersion),
        runs
      }
      const deployCb = async (file: any, contractAddress: any) => {
        const compilerData = await testTab.call('compilerArtefacts', 'getCompilerAbstract', file)
        await testTab.call('compilerArtefacts', 'addResolvedContract', contractAddress, compilerData)
      }
      testTab.testRunner.runTestSources(
        runningTests,
        compilerConfig,
        (result: any) => testCallback(result, runningTests),
        (_err: any, result: any, cb: any) => resultsCallback(_err, result, cb),
        deployCb,
        (error: any, result: any) => {
          updateFinalResult(error, result, testFilePath)
          callback(error)
        }, (url: any, cb: any) => {
          return testTab.contentImport.resolveAndSave(url).then((result: any) => cb(null, result)).catch((error: any) => cb(error.message))
        }, { testFilePath }
      )
    }).catch((error: any) => {
      console.log('Error in runTest---->', error)
      if (error) return // eslint-disable-line
    })
  }

  const runTests = () => {
    console.log('runtests--->')
    areTestsRunning = true
    hasBeenStopped = false
    readyTestsNumber = 0
    runningTestsNumber = selectedTests.length
    setDisableStopButton(false)
    // setDisableRunButton(true)
    clearResults()
    // yo.update(this.resultStatistics, this.createResultLabel())
    const tests = selectedTests
    console.log('tests--in runTests----------------->', tests)
    if (!tests) return
    // this.resultStatistics.hidden = tests.length === 0
    // _paq.push(['trackEvent', 'solidityUnitTesting', 'runTests'])
    async.eachOfSeries(tests, (value: any, key: any, callback: any) => {
      if (hasBeenStopped) return
      runTest(value, callback)
    })
  }

  const updateRunAction = (currentFile : any = null) => {
    console.log('updateRunAction --currentFile-->', currentFile)
    const isSolidityActive = testTab.appManager.isActive('solidity')
    if (!isSolidityActive || !selectedTests?.length) {
      setDisableRunButton(true)
      if (!currentFile || (currentFile && currentFile.split('.').pop().toLowerCase() !== 'sol')) {
        setRunButtonTitle('No solidity file selected')
      } else {
        setRunButtonTitle('The "Solidity Plugin" should be activated')
      }
    }
  }

  const stopTests = () => {
    console.log('stopTests')
    setHasBeenStopped(true)
    setStopButtonLabel('Stopping')
    setDisableStopButton(true)
    setDisableRunButton(true)
  }

  const getCurrentSelectedTests = () => {
    let selectedTestsList: TestObject[] = testFiles.filter(testFileObj => testFileObj.checked)
    return selectedTestsList.map(testFileObj => testFileObj.fileName)
  }

  const toggleCheckbox = (eChecked: any, index:any) => {
    testFiles[index].checked = eChecked
    setTestFiles(testFiles)
    selectedTests = getCurrentSelectedTests()
    console.log('selectedTests----->', selectedTests)
    setSelectedTests(selectedTests)
    if (eChecked) {
      setCheckSelectAll(true)
      setDisableRunButton(false)
      if ((readyTestsNumber === runningTestsNumber || hasBeenStopped) && stopButtonLabel.trim() === 'Stop') {
        setRunButtonTitle('Run tests')
      }
    } else if (!selectedTests.length) {
      setCheckSelectAll(false)
      setDisableRunButton(true)
      setRunButtonTitle('No test file selected')
    } else setCheckSelectAll(false)
  }

  const checkAll = (event: any) => {
    testFiles.forEach((testFileObj) =>  testFileObj.checked = event.target.checked)
    setTestFiles(testFiles)
    setCheckSelectAll(event.target.checked)
    if(event.target.checked) {
      selectedTests = getCurrentSelectedTests()
      setSelectedTests(selectedTests)
      setDisableRunButton(false)
    } else {
      setSelectedTests([])
      setDisableRunButton(true)
    }
  }

  const updateTestFileList = () => {
    console.log('updateTestFileList--tests->', allTests)
    if(allTests?.length) {
      testFiles =  allTests.map((testFile: any) => { return {'fileName': testFile, 'checked': true }})
      setCheckSelectAll(true)
    }
    else 
      testFiles = []
    setTestFiles(testFiles)
  }

  const createResultLabel = () => {
    return (<span className='text-info h6'>Progress: none finished (of none)</span>)
    // if (!this.data.selectedTests) return yo`<span></span>`
    // const ready = this.readyTestsNumber ? `${this.readyTestsNumber}` : '0'
    // return yo`<span class='text-info h6'>Progress: ${ready} finished (of ${this.runningTestsNumber})</span>`
  }

  const [resultStatistics] = useState(createResultLabel())

  return (
    <div className="px-2" id="testView">
        <div className="infoBox">
          <p className="text-lg"> Test your smart contract in Solidity.</p>
          <p> Select directory to load and generate test files.</p>
          <label>Test directory:</label>
          <div>
            <div className="d-flex p-2">
            <datalist id="utPathList">{
              pathOptions.map(function (path) {
                return <option key={path}>{path}</option>
              })
              }
            </datalist>
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
              onClick={() => {
                testTabLogic.generateTestFile()
                updateForNewCurrent()
              }}
            >
              Generate
            </button>
            <a className="btn border text-decoration-none pr-0 d-flex w-50 ml-2" title="Check out documentation." target="__blank" href="https://remix-ide.readthedocs.io/en/latest/unittesting.html#test-directory">
              <label className="btn p-1 ml-2 m-0">How to use...</label>
            </a>
          </div>
          <div className="d-flex p-2">
            <button id="runTestsTabRunAction" title={runButtonTitle} data-id="testTabRunTestsTabRunAction" className="w-50 btn btn-primary" disabled={disableRunButton} onClick={runTests}>
              <span className="fas fa-play ml-2"></span>
              <label className="labelOnBtn btn btn-primary p-1 ml-2 m-0">Run</label>
            </button>
            <button id="runTestsTabStopAction" data-id="testTabRunTestsTabStopAction" className="w-50 pl-2 ml-2 btn btn-secondary" disabled={disableStopButton} title="Stop running tests" onClick={stopTests}>
              <span className="fas fa-stop ml-2"></span>
              <label className="labelOnBtn btn btn-secondary p-1 ml-2 m-0" id="runTestsTabStopActionLabel">{stopButtonLabel}</label>
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
          <div className="testList py-2 mt-0 border-bottom">{testFiles?.length ? testFiles.map((testFileObj: any, index) => {
            console.log('testFileObj----->', testFileObj)
            const elemId = `singleTest${testFileObj.fileName}`
            return (
              <div className="d-flex align-items-center py-1">
                <input className="singleTest" id={elemId} onChange={(e) => toggleCheckbox(e.target.checked, index)} type="checkbox" checked={testFileObj.checked}/>
                <label className="singleTestLabel text-nowrap pl-2 mb-0" htmlFor={elemId}>{testFileObj.fileName}</label>
              </div>
            )
          }) 
          : "No test file available" } </div>
          <div className="align-items-start flex-column mt-2 mx-3 mb-0">
            {resultStatistics}
            <label className="text-warning h6" data-id="testTabTestsExecutionStopped" hidden={testsExecutionStoppedHidden}>The test execution has been stopped</label>
            <label className="text-danger h6" data-id="testTabTestsExecutionStoppedError" hidden={testsExecutionStoppedErrorHidden}>The test execution has been stopped because of error(s) in your test file</label>
          </div>
          <div>{testsOutput}</div>
          {/* <div className="d-flex alert-secondary mb-3 p-3 flex-column" style= {{visibility: testsSummaryHidden} as CSSProperties }>
            <span className="font-weight-bold">{testsSummary && testsSummary.filename ? `Result for ${testsSummary.filename}` : ''}</span>
            <span className="text-success">{testsSummary && testsSummary.passed >= 0 ? `Passed: ${testsSummary.passed}` : ''}</span>
            <span className="text-danger">{testsSummary && testsSummary.failed >= 0 ? `Failed: ${testsSummary.failed}` : ''}</span>
            <span>{testsSummary && testsSummary.timeTaken ? `Time Taken: ${testsSummary.timeTaken}` : ''}</span>
          </div> */}
        </div>
      </div>
  )
}

export default SolidityUnitTesting
