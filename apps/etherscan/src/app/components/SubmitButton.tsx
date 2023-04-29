import React from "react"

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
    <button
      data-id={dataId}
      style={{ padding: "0.25rem 0.4rem", marginRight: "0.5em" }}
      type="submit"
      className="btn btn-primary"
      disabled={disable}
      title={disable ? "Fill all the fields with valid values" : "Click to proceed"}
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
  )
}
