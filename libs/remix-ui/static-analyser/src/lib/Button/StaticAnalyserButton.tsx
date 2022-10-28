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
        placement="bottom-start"
        tooltipId="ssaRunButtonTooltip"
        tooltipClasses="text-nowrap"
        tooltipText={title}
      >
        <span>
          {buttonText}
        </span>
      </CustomTooltip>
    </button>
  )
}

export default StaticAnalyserButton
