import React from "react"
import { CustomTooltip } from '@remix-ui/helper'

interface Props {
  text: string
  isSubmitting?: boolean
  dataId?: string
  disable?: boolean
}

export const SubmitButton: React.FC<Props> = ({
  text,
  dataId,
  isSubmitting = false,
  disable = true
}) => {
  return (
    <CustomTooltip
      tooltipText={disable ? "Fill the fields with valid values" : "Click to proceed"}
      tooltipId='etherscan-submit-button'
      placement='bottom'
    >
      <div>
        <button
          data-id={dataId}
          style={{ padding: "0.25rem 0.4rem", marginRight: "0.5em" }}
          type="submit"
          className="btn btn-primary btn-block text-decoration-none"
          disabled={disable}
        >
          {!isSubmitting && text}
          {isSubmitting && (
            <div>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                style={{ marginRight: "0.3em" }}
              />
              Verifying... Please wait
            </div>
          )}
        </button>
      </div>
    </CustomTooltip>
  )
}
