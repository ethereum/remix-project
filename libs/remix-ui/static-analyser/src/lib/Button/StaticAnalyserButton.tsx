import React from 'react'  //eslint-disable-line
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

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
      <OverlayTrigger
        placement="bottom-start"
        overlay={
          <Tooltip id="ssaRunButtonTooltip" className="text-nowrap">
            <span>{title}</span>
          </Tooltip>
        }
      >
        <span>
          {buttonText}
        </span>
      </OverlayTrigger>
    </button>
  )
}

export default StaticAnalyserButton
