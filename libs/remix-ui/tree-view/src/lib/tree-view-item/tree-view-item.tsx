import React, {useState, useEffect} from 'react' // eslint-disable-line
import {TreeViewItemProps} from '../../types'

import './tree-view-item.css'

export const TreeViewItem = (props: TreeViewItemProps) => {
  const {id, children, label, labelClass, expand, iconX = 'fas fa-caret-right', iconY = '', icon, controlBehaviour = false, innerRef, showIcon = true, ...otherProps} = props
  const [isExpanded, setIsExpanded] = useState(false)
  console.log(props)
  useEffect(() => {
    setIsExpanded(expand)
  }, [expand])

  return (
    <li ref={innerRef} key={`treeViewLi${id}`} data-id={`treeViewLi${id}`} className="li_tv" {...otherProps}>
      <div
        key={`treeViewDiv${id}`}
        data-id={`treeViewDiv${id}`}
        className={`d-flex flex-row align-items-center ${labelClass}`}
        onClick={() => !controlBehaviour && setIsExpanded(!isExpanded)}
      >
        {children && showIcon ? (
          <div className={isExpanded ? `pl-2 ${iconY}` : `pl-2 ${iconX} caret caret_tv`} style={{visibility: children ? 'visible' : 'hidden'}}>

          </div>
        ) : icon ? (
          <div className={`pr-2 pl-2 ${icon} caret caret_tv`}></div>
        ) : null}
        <span className="w-100 ml-1 pl-2">{label}</span>
      </div>
      {isExpanded ? children : null}
    </li>
  )
}

export default TreeViewItem
