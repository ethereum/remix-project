import React from 'react'
import copy from 'copy-text-to-clipboard'

import './copy-to-clipboard.css'

export const CopyToClipboard = ({ content, tip='Copy value to clipboard', icon='fa-copy', ...otherProps }) => {
  const handleClick = () => {
    if (content) {   // module `copy` keeps last copied thing in the memory, so don't show tooltip if nothing is copied, because nothing was added to memory
      try {
        if (typeof content !== 'string') {
          content = JSON.stringify(content, null, '\t')
        }
      } catch (e) {
        console.error(e)
      }
      copy(content)
      // addTooltip('Copied value to clipboard.')
    } else {
      // addTooltip('Cannot copy empty content!')
    }
  }

  return (
    <i 
      title={tip}
      className={`copyIcon far ${icon} p-2`}
      data-id="copyToClipboardCopyIcon"
      aria-hidden="true"
      {...otherProps}
      onClick={handleClick}
    ></i>
  )
}

export default CopyToClipboard
