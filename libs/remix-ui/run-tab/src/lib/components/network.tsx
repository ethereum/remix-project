// eslint-disable-next-line no-use-before-define
import React from 'react'
import { NetworkProps } from '../types'

export function NetworkUI(props: NetworkProps) {
  return (
    <div className="">
      <div className="udapp_settingsLabel"></div>
      <div className="" data-id="settingsNetworkEnv">
        <span className="udapp_network badge text-bg-secondary">{props.networkName}</span>
      </div>
    </div>
  )
}
