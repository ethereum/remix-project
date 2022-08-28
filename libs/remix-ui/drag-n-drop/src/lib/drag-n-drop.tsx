import { extractParentFromKey } from "@remix-ui/helper"
import React, { useContext, useRef, useState } from "react"
import { MoveContext } from "./context/moveContext"
import { DraggableType, DragType } from "./types"

export const Drag = (props: DragType) => {
  const [dragged, setDragged] = useState<string>("")

  return (
    <MoveContext.Provider
      value={{
        dragged: dragged,
        moveFile: props.onFileMoved,
        currentlyMoved: (path) => {
          setDragged(() => path)
        },
      }}
    >
      {props.children}
    </MoveContext.Provider>
  )
}

export const Draggable = (props: DraggableType) => {
  const dragRef = useRef<HTMLSpanElement>(null),
    file = props.file,
    context = useContext(MoveContext)

  const handleDrop = (event: React.DragEvent<HTMLSpanElement>) => {
    event.preventDefault()

    if (file.isDirectory) {
      context.moveFile(file.path, context.dragged)
    } else {
      const path = extractParentFromKey(file.path) || '/'

      context.moveFile(path, context.dragged)
    }
  }

  const handleDragover = (event: React.DragEvent<HTMLSpanElement>) => {
    //Checks if the folder is opened
    event.preventDefault()
    if (file.isDirectory && !props.expandedPath.includes(file.path)) {
      props.handleClickFolder(file.path, file.type)
    }
  }
  
  const handleDrag = () => {
    if (context.dragged !== file.path) {
      context.currentlyMoved(file.path)
    }
  }

  if (props.isDraggable) {
    return <>{props.children}</>
  }

  return (
    <>
      {
        props.isDraggable ? props.children :
        <span
          ref={dragRef}
          draggable
          onDrop={(event) => {
            handleDrop(event)
          }}
          onDragStart={() => {
            if (file) {
              handleDrag()
            }
          }}
          onDragOver={(event) => {
            if (file) {
              handleDragover(event)
            }
          }}
        >
          {props.children}
        </span>
      }
    </>
  )
}
