import { Provider } from '@remix-ui/environment-explorer'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { EnvDropdownLabelStateType, RunTabState } from '../types'
import { current } from '@reduxjs/toolkit'

export type DropDownLabelProps = {
  label: string
  bridges: any
  currentProvider: any
  chainId: string
  runTabState: RunTabState
  setExecutionEnv: (executionContext: {
    context: string;
  }) => void
  isL2: (providerDisplayName: string) => boolean
  plugin: any
}

export function DropdownLabel({ label, bridges, currentProvider, chainId, runTabState, setExecutionEnv, isL2, plugin }: DropDownLabelProps) {

  const [renderLabel, setRenderLabel] = useState(label)
  const [selectedEnvs, setSelectedEnvs] = useState<EnvDropdownLabelStateType[]>([])

  useEffect(() => {
    const checkEnvLabels = async () => {
      if (selectedEnvs.length === 0) {
        const envLabels = await plugin.call('udapp', 'getEnvironmentDropdownLabels')
        setSelectedEnvs(envLabels)
      }
    }
    checkEnvLabels()
    const selectedEnv = selectedEnvs.find(env => (env.chainId === chainId && env.value === runTabState.selectExEnv) || (env.value === 'walletconnect' && env.value === currentProvider?.name))
    if (selectedEnv) {
      setRenderLabel(selectedEnv.name)
      setExecutionEnv({ context: selectedEnv.value })
    } else {
      setRenderLabel('Injected Provider - MetaMask')
    }
  }, [chainId, currentProvider && currentProvider.name])

  return (
    <>
      <span>{renderLabel}</span>
      {isL2(renderLabel) && bridges[renderLabel.substring(0, 13)] && (
        <CustomTooltip placement={'auto-end'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText3" />}>
          <i
            style={{ fontSize: 'medium' }}
            className={'ml-1 fa fa-rocket-launch'}
            aria-hidden="true"
            onClick={() => {
              window.open(bridges[currentProvider.displayName.substring(0, 13)], '_blank')
            }}
          ></i>
        </CustomTooltip>
      )}
    </>
  )
}
