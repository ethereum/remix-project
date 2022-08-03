import React from "react"

interface Props {
  text: string
  isSubmitting?: boolean
}

export const SubmitButton: React.FC<Props> = ({
  text,
  isSubmitting = false,
}) => {
  return (
    <button
      style={{ padding: "0.25rem 0.4rem", marginRight: "0.5em" }}
      type="submit"
      className="btn btn-primary"
      disabled={isSubmitting}
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
          Verifying...Please wait
        </div>
      )}
    </button>
  )
}
