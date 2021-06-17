import React from 'react'  //eslint-disable-line

interface StaticAnalyserButtonProps {
  onClick: (event) => void
  buttonText: string,
  disabled?: boolean
}

const StaticAnalyserButton = ({
  onClick,
  buttonText,
  disabled
}: StaticAnalyserButtonProps) => {
  return (
    <button className="btn btn-sm w-25 btn-primary" onClick={onClick} disabled={disabled}>
      {buttonText}
    </button>
  )
}

export default StaticAnalyserButton
