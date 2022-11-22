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
  const colorDisabled = "#007aa6"
  const alternateColor = "#005e80"
  const run = (e) => {
    e.preventDefault() 
    e.stopPropagation()
  }
  return (
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
  )
}

export default StaticAnalyserButton
