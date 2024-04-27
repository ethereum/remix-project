import React, { useContext } from 'react'
import { gitPluginContext } from '../gitui'

interface ButtonWithContextProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  disabledCondition?: boolean; // Optional additional disabling condition
  // You can add other props if needed, like 'type', 'className', etc.
  [key: string]: any; // Allow additional props to be passed
}

// This component extends a button, disabling it when loading is true
const GitUIButton = ({children, disabledCondition = false, ...rest }:ButtonWithContextProps) => {
  const { loading } = React.useContext(gitPluginContext)

  const isDisabled = loading || disabledCondition
  return (
    <button disabled={isDisabled} {...rest}>
      {children}
    </button>
  );
};

export default GitUIButton;