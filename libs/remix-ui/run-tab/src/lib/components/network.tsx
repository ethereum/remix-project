// eslint-disable-next-line no-use-before-define
import React from 'react'
import { NetworkProps } from '../types'

export function NetworkUI (props: NetworkProps) {
  return (
    <div className="udapp_crow">
      <div className="udapp_settingsLabel">
      </div>
      <div className="udapp_environment" data-id="settingsNetworkEnv">
        <span className="udapp_network badge badge-secondary">{ props.networkName }</span>
      </div>
    </div>
  )
}
