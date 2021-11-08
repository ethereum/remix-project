// eslint-disable-next-line no-use-before-define
import React, { useState } from 'react'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import './css/run-tab.css'
import { RunTabProps } from './types'

export function RunTabUI (props: RunTabProps) {
  const [selectExEnv, setSelectExEnv] = useState<string>('')

  const updateExEnv = (env: string) => {
    setSelectExEnv(env)
  }

  return (
    <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
      <div className="list-group list-group-flush">
        <SettingsUI selectExEnv={selectExEnv} updateExEnv={updateExEnv} />
        <ContractDropdownUI exEnvironment={selectExEnv} />
        <RecorderUI />
        {/* ${this.instanceContainer} */}
      </div>
    </div>
  )
}
