import React, { useState } from 'react'
import copy from 'copy-to-clipboard'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Placement } from 'react-bootstrap/esm/Overlay'

import './copy-to-clipboard.css'

interface ICopyToClipboard {
  content?: any,
  tip?: string,
  icon?: string,
  direction?: Placement,
  className?: string,
  title?: string,
  children?: JSX.Element,
  getContent?: () => any
}
export const CopyToClipboard = (props: ICopyToClipboard) => {
  const { tip = 'Copy', icon = 'fa-copy', direction = 'right', getContent, children, ...otherProps } = props
  let { content } = props
  const [message, setMessage] = useState(tip)

  const copyData = () => {
    try {
      if (content === '') {
        setMessage('Cannot copy empty content!')
        return
      }
      if (typeof content !== 'string') {
        content = JSON.stringify(content, null, '\t')
      }
      copy(content)
      setMessage('Copied')
    } catch (e) {
      console.error(e)
    }
  }

  const handleClick = (e) => {
    if (content) { // module `copy` keeps last copied thing in the memory, so don't show tooltip if nothing is copied, because nothing was added to memory
      copyData()
    } else {
      content = getContent && getContent()
      copyData()
    }
    e.preventDefault()
  }

  const reset = () => {
    setTimeout(() => setMessage(tip), 500)
  }

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href='#' onClick={handleClick} onMouseLeave={reset}>
      <OverlayTrigger placement={direction} overlay={
        <Tooltip id="overlay-tooltip">
          { message }
        </Tooltip>
      }>
        {
          children || (<i className={`far ${icon} ml-1 p-2`} aria-hidden="true"
            {...otherProps}
          ></i>)
        }
      </OverlayTrigger>
    </a>
  )
}

export default CopyToClipboard
