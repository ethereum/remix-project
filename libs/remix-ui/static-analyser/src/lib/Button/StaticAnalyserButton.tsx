import { CustomTooltip } from '@remix-ui/helper'
import React from 'react'  //eslint-disable-line

interface StaticAnalyserButtonProps {
  onClick: (event) => void
  buttonText: string,
  disabled?: boolean,
  title?: string
}

const StaticAnalyserButton = ({
  onClick,
  buttonText,
  disabled,
  title
}: StaticAnalyserButtonProps) => {
  let classList = "btn btn-sm w-25 btn-primary"
  classList += disabled ? " disabled" : ""
  return (
    <button className={classList} disabled={disabled} onClick={onClick}>
      <CustomTooltip
        placement="right"
        tooltipId="ssaRunButtonTooltip"
        tooltipClasses="text-nowrap"
        tooltipText={title}
      >
        <span className="pl-3 pr-4">
          {buttonText}
        </span>
      </CustomTooltip>
    </button>
  )
}

export default StaticAnalyserButton
