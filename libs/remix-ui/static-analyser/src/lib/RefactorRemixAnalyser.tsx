import React, { useEffect, useState } from 'react'
import CheckBox from './Checkbox/StaticAnalyserCheckedBox'
import Button from './Button/StaticAnalyserButton'
import remixLib from '@remix-project/remix-lib'
import RenderModules from './RenderModules'
import _ from 'lodash'
import filter from './utils'
import { checkIfElementExist } from './utils'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
const StaticAnalysisRunner = require('@remix-project/remix-analyzer').CodeAnalysis
const utils = remixLib.util

export interface RefactorRemixUiStaticAnalyserProps {
  renderStaticAnalysis: any
  staticanalysis: any
  analysisRunner: any,
  lastCompilationResult: any,
  lastCompilationSource: any,
  registry: any,
  analysisModule: any,
  isActivated: boolean,
  onEvent: any,
  compilationFinished: () => void
}

export const RefactorRemixAnalyser = (props: RefactorRemixUiStaticAnalyserProps) => {
  const [runner, setRunner] = useState(new StaticAnalysisRunner())
  const [checkAllCategories, setCheckAllCategories] = useState({ checked: false, category: [] })

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
  const [modulesCategory, setModulesCategory] = useState({
    checkAll: false,
    category: ['0', '20', '8']
  })

  const [checkOrUncheckCategory, setCheckOrUncheckCategory] = useState({ category: {} })
  const [checkOrUncheckSection, setCheckOrUncheckSection] = useState([{ section: '', checked: false }])
  const [selectedCategoryIndex, setCategoryIndex] = useState([])

  const warningContainer = React.useRef(null)
  const [runButtonState, setRunButtonState] = useState(true)
  const [autoRun, setAutoRun] = useState(true)

  // useEffect(() => {
  //   const result = props.onEvent(
  //     'solidity',
  //     'compilationFinished',
  //     (file, source, languageVersion, data) => {
  //       console.log({ file })
  //       console.log({ source })
  //       console.log({ languageVersion })
  //       console.log({ data })
  //     }
  //   )
  //   console.log({ result })
  //   return () => {
  //   }
  // }, [props.onEvent])

  useEffect(() => {
    if (props.analysisModule) {
      props.analysisModule.listenOnCompilationFinished()
    }
  }, [props.analysisModule])

  useEffect(() => {
    //   console.log({ props })
    //   handleCheckAllModules(groupedModules, true)
    //   console.log(props.analysisModule.lastCompilationResult, ' new last compilation results ')
    // if (props.isActivated && props.analysisModule) {
    //   console.log(" is activated and props . analysis")
    // warningContainer.current.innerText = 'No file compiled'

    // }
    // console.log({modulesCategory})
    if (props.analysisModule) {
      props.analysisModule.listenOnCompilationFinished()
    }
  }, [props.analysisModule])

  const staticAnaysisWarning = (count: number) => {
    if (count > 0) {
      props.analysisModule.emit('statusChanged', { key: count, title: `${count} warning${count === 1 ? '' : 's'}`, type: 'warning' })
    } else if (count === 0) {
      props.analysisModule.emit('statusChanged', { key: 'succeed', title: 'no warning', type: 'success' })
    } else {
      // count ==-1 no compilation result
      props.analysisModule.emit('statusChanged', { key: 'none' })
    }
  }

  const run = () => {
    console.log(' running in the run function ')
    const highlightLocation = async (location, fileName) => {
      await props.analysisModule.call('editor', 'discardHighlight')
      await props.analysisModule.call('editor', 'highlight', location, fileName)
    }
    console.log(props.analysisModule.lastCompilationResult, ' new last compilation results ')
    if (props.staticanalysis.lastCompilationResult && selectedCategoryIndex.length) {
      console.log('run code block')
      //set disable to false on the run button
      setRunButtonState(false)
      let warningCount = 0

      runner.run(props.lastCompilationResult, selectedCategoryIndex, results => {
        const groupedModules = utils.groupBy(
          preProcessModules(runner.modules()),
          'categoryId'
        )
        results.map((result, j) => {
          let moduleName
          Object.keys(groupedModules).map(key => {
            groupedModules[key].forEach(el => {
              if (el.name === result.name) {
                moduleName = groupedModules[key][0].categoryDisplayName
              }
            })
          })
          const alreadyExistedEl = props.analysisModule.view.querySelector(
          `[id="staticAnalysisModule${moduleName}"]`
          )
          if (!alreadyExistedEl) {
            warningContainer.append(`
            <div class="mb-4" name="staticAnalysisModules" id="staticAnalysisModule${moduleName}">
              <span class="text-dark h6">${moduleName}</span>
            </div>
            `)
          }
          result.report.map((item, i) => {
            let location = ''
            let locationString = 'not available'
            let column = 0
            let row = 0
            let fileName = props.analysisModule.currentFile
            if (item.location) {
              var split = item.location.split(':')
              var file = split[2]
              location = {
                start: parseInt(split[0]),
                length: parseInt(split[1])
              }
              location = props.analysisModule._deps.offsetToLineColumnConverter.offsetToLineColumn(
                location,
                parseInt(file),
                props.analysisModule.lastCompilationSource.sources,
                props.analysisModule.lastCompilationResult.sources
              )
              row = location.start.line
              column = location.start.column
              locationString = row + 1 + ':' + column + ':'
              fileName = Object.keys(props.analysisModule.lastCompilationResult.contracts)[file]
            }
            warningCount++
            const msg = `
            <span class="d-flex flex-column">
              <span class="h6 font-weight-bold">${result.name}</span>
              ${item.warning}
              ${
                item.more
                  ? `<span><a href="${item.more}" target="_blank">more</a></span>`
                  : `<span> </span>`
              }
              <span class="" title="Position in ${fileName}">Pos: ${locationString}</span>
            </span>`
            props.analysisModule._components.renderer.error(
              msg,
              props.analysisModule.view.querySelector(`[id="staticAnalysisModule${moduleName}"]`),
              {
                click: () => highlightLocation(location, fileName),
                type: 'warning',
                useSpan: true,
                errFile: fileName,
                errLine: row,
                errCol: column
              }
            )
          })
        })
        props.analysisModule.view
          .querySelectorAll('[name="staticAnalysisModules"]')
          .forEach(section => {
            if (!section.getElementsByClassName('alert-warning').length)
              section.hidden = true
         })
      props.analysisModule.event.trigger('staticAnaysisWarning', [warningCount])
      })
      
    } else {
        setRunButtonState(true)
      if (selectedCategoryIndex.length) {
      warningContainer.current.innerText = 'No compiled AST available'
      }
      props.analysisModule.event.trigger('staticAnaysisWarning', [-1])
      //need to know what the above code does
    }
  }
    
  const correctRunBtnDisabled = () => {
 
  if (props.lastCompilationResult && selectedCategoryIndex.length !== 0) {
    setRunButtonState(false)
  } else {
    setRunButtonState(true)
  }
}

  const handleCheckAllModules = (groupedModules, checked) => {
    if (!modulesCategory.checkAll) {

         setModulesCategory(prevState => {
                    return {
                        ...prevState,
                      checkAll: checked,
                        category: groupedModules
                    }
         })
        const modules = groupedModules
    const indexOfCategory = [];
    if (!_.isEmpty(modules)) {
      Object.values(modules).map((value) => {
        value.forEach((x) => {
          indexOfCategory.push(x._index)
        })
      })
      setCategoryIndex(indexOfCategory)
    }
      
    } else {
       setModulesCategory(prevState => {
                    return {
                        ...prevState,
                      checkAll: false,
                        category: []
                    }
                          })
      }
      
    }

    const handleCheckOrUncheckCategory = (category, categoryIdParams, groupedModules) => {

        console.log({categoryIdParams}, ' checkOrUncheckCategory.category ')
      if (modulesCategory.checkAll && _.isEmpty(checkOrUncheckCategory.category)) {
          
            const sectionArray = []
             Object.keys(groupedModules).map((categoryId, i) => {
                console.log({categoryId}, " in map")
               if (categoryId === categoryIdParams) {
                   sectionArray.push({
                         
                           sectionId: categoryIdParams,
                           checked: true
                    })
               } else {
                   sectionArray.push({
                         
                           sectionId: categoryId,
                           checked: false
                    })
                }
          

             })
            
            setCheckOrUncheckSection(prevState => {
                return {
                    ...prevState,
                    sectionArray
            }})
            
           
 
            //if category is tempty then set the  category with the value passed in {category}
            setCheckOrUncheckCategory(prevState => {
                return {
                    ...prevState,
                    category
                }  
            })


        }
        else {
            //is the category is not empty then remove the {category} the list  
           Object.filter = (obj, predicate) => 
             Object.keys(obj)
             .filter( key => predicate(obj[key]))
                    .reduce((res, key) => (res[key] = obj[key], res), {})
            

            const filtered = filter(
                checkOrUncheckCategory.category,
                category => category.categoryId !== category.categoryId
            )


            setCheckOrUncheckCategory(prevState => {
                    return {
                        ...prevState,
                        category: filtered
                    }  
                })
                  //      console.log({filtered}, " handle check uncheck funtion ")

        }
       
  }
  
  const handleAutoRun = () => {
    setAutoRun(prevState => !prevState)
  }

  const handleCheckSingle = (event, _index) => {
    console.log(_index)
  }

  const categoryItem = (categoryId, modulesCategory, item, i) => {
    return (
      <div className="form-check" key={i}>
        <CheckBox
          categoryId={categoryId}
          id={`staticanalysismodule_${categoryId}_${i}`}
          inputType="checkbox"
          name="checkSingleEntry"
          checked={modulesCategory.checkAll}
          itemName={item.name}
          label={item.description}
          onClick={event => handleCheckSingle(event, item._index) }
          onChange={() => {}}
        />
      </div>
)
  }

  const cards = (category, categoryId , i) => {
    return (
      <div className="" key={i}>
        <div className="block">
          <TreeView>
            <TreeViewItem
              label={
                <label
                  htmlFor={`heading${categoryId}`}
                  style={{ cursor: 'pointer' }}
                  className="pl-3 card-header h6 d-flex justify-content-between font-weight-bold border-left px-1 py-2 w-100"
                  data-bs-toggle="collapse"
                  data-bs-expanded="false"
                  data-bs-controls={`heading${categoryId}`}
                  data-bs-target={`#heading${categoryId}`}
                >
                  {category[0].categoryDisplayName}
                  <div>
                    <i className="fas fa-angle-double-right"></i>
                  </div>
                </label>
              }
              expand={true}
            >
              <div>
                <CheckBox onClick={() => handleCheckOrUncheckCategory(category, category[0].categoryId, groupedModules)} onChange={() => { }} checked={modulesCategory.checkAll} id={categoryId} inputType="checkbox" label={`Select ${category[0].categoryDisplayName}`} name='checkCategoryEntry' />
              </div>
              <div className="w-100 d-block px-2 my-1 entries collapse multi-collapse" id={`heading${categoryId}`}>
                {category.map((item, i) => {
                  return (
                    categoryItem(categoryId, modulesCategory, item, i)
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
    <div>
      <div className="my-2 d-flex flex-column align-items-left">
        <div className="${``} d-flex justify-content-between">   
          <div className="${``}" >
            <CheckBox
              id="checkAllEntries"
              inputType="checkbox"
              checked={modulesCategory.checkAll}
              label="Select all"
              onClick={() => handleCheckAllModules(groupedModules, !modulesCategory.checkAll)}
            />
          </div>
          <div className="" >
            <CheckBox
              id="autorunstaticanalysis"
              inputType="checkbox"
              onClick={() => handleAutoRun()}
              checked={autoRun}
              label="Autorun"
            />
          </div>
          <Button buttonText="Run" onClick={run} disabled={false}/>
        </div>
      </div>
      <div id="staticanalysismodules" className="list-group list-group-flush">
        {/* <RenderModules groupedModules={groupedModules} checkAll={checkAllModules} checkAllCategory={true} /> */}
        {Object.keys(groupedModules).map((categoryId, i) => {
          const category = groupedModules[categoryId]   
          return (
            cards(category, categoryId, i)
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
        </span>
      </div>
      <div className="" ref={warningContainer}>

      </div>
    </div>
  )
}

export default RefactorRemixAnalyser
