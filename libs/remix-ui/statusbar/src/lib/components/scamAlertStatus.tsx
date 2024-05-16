import React, { useState } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { ExtendedRefs, ReferenceType } from '@floating-ui/react'

export interface ScamAlertStatusProps {
  refs: ExtendedRefs<ReferenceType>
  getReferenceProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>
}

export default function ScamAlertStatus ({ refs, getReferenceProps }: ScamAlertStatusProps) {

  return (
    <>
      <div className="p-1" id="hTScamAlertSection" ref={refs.setReference} {...getReferenceProps()}>
        <span className="pr-2 text-danger far fa-exclamation-triangle" style={{ color: '#ff8559', fontSize: 'large' }}></span>
        <label className="text-white font-semibold">
          <FormattedMessage id="home.scamAlert" />
        </label>
      </div>
    </>
  )
}
