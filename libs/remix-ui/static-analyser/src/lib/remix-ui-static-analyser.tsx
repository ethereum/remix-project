import React, { useEffect, useState, useReducer } from 'react'
import Button from './Button/StaticAnalyserButton' // eslint-disable-line
import remixLib from '@remix-project/remix-lib'
import _ from 'lodash'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { RemixUiCheckbox } from '@remix-ui/checkbox' // eslint-disable-line
import ErrorRenderer from './ErrorRenderer' // eslint-disable-line
import { compilation } from './actions/staticAnalysisActions'
import { initialState, analysisReducer } from './reducers/staticAnalysisReducer'
const StaticAnalysisRunner = require('@remix-project/remix-analyzer').CodeAnalysis
const utils = remixLib.util

/* eslint-disable-next-line */
export interface RemixUiStaticAnalyserProps {
  registry: any,
  event: any,
  analysisModule: any
}

export const RemixUiStaticAnalyser = (props: RemixUiStaticAnalyserProps) => {
  const [runner] = useState(new StaticAnalysisRunner())

  const preProcessModules = (arr: any) => {
    return arr.map((Item, i) => {
      const itemObj = new Item()
      itemObj._index = i
      itemObj.categoryDisplayName = itemObj.category.displayName
      itemObj.categoryId = itemObj.category.id
      return itemObj
    })
  }

  const groupedModules = utils.groupBy(
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
  const [autoRun, setAutoRun] = useState(true)
  const [categoryIndex, setCategoryIndex] = useState(groupedModuleIndex(groupedModules))

  const warningContainer = React.useRef(null)
  const [warningState, setWarningState] = useState([])
  const [state, dispatch] = useReducer(analysisReducer, initialState)

  useEffect(() => {
    compilation(props.analysisModule, dispatch)
  }, [])

  useEffect(() => {
    if (autoRun) {
      if (state.data !== null) {
        run(state.data, state.source, state.file)
    if (autoRun) {
      const setCompilationResult = async (data, source, file) => {
        await setResult({ lastCompilationResult: data, lastCompilationSource: source, currentFile: file })
      }
      if (props.analysisModule) {
        props.analysisModule.on(
          'solidity',
          'compilationFinished',
          (file, source, languageVersion, data) => {
            if (languageVersion.indexOf('soljson') !== 0) return
            setCompilationResult(data, source, file)
            if (categoryIndex.length > 0) {
              run(data, source, file)
            }
          }
        }
      )
    }
    return () => { }
  }, [autoRun, categoryIndex, state])

  const message = (name, warning, more, fileName, locationString) : string => {
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

  const message = (name, warning, more, fileName, locationString) : string => {
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

  const run = (lastCompilationResult, lastCompilationSource, currentFile) => {
    if (autoRun) {
      if (lastCompilationResult && categoryIndex.length > 0) {
        let warningCount = 0
        const warningMessage = []

        runner.run(lastCompilationResult, categoryIndex, results => {
          results.map((result) => {
            let moduleName
            Object.keys(groupedModules).map(key => {
              groupedModules[key].forEach(el => {
                if (el.name === result.name) {
                  moduleName = groupedModules[key][0].categoryDisplayName
                }
              })
            })
            const warningErrors = []
            result.report.map((item) => {
              let location: any = {}
              let locationString = 'not available'
              let column = 0
              let row = 0
              let fileName = currentFile
              if (item.location) {
                const split = item.location.split(':')
                const file = split[2]
                location = {
                  start: parseInt(split[0]),
                  length: parseInt(split[1])
                }
                location = props.analysisModule._deps.offsetToLineColumnConverter.offsetToLineColumn(
                  location,
                  parseInt(file),
                  lastCompilationSource.sources,
                  lastCompilationResult.sources
                )
                row = location.start.line
                column = location.start.column
                locationString = row + 1 + ':' + column + ':'
                fileName = Object.keys(lastCompilationResult.contracts)[file]
              }
              warningCount++
              const msg = message(item.name, item.warning, item.more, fileName, locationString)
              const options = {
                type: 'warning',
                useSpan: true,
                errFile: fileName,
                fileName,
                errLine: row,
                errCol: column,
                item: item,
                name: result.name,
                locationString,
                more: item.more,
                location: location
              }
              warningErrors.push(options)
              warningMessage.push({ msg, options, hasWarning: true, warningModuleName: moduleName })
            })
          })
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

          const groupedCategory = groupBy(resultArray, 'warningModuleName')
          setWarningState(groupedCategory)
        })
        if (categoryIndex.length > 0) {
          props.event.trigger('staticAnaysisWarning', [warningCount])
        }
      } else {
        if (categoryIndex.length) {
          warningContainer.current.innerText = 'No compiled AST available'
        }
        props.event.trigger('staticAnaysisWarning', [-1])
      }
    }
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

  const handleAutoRun = () => {
    if (autoRun) {
      setAutoRun(false)
    } else {
      setAutoRun(true)
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
                <RemixUiCheckbox onClick={() => handleCheckOrUncheckCategory(category)} id={categoryId} inputType="checkbox" label={`Select ${category[0].categoryDisplayName}`} name='checkCategoryEntry' checked={category.map(x => x._index.toString()).every(el => categoryIndex.includes(el))} onChange={() => {}}/>
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

  return (
    <div className="analysis_3ECCBV px-3 pb-1">
      <div className="my-2 d-flex flex-column align-items-left">
        <div className="d-flex justify-content-between" id="staticanalysisButton">
        <div className="d-flex justify-content-between">
          <RemixUiCheckbox
            id="checkAllEntries"
            inputType="checkbox"
            checked={Object.values(groupedModules).map((value: any) => {
              return (value.map(x => {
                return x._index.toString()
              }))
            }).flat().every(el => categoryIndex.includes(el))}
            label="Select all"
            onClick={() => handleCheckAllModules(groupedModules)}
            onChange={() => {}}
          />
          <RemixUiCheckbox
            id="autorunstaticanalysis"
            inputType="checkbox"
            onClick={handleAutoRun}
            checked={autoRun}
            label="Autorun"
            onChange={() => {}}
          />
          <Button buttonText="Run" onClick={() => run(state.data, state.source, state.file)} disabled={state.data === null}/>
        </div>
      </div>
      <div id="staticanalysismodules" className="list-group list-group-flush">
        {Object.keys(groupedModules).map((categoryId, i) => {
          const category = groupedModules[categoryId]
          return (
            categorySection(category, categoryId, i)
          )
        })
        }
      </div>
      <div className="mt-2 p-2 d-flex border-top flex-column">
        <span>last results for:</span>
        <span
          className="text-break break-word word-break font-weight-bold"
          id="staticAnalysisCurrentFile"
        >
          {state.file}
        </span>
      </div>
      { categoryIndex.length > 0 && Object.entries(warningState).length > 0 &&
        <div id='staticanalysisresult' >
          <div className="mb-4">
            {
              (Object.entries(warningState).map((element) => (
                <>
                  <span className="text-dark h6">{element[0]}</span>
                  {element[1].map(x => (
                    x.hasWarning ? (
                      <div id={`staticAnalysisModule${element[1].warningModuleName}`}>
                        <ErrorRenderer message={x.msg} opt={x.options} warningErrors={ x.warningErrors} editor={props.analysisModule}/>
                      </div>

                    ) : null
                  ))}
                </>
              )))
            }
          </div>
        </div>
      }
    </div>
  )
}

export default RemixUiStaticAnalyser
