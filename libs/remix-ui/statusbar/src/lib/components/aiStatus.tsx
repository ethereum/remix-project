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
      tooltipText={copilotActive ? "Remix Copilot activated" : "Remix Copilot disabled."}
    >
      <div className="d-flex flex-row pr-2 text-white justify-content-center align-items-center">
        <span className={copilotActive === false ? "fa-regular fa-microchip-ai ml-1 text-danger" : "fa-regular fa-microchip-ai ml-1"}></span>
        <span className={copilotActive === false ? "small mx-1 text-danger semi-bold" : "small mx-1 semi-bold" }>Remix Copilot</span>
      </div>
    </CustomTooltip>
  )
}
