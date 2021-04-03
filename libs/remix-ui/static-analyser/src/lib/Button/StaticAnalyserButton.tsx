import React from 'react'
import './StaticAnalyserButton.css'

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
    <div className="remixui-button-container">
      <button className="btn btn-sm w-31 btn-primary" onClick={onClick} disabled={disabled}>
        {buttonText}
      </button>
    </div>
  );
};

export default StaticAnalyserButton
