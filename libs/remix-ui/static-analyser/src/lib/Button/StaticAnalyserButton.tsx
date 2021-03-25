import React from 'react';
import './StaticAnalyserButton.css';

interface StaticAnalyserButtonProps {
  onClick: (event) => void;
  buttonText: string;
}

const StaticAnalyserButton = ({
  onClick,
  buttonText
}: StaticAnalyserButtonProps) => {
  return (
    <div className="remixui-button-container">
      <button className="btn btn-sm w-31 btn-primary" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default StaticAnalyserButton;
