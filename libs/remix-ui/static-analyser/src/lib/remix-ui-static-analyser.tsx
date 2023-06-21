/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useReducer, useRef, Fragment } from 'react' // eslint-disable-line
import Button from './Button/StaticAnalyserButton' // eslint-disable-line
import { util } from '@remix-project/remix-lib'
import _ from 'lodash'
import * as semver from 'semver'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { RemixUiCheckbox } from '@remix-ui/checkbox' // eslint-disable-line
import ErrorRenderer from './ErrorRenderer' // eslint-disable-line
import { compilation } from './actions/staticAnalysisActions'
import { initialState, analysisReducer } from './reducers/staticAnalysisReducer'
import { CodeAnalysis } from '@remix-project/remix-analyzer'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { AnalysisTab, SolHintReport } from '../staticanalyser'
import { run } from './actions/staticAnalysisActions'
import { BasicTitle, calculateWarningStateEntries } from './components/BasicTitle'
import { BasicTabBody } from './components/BasicTabBody'

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []  //eslint-disable-line

/* eslint-disable-next-line */
export interface RemixUiStaticAnalyserProps {
  registry: any,
  event: any,
  analysisModule: AnalysisTab
}

export const RemixUiStaticAnalyser = (props: RemixUiStaticAnalyserProps) => {
  const [runner] = useState(new CodeAnalysis())

  const preProcessModules = (arr: any) => {
    return arr.map((Item, i) => {
      const itemObj = new Item()
      itemObj._index = i
      itemObj.categoryDisplayName = itemObj.category.displayName
      itemObj.categoryId = itemObj.category.id
      return itemObj
    })
  }

  const groupedModules = util.groupBy(
    preProcessModules(runner.modules()),
    'categoryId'
  )

  const getIndex = (modules, array) => {
    Object.values(modules).map((value: {_index}) => {
      if (Array.isArray(value)) {
        value.forEach((x) => {
          array.push(x._index.toString())
        })
      } else {
        array.push(value._index.toString())
      }
    })
  }

  const groupedModuleIndex = (modules) => {
    const indexOfCategory = []
    if (!_.isEmpty(modules)) {
      getIndex(modules, indexOfCategory)
    }
    return indexOfCategory
  }
  const [basicEnabled, setBasicEnabled] = useState(true)
  const [solhintEnabled, setSolhintEnabled] = useState(true) // assuming that solhint is always enabled
  const [showSlither, setShowSlither] = useState(false)
  const [slitherEnabled, setSlitherEnabled] = useState(false)
  const [startAnalysis, setStartAnalysis] = useState(false)
  const [isSupportedVersion, setIsSupportedVersion] = useState(false)
  const [showLibsWarning, setShowLibsWarning] = useState(false) // eslint-disable-line prefer-const
  const [categoryIndex, setCategoryIndex] = useState(groupedModuleIndex(groupedModules))
  const [warningState, setWarningState] = useState({})
  const [hideWarnings, setHideWarnings] = useState(false)
  const [hints, setHints] = useState<SolHintReport[]>([])
  const [slitherWarnings, setSlitherWarnings] = useState([])
  const [ssaWarnings, setSsaWarnings] = useState([])
  const [tabKey, setTabKey] = useState('basic')

  const warningContainer = useRef(null)
  const allWarnings = useRef({})
  const [state, dispatch] = useReducer(analysisReducer, initialState)
  const [runButtonTitle, setRunButtonTitle] = useState<string>(`Run analysis`)

  /**
   * Disable static analysis for contracts whose compiler version is
   * less than 0.4.12
   * @param version {string} - Solidity compiler version
   */
  const setDisableForRun = (version: string) => {
    const truncateVersion = (version: string) => {
      const tmp: RegExpExecArray | null = /^(\d+.\d+.\d+)/.exec(version)
      return tmp ? tmp[1] : version
    }
    if (version && version != '' && !semver.gt(truncateVersion(version), '0.4.12')) {
      setIsSupportedVersion(false)
      setRunButtonTitle('Select Solidity compiler version greater than 0.4.12.')
    } else {
      setIsSupportedVersion(true)
      setRunButtonTitle(`${state && state.data && state.file.length > 0 ? 'Run analysis': 'To run analysis tools, first compile a contract.'}`)
    }
  }

  useEffect(() => {
    setWarningState({})
    allWarnings.current = {}
    setHints([])
    setSlitherWarnings([])
    setSsaWarnings([])
    compilation(props.analysisModule, dispatch)
  }, [props])

  useEffect(() => {
    allWarnings.current = {}
    setWarningState({})
    setHints([])
    setSlitherWarnings([])
    setSsaWarnings([])
    const runAnalysis = async () => {
      await run(state.data, state.source, state.file, state, props, isSupportedVersion, showSlither, categoryIndex, groupedModules, runner,_paq, message, showWarnings, allWarnings, warningContainer,calculateWarningStateEntries, warningState, setHints, hints, setSlitherWarnings, setSsaWarnings, slitherEnabled, setStartAnalysis)
    }
    props.event.trigger('staticAnaysisWarning', [])
    return () => { }
  }, [state])

  useEffect(() => {
    props.analysisModule.call('solidity', 'getCompilerState').then((compilerState) => setDisableForRun(compilerState.currentVersion))
  }, [])

  useEffect(() => {
    const checkRemixdActive = async () => {
      const remixdActive = await props.analysisModule.call('manager', 'isActive', 'remixd')
      if (remixdActive) {
        setSlitherEnabled(true)
        setShowSlither(true)
      }
    }
    checkRemixdActive()
  }, [props])

  useEffect(() => {
    props.analysisModule.on('filePanel', 'setWorkspace', (currentWorkspace) => {
      // Reset warning state
      allWarnings.current = {}
      setWarningState({})
      // Reset badge
      props.event.trigger('staticAnaysisWarning', [])
      // Reset state
      dispatch({ type: '', payload: initialState })
      setHints([])
      setSlitherWarnings([])
      setSsaWarnings([])
      // Show 'Enable Slither Analysis' checkbox
      if (currentWorkspace && currentWorkspace.isLocalhost === true) {
        setShowSlither(true)
        setSlitherEnabled(true)
      }
      else {
        setShowSlither(false)
        setSlitherEnabled(false)
      }
    })
    props.analysisModule.on('manager', 'pluginDeactivated', (plugin) => {
      // Hide 'Enable Slither Analysis' checkbox
      if (plugin.name === 'remixd') {
        // Reset warning state
        setWarningState({})
        setHints([])
        setSlitherWarnings([])
        setSlitherEnabled(false)
        setSsaWarnings([])
        // Reset badge
        props.event.trigger('staticAnaysisWarning', [])
        // Reset state
        dispatch({ type: '', payload: initialState })
        setShowSlither(false)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props.analysisModule.on('solidity', 'compilerLoaded', async (version: string, license: string) => {
      setDisableForRun(version)
    })
    return () => { }
  }, [props])

  const message = (name: string, warning: any, more?: string, fileName?: string, locationString?: string) : string => {
    return (`
      <span className='d-flex flex-column'>
      <span className='h6 font-weight-bold'>${name}</span>
      ${warning}
      ${more
        ? (<span><a href={more} target='_blank'>more</a></span>)
        : (<span> </span>)
      }
      <span className="" title={Position in ${fileName}}>Pos: ${locationString}</span>
      </span>`
    )
  }

  const filterWarnings = () => {
    let newWarningState = {}
    let newWarningCount = 0
    if (showLibsWarning) {
      for (const category in allWarnings.current)
        newWarningCount = newWarningCount + allWarnings.current[category].length
      newWarningState = allWarnings.current
    }
    else {
      for (const category in allWarnings.current) {
        const warnings = allWarnings.current[category]
        newWarningState[category] = []
        for (const warning of warnings) {
          if (!warning.options.isLibrary) {
            newWarningCount++
            newWarningState[category].push(warning)
          }
        }
      }
    }
    if (newWarningCount > 0 && state.data && state.source !== null) {
      props.event.trigger('staticAnaysisWarning', [newWarningCount])
      setWarningState(newWarningState)
    }
  }

  useEffect(() => {
    if(hints.length > 0) {
      props.event.trigger('staticAnaysisWarning', [hints.length])
    }
  },[hints.length, state])

  const showWarnings = (warningMessage, groupByKey) => {
    const resultArray = []
    warningMessage.map(x => {
      resultArray.push(x)
    })
    function groupBy (objectArray, property) {
      return objectArray.reduce((acc, obj) => {
        const key = obj[property]
        if (!acc[key]) {
          acc[key] = []
        }
        // Add object to list for given key's value
        acc[key].push(obj)
        return acc
      }, {})
    }

    const groupedCategory = groupBy(resultArray, groupByKey)
    allWarnings.current = groupedCategory
    filterWarnings()
  }


  const handleCheckAllModules = (groupedModules) => {
    const index = groupedModuleIndex(groupedModules)
    if (index.every(el => categoryIndex.includes(el))) {
      setCategoryIndex(
        categoryIndex.filter((el) => {
          return !index.includes(el)
        })
      )
    } else {
      setCategoryIndex(_.uniq([...categoryIndex, ...index]))
    }
  }

  const handleCheckOrUncheckCategory = (category) => {
    const index = groupedModuleIndex(category)
    if (index.every(el => categoryIndex.includes(el))) {
      setCategoryIndex(
        categoryIndex.filter((el) => {
          return !index.includes(el)
        })
      )
    } else {
      setCategoryIndex(_.uniq([...categoryIndex, ...index]))
    }
  }

  const handleSlitherEnabled = async () => {
    const checkRemixd = await props.analysisModule.call('manager', 'isActive', 'remixd')
    if (showSlither) {
      setShowSlither(false)
    }
    if(!showSlither) {
      setShowSlither(true)
    }
  }

  const handleBasicEnabled = () => {
    if (basicEnabled) {
      setBasicEnabled(false)
    } else {
      setBasicEnabled(true)
    }
  }

  const handleLinterEnabled = () => {
    if (solhintEnabled) {
      setSolhintEnabled(false)
    } else {
      setSolhintEnabled(true)
    }
  }

  const handleCheckSingle = (event, _index) => {
    _index = _index.toString()
    if (categoryIndex.includes(_index)) {
      setCategoryIndex(categoryIndex.filter(val => val !== _index))
    } else {
      setCategoryIndex(_.uniq([...categoryIndex, _index]))
    }
  }

  const handleShowLibsWarning = () => {
    if (showLibsWarning) {
      setShowLibsWarning(false)
    } else {
      filterWarnings()
      setShowLibsWarning(true)
    }
  }

  const categoryItem = (categoryId, item, i) => {
    return (
      <div className="form-check" key={i}>
        <RemixUiCheckbox
          categoryId={categoryId}
          id={`staticanalysismodule_${categoryId}_${i}`}
          inputType="checkbox"
          name="checkSingleEntry"
          itemName={item.name}
          label={item.description}
          onClick={event => handleCheckSingle(event, item._index)}
          checked={categoryIndex.includes(item._index.toString())}
          onChange={() => {}}
        />
      </div>
    )
  }

  const categorySection = (category, categoryId, i) => {
    return (
      <div className="" key={i}>
        <div className="block">
          <TreeView>
            <TreeViewItem
              label={
                <label
                  htmlFor={`heading${categoryId}`}
                  style={{ cursor: 'pointer' }}
                  className="pl-3 card-header h6 d-flex justify-content-between font-weight-bold px-1 py-2 w-100"
                  data-bs-toggle="collapse"
                  data-bs-expanded="false"
                  data-bs-controls={`heading${categoryId}`}
                  data-bs-target={`#heading${categoryId}`}
                >
                  {category[0].categoryDisplayName}
                </label>
              }
              expand={false}
            >
              <div>
                <RemixUiCheckbox onClick={() => handleCheckOrUncheckCategory(category)} id={categoryId} inputType="checkbox" label={`Select ${category[0].categoryDisplayName}`} name='checkCategoryEntry' checked={category.map(x => x._index.toString()).every(el => categoryIndex.includes(el))} onChange={() => {}} title={category[0].categoryDisplayName} tooltipPlacement="right"/>
              </div>
              <div className="w-100 d-block px-2 my-1 entries collapse multi-collapse" id={`heading${categoryId}`}>
                {category.map((item, i) => {
                  return (
                    categoryItem(categoryId, item, i)
                  )
                })}
              </div>
            </TreeViewItem>
          </TreeView>
        </div>
      </div>
    )
  }

  const handleHideWarnings = () => {
    setHideWarnings(!hideWarnings)
  }

  const hintErrors = hints.filter(hint => hint.type === 'error')
  const noLibSlitherWarnings = slitherWarnings.filter(w => !w.options.isLibrary)
  const slitherErrors = noLibSlitherWarnings.filter(slitherError => slitherError.options.type === 'error')

  const tabKeys = [
    {
      tabKey: "linter",
      child: (
        <>
          {hints.length > 0 ? (
            <div id="solhintlintingresult" className="mb-5">
              <div className="mb-4 pt-2">
                <Fragment>
                  {!hideWarnings
                    ? hints.map((hint, index) => (
                        <div
                          key={index}
                          className={`${
                            hint.type === "warning"
                              ? "alert alert-warning"
                              : "alert alert-danger"
                          }`}
                          style={{ cursor: "pointer", overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onClick={async () => {
                            await props.analysisModule.call(
                              "editor",
                              "discardHighlight"
                            )
                            await props.analysisModule.call(
                              "editor",
                              "highlight",
                              {
                                end: {
                                  line: hint.line,
                                  column: hint.column + 1,
                                },
                                start: {
                                  line: hint.line,
                                  column: hint.column,
                                },
                              },
                              state.file,
                              "",
                              { focus: true }
                            );
                          }}
                        >
                          <div>
                            <span className="text-wrap">
                              {hint.formattedMessage}
                            </span>
                            <span>{hint.type}</span>
                            <br />
                            <span>{`${hint.column}:${hint.line}`}</span>
                          </div>
                        </div>
                      ))
                    : hintErrors.map((hint, index) => (
                        <div
                          key={index}
                          className="alert alert-danger"
                          style={{ cursor: "pointer", overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onClick={async () => {
                            await props.analysisModule.call(
                              "editor",
                              "discardHighlight"
                            );
                            await props.analysisModule.call(
                              "editor",
                              "highlight",
                              {
                                end: {
                                  line: hint.line,
                                  column: hint.column + 1,
                                },
                                start: {
                                  line: hint.line,
                                  column: hint.column,
                                },
                              },
                              state.file,
                              "",
                              { focus: true }
                            );
                          }}
                        >
                          <div>
                            <span className="text-wrap" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {hint.formattedMessage}
                            </span>
                            <br />
                            <span>{hint.type}</span>
                            <br />
                            <span>{`${hint.column}:${hint.line}`}</span>
                          </div>
                        </div>
                      ))}
                </Fragment>
              </div>
            </div>
          ) : state.data && state.file.length > 0 && state.source && startAnalysis && hints.length > 0 ? <span className="ml-4 spinner-grow-sm d-flex justify-content-center">Loading...</span> : <span className="display-6 text-center">Nothing to report</span>}
        </>
      ),
      title: (
        <span>
          Linter
          {hints.length > 0 ? (
            hideWarnings ? (
              <i className={`badge ${hints.filter(x => x.type === 'error').length > 0
                ? `badge-danger` : 'badge-warning'} rounded-circle ml-1 text-center`}>
                {hintErrors.length}
              </i>
            ) : (
              <i className={`badge ${hints.filter(x => x.type === 'error').length > 0
              ? `badge-danger` : 'badge-warning'} rounded-circle ml-1 text-center`}>
                {hints.length}
              </i>
            )
          ) : null}
        </span>
      ),
    },
    {
      tabKey: "basic",
      title: (
        <BasicTitle
          warningStateEntries={Object.entries(warningState)}
          hideWarnings={hideWarnings}
          showLibsWarnings={showLibsWarning}
        />
      ),
      child: (
        <BasicTabBody
          analysisModule={props.analysisModule}
          warningState={warningState}
          hideWarnings={hideWarnings}
          showLibsWarning={showLibsWarning}
          startAnalysis={startAnalysis}
          state={state}
        />
      ),
    },
    {
      tabKey: "slither",
      title: (
        <span>
          Slither
          {slitherWarnings.length > 0 ? (
            hideWarnings ? (
              <i className="badge badge-warning rounded-circle ml-1">
                {slitherErrors.length}
              </i>
            ) : showLibsWarning === true && hideWarnings === false ? (
              <i className={`badge ${slitherErrors.length > 0 ? `badge-danger` : 'badge-warning'} rounded-circle ml-1 text-center`}>
                  {slitherWarnings.length}
                </i>
            )  : (
              <i className={`badge ${slitherErrors.length > 0 ? `badge-danger` : 'badge-warning'} rounded-circle ml-1 text-center`}>
                {noLibSlitherWarnings.length}
              </i>
            )
          ) : null}
        </span>
      ),
      child: (
        <>
          {slitherWarnings.length > 0 ? (
            <div id="solhintlintingresult" className="mb-5">
              <div className="mb-4 pt-2">
                <Fragment>
                  {!hideWarnings
                    ? showLibsWarning ? slitherWarnings.map((warning, index) => (
                      <div
                      data-id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      key={index}
                    >
                      <ErrorRenderer
                        name={`staticAnalysisModule${warning.warningModuleName}${index}`}
                        message={warning.msg}
                        opt={warning.options}
                        warningErrors={warning.warningErrors}
                        editor={props.analysisModule}
                      />
                    </div>
                      )) : noLibSlitherWarnings.map((warning, index) => (
                      <div
                      data-id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      key={index}
                    >
                      <ErrorRenderer
                        name={`staticAnalysisModule${warning.warningModuleName}${index}`}
                        message={warning.msg}
                        opt={warning.options}
                        warningErrors={warning.warningErrors}
                        editor={props.analysisModule}
                      />
                    </div>
                      ))
                    : slitherWarnings.filter(x => x.options.type === 'error').map((warning, index) => (
                      <div
                      data-id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      key={index}
                      >
                      <ErrorRenderer
                        name={`staticAnalysisModule${warning.warningModuleName}${index}`}
                        message={warning.msg}
                        opt={warning.options}
                        warningErrors={warning.warningErrors}
                        editor={props.analysisModule}
                      />
                    </div>
                      ))}
                </Fragment>
              </div>
            </div>
          ) : state.data && state.file.length > 0 && state.source && startAnalysis && slitherWarnings.length > 0 ? <span className="ml-4 spinner-grow-sm d-flex justify-content-center">Loading...</span> : <span className="display-6 text-center">Nothing to report</span>}
        </>
      ),
    },
  ];

  const checkBasicStatus = () => {
    return Object.values(groupedModules).map((value: any) => {
      return (value.map(x => {
        return x._index.toString()
      }))
    }).flat().every(el => categoryIndex.includes(el))
  }

  return (
    <div className="analysis_3ECCBV px-3 pb-1">
      <div className="my-2 d-flex flex-column align-items-left">
        <div className="d-flex flex-column mb-3" id="staticanalysisButton">
        <div className="mb-3 d-flex justify-content-start">
        <RemixUiCheckbox
            id="checkAllEntries"
            inputType="checkbox"
            title="Remix analysis runs a basic analysis."
            checked={Object.values(groupedModules).map((value: any) => {
              return (value.map(x => {
                return x._index.toString()
              }))
            }).flat().every(el => categoryIndex.includes(el))}
            label="Remix"
            onClick={() => {
              handleCheckAllModules(groupedModules)
            }}
            onChange={() => {}}
            tooltipPlacement={'bottom-start'}
            optionalClassName="mr-3"
          />

          <RemixUiCheckbox
            id="solhintstaticanalysis"
            inputType="checkbox"
            title="Linter runs SolHint static analysis."
            onClick={handleLinterEnabled}
            checked={solhintEnabled }
            label="Linter"
            onChange={() => {}}
            tooltipPlacement={'bottom-start'}
            optionalClassName="mr-3"
          />

          <RemixUiCheckbox
            id="enableSlither"
            inputType="checkbox"
            onClick={handleSlitherEnabled}
            checked={showSlither && slitherEnabled}
            disabled={slitherEnabled === false}
            tooltipPlacement="bottom-start"
            label="Slither"
            onChange={() => {}}
            optionalClassName="mr-3"
            title={slitherEnabled ? "Slither runs Slither static analysis." : "To run Slither analysis, Remix IDE must be connected to your local filesystem with Remixd."}
          />
        </div>
          {state.data && state.file.length > 0 && state.source ? <Button
              buttonText={`Analyse ${state.file}`}
              classList="btn btn-sm btn-primary btn-block"
              onClick={async () => await run(state.data, state.source, state.file, state , props, isSupportedVersion, showSlither, categoryIndex, groupedModules, runner,_paq,
                message, showWarnings, allWarnings, warningContainer, calculateWarningStateEntries, warningState, setHints, hints, setSlitherWarnings, setSsaWarnings, slitherEnabled, setStartAnalysis)}
              disabled={(state.data === null || !isSupportedVersion)  || (!solhintEnabled && !basicEnabled) }
          /> : <Button
              buttonText={`Analyze ${state.file}`}
              title={`${runButtonTitle}`}
              classList="btn btn-sm btn-primary btn-block"
              onClick={async () => await run(state.data, state.source, state.file, state , props, isSupportedVersion, showSlither, categoryIndex, groupedModules, runner,_paq,
                message, showWarnings, allWarnings, warningContainer, calculateWarningStateEntries, warningState, setHints, hints, setSlitherWarnings, setSsaWarnings, slitherEnabled, setStartAnalysis)}
              disabled={(state.data === null || !isSupportedVersion)  || (!solhintEnabled && !basicEnabled) }
          />}
          {state && state.data !== null && state.source !== null && state.file.length > 0 ? (<div className="d-flex border-top flex-column">
            {slitherWarnings.length > 0 || hints.length > 0 || Object.entries(warningState).length > 0 ?  (
              <div className={`mt-4 p-2 d-flex ${slitherWarnings.length > 0 || hints.length > 0 || Object.entries(warningState).length > 0 ? 'border-top' : ''} flex-column`}>
                <span>Last results for:</span>
                  <span
                    className="text-break break-word word-break font-weight-bold"
                    id="staticAnalysisCurrentFile"
                  >
                    {state.file}
                  </span>
            </div>
            ) : null}
            <div className="border-top mt-2 pt-2 mb-2" id="staticanalysisresult">
              <RemixUiCheckbox
                id="showLibWarnings"
                name="showLibWarnings"
                categoryId="showLibWarnings"
                inputType="checkbox"
                checked={showLibsWarning}
                label="Show warnings for external libraries"
                onClick={handleShowLibsWarning}
                onChange={() => {}}
                tooltipPlacement="top-start"
              />
              <RemixUiCheckbox
                id="hideWarnings"
                name="hideWarnings"
                inputType="checkbox"
                checked={hideWarnings}
                label="Hide warnings"
                onClick={handleHideWarnings}
                onChange={() => {}}
              />
            </div>
            <Tabs
              defaultActiveKey={tabKeys[1].tabKey}
              className="px-1"
              onSelect={(newKey) => setTabKey(newKey)}
            >
              {
                checkBasicStatus() ? <Tab
                  key={tabKeys[1].tabKey}
                  title={tabKeys[1].title}
                  eventKey={tabKeys[1].tabKey}
                  tabClassName="text-decoration-none font-weight-bold px-2"
                >
                  {tabKeys[1].child}
                </Tab> : null
              }
              {
                solhintEnabled ? <Tab
                  key={tabKeys[0].tabKey}
                  title={tabKeys[0].title}
                  eventKey={tabKeys[0].tabKey}
                  tabClassName="text-decoration-none font-weight-bold px-2"
                >
                  {tabKeys[0].child}
                </Tab> : null
              }
              { showSlither && slitherEnabled ? <Tab
                key={tabKeys[2].tabKey}
                title={tabKeys[2].title}
                eventKey={tabKeys[2].tabKey}
                tabClassName="text-decoration-none font-weight-bold px-2"
              >
                {tabKeys[2].child}
              </Tab> : null }
            </Tabs>
          </div>) : null}
        </div>
      </div>
    </div>
  )
}

export default RemixUiStaticAnalyser
