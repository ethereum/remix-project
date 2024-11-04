// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useContext, useEffect, useState } from 'react'
import { appActionTypes, AppContext } from '@remix-ui/app'

interface AIStatusProps {
  plugin: StatusBar
  isAiActive: boolean
  setIsAiActive: (isAiActive: boolean) => void
  aiActive: () => Promise<any>
}

export default function AIStatus(props: AIStatusProps) {
  const [copilotActive, setCopilotActive] = useState(false)
  const appContext = useContext(AppContext)
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
    <div>
      <CustomTooltip
        tooltipText={copilotActive ? "Disable RemixAI Copilot" : "Enable RemixAI Copilot. Switch to .sol file to try it."}
      >
        <span
          style={{ cursor: 'pointer' }}
          className={"small mx-1 bg-info border-0 text-white " + (copilotActive === false ? "semi-bold" : "")}
          onClick={async () => {
            await props.plugin.call('settings' as any, 'updateCopilotChoice', !copilotActive)
          }}
        >
          {copilotActive === false ? 'RemixAI Copilot (disabled)' : 'RemixAI Copilot (enabled)'}
        </span>
      </CustomTooltip>
      <div className="d-flex text-sm flex-row pr-2 text-white justify-content-center align-items-center">
        <button
          style={{
            position: 'absolute',
            bottom: '0.7rem',
            right: '0.3rem',
            height: '3rem',
            width: '3rem',
            borderRadius: '50%',
            color: 'var(--ai)',
            boxShadow: '3px 3px var(--secondary), -0.1em 0 1.4em var(--secondary)'
          }}
          data-id="aiStatusButton"
          className='p-1 alert alert-info border border-info fa-solid fa-message-bot'
          onClick={async () => {
            appContext.appStateDispatch({
              type: appActionTypes.setShowPopupPanel,
              payload: !appContext.appState.showPopupPanel
            })
          }}
        >

        </button>
      </div>
    </div>
  )
}