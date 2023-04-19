import React from 'react' // eslint-disable-line
import { TreeViewProps } from '../types'

import './remix-ui-tree-view.css'

export const TreeView = (props: TreeViewProps) => {
  const { children, id, ...otherProps } = props

  return (
    <ul data-id={`treeViewUl${id}`} className="ul_tv ml-0 pl-2" { ...otherProps }>
      { children }
    </ul>
  )
}

export default TreeView
