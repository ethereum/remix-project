import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  icon?: string;
}

const DynamicButtons: React.FC<{ buttons: ButtonProps[] }> = ({ buttons }) => {
  return (
    <div className="dynamic-buttons">
      {buttons.map((button, index) => (
        <button key={index} onClick={button.onClick}>
          {button.icon && <i className={button.icon}></i>}
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default DynamicButtons;