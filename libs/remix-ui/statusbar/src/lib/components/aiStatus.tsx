// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StatusBar } from 'apps/remix-ide/src/app/components/status-bar'
import React from 'react'

interface AIStatusProps {
  plugin: StatusBar
  isAiActive: boolean
  aiActive: () => Promise<any>
}

export default function AIStatus(props: AIStatusProps) {
  return (
    <div className={props.aiActive() ? "d-flex flex-row p-1 text-white justify-content-center align-items-center bg-body-tertiary" : "d-flex flex-row p-1 text-white justify-content-center align-items-center"}>
      <span className="fa-regular fa-microchip-ai ml-1"></span>
      <span className="small mx-1">Remix Copilot</span>
    </div>
  )
}
