// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect } from 'react'
import { useRunTabPlugin } from './actions/custom'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import './css/run-tab.css'
import { RunTabProps } from './types'

export function RunTabUI (props: RunTabProps) {
  const { runTab, setupEvents, fillAccountsList, setAccount, setUnit, setGasFee } = useRunTabPlugin(props.plugin)
  const [selectExEnv, setSelectExEnv] = useState<string>('')

  useEffect(() => {
    setupEvents()

    setInterval(() => {
      fillAccountsList()
    }, 1000)
    fillAccountsList()
  }, [])

  const updateExEnv = (env: string) => {
    setSelectExEnv(env)
  }

  return (
    <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
      <div className="list-group list-group-flush">
        <SettingsUI selectExEnv={selectExEnv} updateExEnv={updateExEnv} accounts={runTab.accounts} setAccount={setAccount} setUnit={setUnit} sendValue={runTab.sendValue} sendUnit={runTab.sendUnit} gasLimit={runTab.gasLimit} setGasFee={setGasFee} />
        <ContractDropdownUI exEnvironment={selectExEnv} />
        <RecorderUI />
        <InstanceContainerUI />
      </div>
    </div>
  )
}
