import React from 'react'

interface ButtonProps {
  profileName: string
  deactivatePlugin?: (name: string) => {}
  activatePlugin?: (name: string) => {}
  isActive: boolean
  buttonText?: string
}

function Button ({ profileName, deactivatePlugin, buttonText }: ButtonProps) {
  const dataId = `pluginManagerComponentDeactivateButton${profileName}`

  return (
    <button
      onClick={() => deactivatePlugin(profileName)}
      className="btn btn-secondary btn-sm"
      data-id={dataId}
    >
      {buttonText}
    </button>
  )
}
export default Button
