import React from 'react'
import { TreeViewProps } from '../types'

import './remix-ui-tree-view.css'

export const TreeView = (props: TreeViewProps) => {
  const { children, key, ...otherProps } = props
  
  return (
    <ul data-id={`treeViewUl${key}`} className="ul_tv ml-0 px-2" { ...otherProps }>
      { children }
    </ul>
  )
}

export default TreeView
