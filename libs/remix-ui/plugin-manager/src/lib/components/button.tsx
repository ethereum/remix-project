import React, { useState } from 'react'

interface ButtonProps {
  profileName: string
  deactivatePlugin?: (name: string) => {}
  activatePlugin?: (name: string) => {}
  buttonText?: string
}

function Button ({ profileName, deactivatePlugin, buttonText }: ButtonProps) {
  const [isActive, toggleIsActive] = useState(false)
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
