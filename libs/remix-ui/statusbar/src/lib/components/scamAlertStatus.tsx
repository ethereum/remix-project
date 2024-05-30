import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ExtendedRefs, ReferenceType } from '@floating-ui/react'

export interface ScamAlertStatusProps {
  refs: ExtendedRefs<ReferenceType>
  getReferenceProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>
}

export default function ScamAlertStatus ({ refs, getReferenceProps }: ScamAlertStatusProps) {

  return (
    <>
      <div className="mr-2 d-flex align-items-center justify-content-center" id="hTScamAlertSection" ref={refs.setReference} {...getReferenceProps()}>
        <span className="pr-2 far fa-exclamation-triangle text-danger"></span>
        <span className="text-white font-semibold small">
          <FormattedMessage id="home.scamAlert" />
        </span>
      </div>
    </>
  )
}
