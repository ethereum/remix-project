import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap';

const popover = (
  <Popover id="popover-basic" className='bg-light border-secondary'>
    <Popover.Title as="h3" className='bg-dark border-0'>Clone workspace</Popover.Title>
      <Popover.Content>
        <div className="remixui_cloneContainer">
          <input
            className="form-control"
            placeholder="Enter clone url"
            title="Enter clone url"
          />
        </div>
      </Popover.Content>
  </Popover>
)

export const CloneWorkspace = () => (
  <OverlayTrigger trigger="click" placement={"bottom-end"} overlay={popover}>
    <i className="fas fa-cloud-download remixui_menuicon pr-0"></i>
  </OverlayTrigger>
)
