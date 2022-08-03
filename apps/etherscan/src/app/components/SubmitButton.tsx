import React from "react"

interface Props {
  text: string
  isSubmitting?: boolean
<<<<<<< HEAD
  dataId?: string
=======
>>>>>>> e02014ca4 (add etherscan plugin)
}

export const SubmitButton: React.FC<Props> = ({
  text,
<<<<<<< HEAD
  dataId,
=======
>>>>>>> e02014ca4 (add etherscan plugin)
  isSubmitting = false,
}) => {
  return (
    <button
<<<<<<< HEAD
      data-id={dataId}
=======
>>>>>>> e02014ca4 (add etherscan plugin)
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
<<<<<<< HEAD
          Verifying... Please wait
=======
          Verifying...Please wait
>>>>>>> e02014ca4 (add etherscan plugin)
        </div>
      )}
    </button>
  )
}
