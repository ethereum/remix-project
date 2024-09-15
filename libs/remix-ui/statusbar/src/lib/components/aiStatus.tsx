// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'

interface AIStatusProps {
  plugin: StatusBar
  isAiActive: boolean
  setIsAiActive: (isAiActive: boolean) => void
  aiActive: () => Promise<any>
}

export default function AIStatus(props: AIStatusProps) {
  const [copilotActive, setCopilotActive] = useState(false)
  useEffect(() => {
    const run = async () => {
      const aiActivate = await props.plugin.call('settings', 'get', 'settings/copilot/suggest/activate')
      setCopilotActive(aiActivate)
    }
    run()
  }, [])

  useEffect(() => {
    const run = async () => {
      props.plugin.on('settings', 'copilotChoiceUpdated', async (isChecked) => {
        await props.plugin.isAIActive()
        setCopilotActive(isChecked)
      })
    }
    run()
  }, [props.plugin.isAiActive, props.plugin.isAiActive])
  return (
    <CustomTooltip
      tooltipText={copilotActive ? "RemixAI Copilot enabled" : "RemixAI Copilot disabled. To enable, open a .sol file and toggle the switch at the left-top of the editor"}
    >
      <div className="d-flex flex-row pr-2 text-white justify-content-center align-items-center">
        <span className={copilotActive === false ? "small mx-1 text-white semi-bold" : "small mx-1 text-white semi-bold" }>
          {copilotActive === false ? 'RemixAI Copilot (disabled)' : 'RemixAI Copilot (enabled)'}
        </span>
      </div>
    </CustomTooltip>
  )
}
