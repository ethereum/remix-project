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
      <div className="mr-2" id="hTScamAlertSection" ref={refs.setReference} {...getReferenceProps()}>
        <span className="pr-2 far fa-exclamation-triangle" style={{ color: '#ff8559' }}></span>
        <label className="text-white font-semibold">
          <FormattedMessage id="home.scamAlert" />
        </label>
      </div>
    </>
  )
}
