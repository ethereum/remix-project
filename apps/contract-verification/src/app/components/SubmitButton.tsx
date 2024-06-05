import React from 'react'
import {CustomTooltip} from '@remix-ui/helper'

interface Props {
  text: string
  isSubmitting?: boolean
  dataId?: string
  disable?: boolean
}

export const SubmitButton = ({text, dataId, isSubmitting = false, disable = true}) => {
  return (
    <div>
      <button data-id={dataId} type="submit" className="btn btn-primary btn-block p-1 text-decoration-none" disabled={disable}>
        <CustomTooltip
          tooltipText={disable ? 'Fill in the valid value(s) and select a supported network' : 'Click to proceed'}
          tooltipId={'etherscan-submit-button-' + dataId}
          tooltipTextClasses="border bg-light text-dark p-1 pr-3"
          placement="bottom"
        >
          <div>
            {!isSubmitting && text}
            {isSubmitting && (
              <div>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true" />
                Verifying... Please wait
              </div>
            )}
          </div>
        </CustomTooltip>
      </button>
    </div>
  )
}
