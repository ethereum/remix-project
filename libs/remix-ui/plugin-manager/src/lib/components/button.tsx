import React, { useContext, useState } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'

interface ButtonProps {
  buttonText: 'Activate' | 'Deactivate'

}

function Button ({ buttonText }: ButtonProps) {
  const { profile, deActivatePlugin, activatePlugin } = useContext(PluginManagerContext)
  const dataId = `pluginManagerComponentDeactivateButton${profile.name}`
  const [needToDeactivate] = useState('btn btn-secondary btn-sm')
  const [needToActivate] = useState('btn btn-success btn-sm')
  return (
    <button
      onClick={buttonText === 'Activate' ? () => activatePlugin(profile.name) : () => deActivatePlugin(profile.name)}
      className={buttonText === 'Activate' ? needToActivate : needToDeactivate}
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default Button
