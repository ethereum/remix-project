import React, { useContext, forwardRef } from 'react'
import { gitPluginContext } from '../gitui'
import { CustomTooltip } from '@remix-ui/helper';

interface ButtonWithContextProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  disabledCondition?: boolean; // Optional additional disabling condition
  // You can add other props if needed, like 'type', 'className', etc.
  [key: string]: any; // Allow additional props to be passed
  tooltip?: string | JSX.Element;
}

// This component extends a button, disabling it when loading is true
const GitUIButton = forwardRef<HTMLButtonElement, ButtonWithContextProps>(({ children, disabledCondition = false, ...rest }, ref) => {
  const { loading } = React.useContext(gitPluginContext)

  const isDisabled = loading || disabledCondition

  if (rest.tooltip) {

    return (
      <CustomTooltip tooltipText={rest.tooltip} placement="top">
        <button ref={ref} disabled={isDisabled} {...rest}>
          {children}
        </button>
      </CustomTooltip>
    );
  } else {
    return (
      <button ref={ref} disabled={isDisabled} {...rest}>
        {children}
      </button>
    );
  }
});

GitUIButton.displayName = 'GitUIButton';

export default GitUIButton;