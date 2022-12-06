import React from 'react' // eslint-disable-line
import { TreeViewProps } from '../types'

import './remix-ui-tree-view.css'

export const TreeView = (props: TreeViewProps) => {
  const { children, id, ...otherProps } = props

  return (
    <div className='pb-4 mb-4'>
      <ul data-id={`treeViewUl${id}`} className="ul_tv ml-0 pl-2 mb-2" { ...otherProps }>
        { children }
      </ul>
    </div>
  )
}

export default TreeView
