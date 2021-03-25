import React from 'react';
import './StaticAnalyserCheckedBox.css';

interface StaticAnalyserCheckBoxProps {
  onClick: (event) => void;
  label: string;
  inputType: string;
  name?: string;
  checked: boolean;
  id: string;
}

const StaticAnalyserCheckedBox = ({
  id,
  label,
  onClick,
  inputType,
  name,
  checked
}: StaticAnalyserCheckBoxProps) => {
  return (
    <div className="pt-1 h-80 mx-3 align-items-center listenOnNetwork_2A0YE0 custom-control custom-checkbox">
      <input
        id={id}
        type={inputType}
        onClick={onClick}
        style={{ verticalAlign: 'bottom' }}
        name={name}
        className="custom-control-input"
        checked={checked}
      />
      <label className="pt-1 form-check-label custom-control-label text-nowrap">
        {label}
      </label>
    </div>
  );
};

export default StaticAnalyserCheckedBox;
