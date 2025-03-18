import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { RunTabState } from '../types'

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

  useEffect(() => {
    const checkEnvLabels = async () => {
      const selectedEnvs = await plugin.call('blockchain', 'getAllProviders')
      const selectedEnv = selectedEnvs[runTabState.selectExEnv]
      if (selectedEnv) {
        setRenderLabel(selectedEnv.displayName)
        setExecutionEnv({ context: selectedEnv.value })
      } else {
        setRenderLabel('No provider set')
      }
    }
    checkEnvLabels()
  }, [chainId])

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
