import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap';

const popover = (
  <Popover id="popover-basic" className='bg-light border-secondary'>
    <Popover.Title as="h3" className='bg-dark border-0'>Clone Repository</Popover.Title>
      <Popover.Content>
        <div className="remixui_cloneContainer">
          <input
            className="form-control"
            placeholder="Enter github repository url"
            title="Enter github repository url"
          />
        </div>
      </Popover.Content>
  </Popover>
)

export const CloneRepository = () => (
  <OverlayTrigger trigger="click" placement={"bottom"} overlay={popover}>
    <i className="fas fa-cloud-download remixui_menuicon pr-0 mr-2"></i>
  </OverlayTrigger>
)
