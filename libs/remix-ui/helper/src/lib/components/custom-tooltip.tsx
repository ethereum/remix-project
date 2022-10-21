import React from 'react';
import { Fragment } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CustomTooltipType } from '../../types/customtooltip'


function CustomTooltip({ children, placement, tooltipId, tooltipClasses, tooltipText }: CustomTooltipType) {

  return (
    <Fragment>
      <OverlayTrigger
        placement={placement}
        overlay={
          <Tooltip id={tooltipId ?? `${tooltipText}Tooltip`} className={tooltipClasses}>
            <span>{tooltipText}</span>
          </Tooltip>
        }
      >
        {children}
      </OverlayTrigger>
    </Fragment>
  )
}