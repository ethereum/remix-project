import React, { useState } from 'react'
import { TreeViewItemProps } from '../../types'

import './tree-view-item.css'

export const TreeViewItem = (props: TreeViewItemProps) => {
  const { id, children, label, ...otherProps } = props
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <li key={`treeViewLi${id}`} data-id={`treeViewLi${id}`} className='li_tv' {...otherProps}>
      <div key={`treeViewDiv${id}`} data-id={`treeViewDiv${id}`} className='d-flex flex-row align-items-center' onClick={() => setIsExpanded(!isExpanded)}>
        <div className={isExpanded ? 'px-1 fas fa-caret-down caret caret_tv' : 'px-1 fas fa-caret-right caret caret_tv'}  style={{ visibility: children ? 'visible' : 'hidden' }}></div>
        <span className='w-100 pl-1'>
          { label }
        </span>
      </div>
    { isExpanded ? children : null }
    </li>
  )
}

export default TreeViewItem
