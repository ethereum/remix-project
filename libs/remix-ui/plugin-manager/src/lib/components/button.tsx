import React, { useContext, useState } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'

interface ButtonProps {
  buttonText: 'Activate' | 'Deactivate'
  pluginName: string
}

function Button ({ buttonText, pluginName }: ButtonProps) {
  const { pluginComponent } = useContext(PluginManagerContext)
  const dataId = `pluginManagerComponentDeactivateButton${pluginName}`
  const [needToDeactivate] = useState('btn btn-secondary btn-sm')
  const [needToActivate] = useState('btn btn-success btn-sm')
  return (
    <button
      onClick={buttonText === 'Activate' ? () => {
        pluginComponent.activateP(pluginName)
        buttonText = 'Deactivate'
      } : () => {
        pluginComponent.deactivateP(pluginName)
        buttonText = 'Activate'
      }}
      className={buttonText === 'Activate' ? needToActivate : needToDeactivate}
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default Button
