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
        placement="bottom-start"
        tooltipId="ssaRunButtonTooltip"
        tooltipClasses="text-nowrap"
        tooltipText={title}
      >
        <div data-id="staticAnalyserButton" className={classList} onClick={(e) => {
          disabled ? run(e) : onClick(e)
          }} style={{ backgroundColor: disabled ? alternateColor : colorDisabled, borderColor: disabled ? alternateColor : colorDisabled,
           }}>
          <button className="btn btn-link text-decoration-none" disabled={disabled} onClick={onClick} style={{ pointerEvents: "none"}} id="staticAnalyserButton" data-id="staticAnalyserButton">
              <span>
                {buttonText}
              </span>
          </button>
        </div>
      </CustomTooltip>
  )
}

export default StaticAnalyserButton
