import React, { useState, useEffect, useRef, useContext } from 'react'; // eslint-disable-line
import { TreeViewItemProps } from '../../types';

import './tree-view-item.css';
import { MoveContext } from '@remix-ui/workspace'
 
export const TreeViewItem = (props: TreeViewItemProps) => {
  const { id, children, label, labelClass, expand, iconX = 'fas fa-caret-right', iconY = 'fas fa-caret-down', icon, controlBehaviour = false, file, showIcon = true, ...otherProps } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<HTMLLIElement>();
  const moveContext = useContext(MoveContext)

  useEffect(() => {
    setIsExpanded(expand);
  }, [expand]);

  const handleDrop = (event: React.DragEvent<HTMLLIElement>, isDirectory: boolean,path: string) => {
    event.preventDefault()

    if (isDirectory) {
      moveContext.moveFile( path);
    }
  };

  const handleDragover = (
    event: React.DragEvent<HTMLLIElement>,
    isDirectory: boolean,
    path: string,
    type: string
  ) => {
    //Checks if the folder is opened
    event.preventDefault();
    if (isDirectory !== null && !props.expandedPaths.includes(path)) {
      props.handleClickFolder(path, type);
    }
  };


  const handleDrag = (event: React.DragEvent<HTMLLIElement>, path: string) => {
    if (moveContext.dragged !== path) {
      moveContext.currentlyMoved(path);
    }
  };
  
  return (
    <li draggable ref={dragRef} key={`treeViewLi${id}`} data-id={`treeViewLi${id}`} className="li_tv" {...otherProps} id={file ? file.path : ""}
      onDragOver={event => {
      if (file && file.isDirectory) { 
        handleDragover(event, file.isDirectory, file.path, file.type); 
      }}}
      onDrop={(event) => {handleDrop(event, file ? file.isDirectory : false ,file ? file.path : null)}}
      onDragStart={event => {
        if (file) {
          handleDrag(event, file.path);
        }
      }}
    >
      <div
        key={`treeViewDiv${id}`}
        data-id={`treeViewDiv${id}`}
        className={`d-flex flex-row align-items-center ${labelClass}`}
        onClick={() => !controlBehaviour && setIsExpanded(!isExpanded)}
      >
        {children && showIcon ? (
          <div
            className={
              isExpanded
                ? `px-1 ${iconY} caret caret_tv`
                : `px-1 ${iconX} caret caret_tv`
            }
            style={{ visibility: children ? 'visible' : 'hidden' }}
          ></div>
        ) : icon ? (
          <div className={`pr-3 pl-1 ${icon} caret caret_tv`}></div>
        ) : null}
        <span className="w-100 pl-1">{label}</span>
      </div>
      {isExpanded ? children : null}
    </li>
  );
};

export default TreeViewItem;
