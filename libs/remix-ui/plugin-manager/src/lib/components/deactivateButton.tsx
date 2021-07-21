import React, { useState } from 'react'
import { PluginManagerComponent } from '../../types'

interface DeactivateButtonProps {
  buttonText: string
  pluginName: string
  pluginComponent: PluginManagerComponent
}

function DeactivateButton ({
  buttonText,
  pluginName,
  pluginComponent
}: DeactivateButtonProps) {
  const [dataId] = useState(`pluginManagerComponent${buttonText}Button${pluginName}`)
  return (
    <button
      onClick={() => {
        pluginComponent.deactivateP(pluginName)
      }}
      className={buttonText === 'Deactivate' ? 'btn btn-secondary btn-sm' : ''}
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default DeactivateButton
