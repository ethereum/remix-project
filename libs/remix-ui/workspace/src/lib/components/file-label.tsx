// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import { FileType } from '../types'

export interface FileLabelProps {
  file: FileType,
  focusEdit: {
    element: string
    type: string
    isNew: boolean
    lastEdit: string
  }
  editModeOff: (content: string) => void
}

export const FileLabel = (props: FileLabelProps) => {
  const { file, focusEdit, editModeOff } = props
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const labelRef = useRef(null)

  useEffect(() => {
    if (focusEdit.element && file.path) {
      setIsEditable(focusEdit.element === file.path)
    }
  }, [file.path, focusEdit])

  useEffect(() => {
    if (labelRef.current) {
      setTimeout(() => {
        labelRef.current.focus()
      }, 0)
    }
  }, [isEditable])

  const handleEditInput = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.which === 13) {
      event.preventDefault()
      editModeOff(labelRef.current.innerText)
      labelRef.current.innerText = file.name
    }
  }

  const handleEditBlur = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    editModeOff(labelRef.current.innerText)
    labelRef.current.innerText = file.name
  }

  return (
    <div
      className='remixui_items d-inline-block w-100 text-break'
      ref={isEditable ? labelRef : null}
      suppressContentEditableWarning={true}
      contentEditable={isEditable}
      onKeyDown={handleEditInput}
      onBlur={handleEditBlur}
    >
      <span
        title={file.path}
        className={'text-nowrap remixui_label ' + (file.isDirectory ? 'folder' : 'remixui_leaf')}
        data-path={file.path}
      >
        { file.name }
      </span>
    </div>
  )
}
