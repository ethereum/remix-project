import React, { useState, useEffect, useRef } from 'react' // eslint-disable-line
import { TreeViewItemProps } from '../../types'

import './tree-view-item.css'

export const TreeViewItem = (props: TreeViewItemProps) => {
  const { id, children, label, labelClass, expand, iconX = 'fas fa-caret-right', iconY = 'fas fa-caret-down', icon, controlBehaviour = false, innerRef, editable, onBlur, ...otherProps } = props
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    setIsExpanded(expand)
  }, [expand])

  useEffect(() => {
    if (editable) {
      contentRef.current.focus()
    }
  }, [editable])

  const handleInput = (event) => {
    if (editable) {
      if (event.which === 13) {
        event.preventDefault()
        onBlur && onBlur(contentRef.current.innerText)
      }
    }
  }

  return (
    <li ref={innerRef} key={`treeViewLi${id}`} data-id={`treeViewLi${id}`} className='li_tv' onBlur={() => editable && onBlur(contentRef.current.innerText)} {...otherProps}>
      <div key={`treeViewDiv${id}`} data-id={`treeViewDiv${id}`} className={`d-flex flex-row align-items-center ${labelClass}`} onClick={() => !controlBehaviour && setIsExpanded(!isExpanded)}>
        { children ? <div className={isExpanded ? `px-1 ${iconY} caret caret_tv` : `px-1 ${iconX} caret caret_tv`} style={{ visibility: children ? 'visible' : 'hidden' }}></div> : icon ? <div className={`pr-3 pl-1 ${icon} caret caret_tv`}></div> : null }
        <span className='w-100 pl-1' ref={contentRef} suppressContentEditableWarning={true} contentEditable={editable} tabIndex={editable ? -3 : null} onKeyDown={handleInput}>
          { label }
        </span>
      </div>
      { isExpanded ? children : null }
    </li>
  )
}

export default TreeViewItem
