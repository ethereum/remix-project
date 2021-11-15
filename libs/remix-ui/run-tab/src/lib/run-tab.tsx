// eslint-disable-next-line no-use-before-define
import React, { useEffect } from 'react'
import { useRunTabPlugin } from './actions/custom'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import './css/run-tab.css'
import { RunTabProps } from './types'

export function RunTabUI (props: RunTabProps) {
  const { runTab, setupEvents, fillAccountsList, setAccount, setUnit, setGasFee, addPluginProvider, removePluginProvider, setExecEnv, setExecutionContext } = useRunTabPlugin(props.plugin)

  useEffect(() => {
    setupEvents()
    // setInterval(() => {
    //   fillAccountsList()
    // }, 1000)
    // fillAccountsList()
    setTimeout(() => {
      fillAccountsList()
    }, 0)

    props.plugin.on('manager', 'pluginActivated', addPluginProvider.bind(props.plugin))
    props.plugin.on('manager', 'pluginDeactivated', removePluginProvider.bind(props.plugin))
  }, [])

  return (
    <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
      <div className="list-group list-group-flush">
        <SettingsUI networkName={runTab.networkName} personalMode={runTab.personalMode} selectExEnv={runTab.selectExEnv} setExecEnv={setExecEnv} accounts={runTab.accounts} setAccount={setAccount} setUnit={setUnit} sendValue={runTab.sendValue} sendUnit={runTab.sendUnit} gasLimit={runTab.gasLimit} setGasFee={setGasFee} />
        <ContractDropdownUI exEnvironment={runTab.selectExEnv} />
        <RecorderUI />
        <InstanceContainerUI />
      </div>
    </div>
  )
}
