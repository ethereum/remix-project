import React from 'react';
import { Fragment } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CustomTooltipType } from '../../types/customtooltip'


export function CustomTooltip({ children, placement, tooltipId, tooltipClasses, tooltipText, tooltipTextClasses }: CustomTooltipType) {

  return (
    <Fragment>
      <OverlayTrigger
        placement={placement}
        overlay={
          <Tooltip id={!tooltipId ? `${tooltipText}Tooltip` : tooltipId} className={tooltipClasses}>
            <span className={tooltipTextClasses}>{tooltipText}</span>
          </Tooltip>
        }
      >
        {children}
      </OverlayTrigger>
    </Fragment>
  )
}
