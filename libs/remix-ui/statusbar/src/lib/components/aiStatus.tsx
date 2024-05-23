// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
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
        console.log('copilot active', aiActivate)
        setCopilotActive(aiActivate)
      })
    }
    run()
  }, [props.plugin.isAiActive, props.isAiActive])

  useEffect(() => {
    const run = async () => {
      props.plugin.on('filePanel', 'workspaceInitializationCompleted', async (work) => {
        const aiActivate = await props.plugin.call('settings', 'get', 'settings/copilot/suggest/activate')
        const active = await props.plugin.isAIActive(aiActivate)
        setCopilotActive(active)
      })
      console.log('copilot active', copilotActive)
    }
    run()
  }, [props.plugin.isAiActive])
  return (
    <div className="d-flex flex-row p-1 text-white justify-content-center align-items-center">
      <span className={copilotActive === false ? "fa-regular fa-microchip-ai ml-1 text-danger" : "fa-regular fa-microchip-ai ml-1"}></span>
      <span className={copilotActive === false ? "small mx-1 text-danger" : "small mx-1" }>Remix Copilot</span>
    </div>
  )
}
