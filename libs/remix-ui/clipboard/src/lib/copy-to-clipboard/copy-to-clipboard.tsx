import React, { useState } from 'react'
import copy from 'copy-text-to-clipboard'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

import './copy-to-clipboard.css'

export const CopyToClipboard = ({ content, tip='Copy', icon='fa-copy', ...otherProps }) => {
  const [message, setMessage] = useState(tip)
  const handleClick = () => {
    if (content && content !== '') {   // module `copy` keeps last copied thing in the memory, so don't show tooltip if nothing is copied, because nothing was added to memory
      try {
        if (typeof content !== 'string') {
          content = JSON.stringify(content, null, '\t')
        }
      } catch (e) {
        console.error(e)
      }
      copy(content)
      setMessage('Copied')
    } else {
      setMessage('Cannot copy empty content!')
    }
  }

  const reset = () => {
    setTimeout(() => setMessage('Copy'), 500)
  }

  return (
    <a href="#" onClick={handleClick} onMouseLeave={reset}>
      <OverlayTrigger placement="right" overlay={
        <Tooltip id="overlay-tooltip">
            { message }
        </Tooltip>
      }>
        <i className={`far ${icon} ml-1 p-2`} data-id="copyToClipboardCopyIcon" aria-hidden="true"
          {...otherProps}
        ></i>
      </OverlayTrigger>
    </a>
  )
}

export default CopyToClipboard
