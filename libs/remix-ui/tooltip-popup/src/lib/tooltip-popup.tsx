import React, { useState } from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { TooltipPopupProps } from '../types'
import './tooltip-popup.module.css'

const popover = (title?: string, content?: string | React.ReactNode) => (
  <Popover id="popover-basic" className='bg-danger border-danger'>
    <Popover.Title as="h3" className='bg-warning border-0'>{ title || 'Tooltip' }</Popover.Title>
      <Popover.Content className='bg-danger border-info'>
        { content }
      </Popover.Content>
  </Popover>
)

export function TooltipPopup(props: TooltipPopupProps) {
  const [show, setShow] = useState<boolean>(false)

  return (
    <OverlayTrigger trigger="click" placement={"bottom"} overlay={popover(props.title, props.children || props.content)} show={show} onToggle={(nextShow) => {
      setShow(nextShow)
    }}>
      <i className={`${props.icon} remixui_menuicon pr-0 mr-2`}></i>
    </OverlayTrigger>
  )
}

export default TooltipPopup
