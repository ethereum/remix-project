import React, { useEffect, useState } from 'react'
import { staticAnalysisRunner } from '@remix-ui/static-analyser'
import CheckBox from './Checkbox/StaticAnalyserCheckedBox'
import Button from './Button/StaticAnalyserButton'
import remixLib from '@remix-project/remix-lib'
import RenderModules from './RenderModules'

const utils = remixLib.util

export interface RemixUiStaticAnalyserProps {
  renderStaticAnalysis: any
  staticanalysis: any
  analysisRunner: any
}

export const RemixUiStaticAnalyser = (props: RemixUiStaticAnalyserProps) => {
  const [modules, setModules] = useState({})

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
    preProcessModules(props.analysisRunner.modules()),
    'categoryId'
  )

  const staticAnalysisViewRender = (groupedModules: any) => (
    <div>
      <div className="my-2 d-flex flex-column align-items-left">
        <div className="${``} d-flex justify-content-between">
          <div className="${``}">
            <CheckBox
              id="checkAllEntries"
              inputType="checkbox"
              onClick={() => {}}
              checked={true}
              label="Select all"
              onChange={() => {}}
            />
          </div>
          <div className="${``}">
            <CheckBox
              id="autorunstaticanalysis"
              inputType="checkbox"
              onClick={() => {}}
              checked={true}
              label="Autorun"
              onChange={() => {}}
            />
          </div>
          <Button buttonText="Run" onClick={() => {}} />
        </div>
      </div>
      <div id="staticanalysismodules" className="list-group list-group-flush">
        <RenderModules groupedModules={groupedModules} />
        {/* ${``}this.modulesView */}
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
  )
  return (
    <div>
      {console.log({ groupedModules })}
      {staticAnalysisViewRender(groupedModules)}
    </div>
  )
}

export default RemixUiStaticAnalyser
