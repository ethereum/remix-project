import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { TooltipPopupProps } from '../types'
import './tooltip-popup.module.css'

const popover = (title?: string, content?: string | React.ReactNode) => (
  <Popover id="popover-basic" className='bg-light border-secondary'>
    <Popover.Title as="h3" className='bg-dark border-0'>{ title || 'Tooltip' }</Popover.Title>
      <Popover.Content>
        { content }
      </Popover.Content>
  </Popover>
)

export function TooltipPopup(props: TooltipPopupProps) {
  return (
    <OverlayTrigger trigger="click" placement={"bottom"} overlay={popover(props.title, props.children || props.content)}>
      <i className={`${props.icon} remixui_menuicon pr-0 mr-2`}></i>
    </OverlayTrigger>
  )
}

export default TooltipPopup
