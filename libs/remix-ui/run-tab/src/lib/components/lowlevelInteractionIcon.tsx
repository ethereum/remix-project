import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { RunTab } from '../types/run-tab'
import { extractCompilerVersion } from '../actions/account'
import { RunTabState } from '../types'

export type LowLevelInteractionIconProps = {
  plugin: RunTabState
}

export function LowLevelInteractionIcon (props: LowLevelInteractionIconProps) {
  const [version, setVersion] = useState(props.plugin.compilerVersion ?? '')

  return (
    <>
      <CustomTooltip placement={'bottom-end'} tooltipClasses="text-wrap" tooltipId="receiveEthDocstoolTip" tooltipText={<FormattedMessage id="udapp.tooltipText8" />}>
        <a href={`https://solidity.readthedocs.io/en/${version}/contracts.html#receive-ether-function`} target="_blank" rel="noreferrer">
          <i aria-hidden="true" className="fas fa-info my-2 mr-1"></i>
        </a>
      </CustomTooltip>
    </>
  )
}
