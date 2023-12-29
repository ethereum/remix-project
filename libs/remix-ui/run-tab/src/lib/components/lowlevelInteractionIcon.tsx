import { CustomTooltip } from '@remix-ui/helper'
import React from 'react'
import { FormattedMessage } from 'react-intl'

export function LowLevelInteractionIcon () {
  const version = window.location.href.split('=')[5].split('+')[0].split('-')[1]

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
