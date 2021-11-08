// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useReducer } from 'react'
import { initSettingsTab } from './actions'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import './css/run-tab.css'
import { runTabInitialState, runTabReducer } from './reducers/runTab'
import { RunTabProps } from './types'

export function RunTabUI (props: RunTabProps) {
  const [selectExEnv, setSelectExEnv] = useState<string>('')
  const [runTab, runTabDispatch] = useReducer(runTabReducer, runTabInitialState)

  useEffect(() => {
    initSettingsTab(props.plugin)(runTabDispatch)
  }, [])

  const updateExEnv = (env: string) => {
    setSelectExEnv(env)
  }

  return (
    <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
      <div className="list-group list-group-flush">
        <SettingsUI selectExEnv={selectExEnv} updateExEnv={updateExEnv} />
        <ContractDropdownUI exEnvironment={selectExEnv} />
        <RecorderUI />
        <InstanceContainerUI />
      </div>
    </div>
  )
}
