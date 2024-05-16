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
      <div className="bg-danger p-1" id="hTScamAlertSection" ref={refs.setReference} {...getReferenceProps()}>
        <label className="text-white small">
          <FormattedMessage id="home.scamAlert" />
        </label>
      </div>
    </>
  )
}
