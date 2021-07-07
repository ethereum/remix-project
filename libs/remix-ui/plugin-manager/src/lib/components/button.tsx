import React, { useContext } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'

interface ButtonProps {
  buttonText: 'Activate' | 'Deactivate'
}

function Button ({ buttonText }: ButtonProps) {
  const { profile, deActivatePlugin, activatePlugin } = useContext(PluginManagerContext)
  const dataId = `pluginManagerComponentDeactivateButton${profile.name}`

  return (
    <button
      onClick={buttonText === 'Activate' ? () => activatePlugin(profile.name) : () => deActivatePlugin(profile.name)}
      className="btn btn-secondary btn-sm"
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default Button
