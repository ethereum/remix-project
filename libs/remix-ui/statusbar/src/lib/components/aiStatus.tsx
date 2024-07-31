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
      props.plugin.on('fileManager', 'currentFileChanged', async (isAiActive) => {
        const aiActivate = await props.plugin.call('settings', 'get', 'settings/copilot/suggest/activate')
        setCopilotActive(aiActivate)
      })
    }
    run()
  }, [props.plugin.isAiActive, props.isAiActive])

  useEffect(() => {
    const run = async () => {
      props.plugin.on('settings', 'copilotChoiceUpdated', async (isChecked) => {
        await props.plugin.isAIActive()
        setCopilotActive(isChecked)
      })
    }
    run()
  }, [props.plugin.isAiActive])
  return (
    <CustomTooltip
      tooltipText={copilotActive ? "Remix Copilot activated" : "Remix Copilot disabled. To activate copilot, open a .sol file and toggle the ai switch at the top of the Ide"}
    >
      <div className="d-flex flex-row pr-2 text-white justify-content-center align-items-center">
        <span className={copilotActive === false ? "small mx-1 text-white semi-bold" : "small mx-1 text-white semi-bold" }>
          {copilotActive === false ? 'Remix Copilot (disabled)' : 'Remix Copilot (enabled)'}
        </span>
      </div>
    </CustomTooltip>
  )
}
