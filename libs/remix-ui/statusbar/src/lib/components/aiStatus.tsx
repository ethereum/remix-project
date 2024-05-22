// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import React, { useEffect, useState } from 'react'

interface AIStatusProps {
  plugin: StatusBar
  isAiActive: boolean
  aiActive: () => Promise<any>
}

export default function AIStatus(props: AIStatusProps) {
  const [copilotActive, setCopilotActive] = useState(false)
  useEffect(() => {
    const run = async () => {
      props.plugin.on('settings', 'copilotChoiceChanged', (isAiActive) => {
        console.log('copilot active', isAiActive)
        setCopilotActive(isAiActive)
      })
    }
    run()
  }, [copilotActive, props.plugin.isAiActive])

  useEffect(() => {
    const run = async () => {
      props.plugin.on('filePanel', 'workspaceInitializationCompleted', async () => {
        const active = await props.plugin.isAIActive()
        setCopilotActive(active)
      })
      console.log('copilot active', copilotActive)
    }
    run()
  }, [copilotActive, props.plugin.isAiActive])
  return (
    <div className="d-flex flex-row p-1 text-white justify-content-center align-items-center">
      <span className={copilotActive === false ? "fa-regular fa-microchip-ai ml-1 text-danger" : "fa-regular fa-microchip-ai ml-1"}></span>
      <span className={copilotActive === false ? "small mx-1 text-danger" : "small mx-1" }>Remix Copilot</span>
    </div>
  )
}
