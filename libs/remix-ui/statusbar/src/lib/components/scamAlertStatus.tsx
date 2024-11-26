import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ExtendedRefs, ReferenceType } from '@floating-ui/react'
import { CustomTooltip } from '@remix-ui/helper'

export interface ScamAlertStatusProps {
  refs: ExtendedRefs<ReferenceType>
  getReferenceProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>
}

export default function ScamAlertStatus ({ refs, getReferenceProps }: ScamAlertStatusProps) {

  return (
    <>
      <CustomTooltip
        tooltipText={"Scam Alerts"}
      >
        <div className="mr-1 d-flex align-items-center justify-content-center remixui_statusbar_scamAlert" data-id="hTScamAlertButton" id="hTScamAlertSection" ref={refs.setReference} {...getReferenceProps()}>
          <span className="pr-2 far fa-exclamation-triangle text-white"></span>
          <span className="text-white font-semibold small">
            <FormattedMessage id="home.scamAlert" />
          </span>
        </div>
      </CustomTooltip>
    </>
  )
}
