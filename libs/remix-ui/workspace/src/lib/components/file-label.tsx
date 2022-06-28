// eslint-disable-next-line no-use-before-define
import { fileState } from '@remix-ui/file-states'
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
  fileState: fileState[],
  editModeOff: (content: string) => void
}

export const FileLabel = (props: FileLabelProps) => {
  const { file, focusEdit, editModeOff, fileState } = props
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [fileStateClasses, setFileStateClasses] = useState<string>('')
  const labelRef = useRef(null)

  useEffect(() => {
    if (focusEdit.element && file.path) {
      setIsEditable(focusEdit.element === file.path)
    }
  }, [file.path, focusEdit])

  useEffect(() => {
    console.log('fileState', fileState, file.name)
    const state = props.fileState.find((state: fileState) => {
      console.log('FOUND STATE', state)
      if(state.path === props.file.path) return true
      if(state.bubble && props.file.isDirectory && state.path.startsWith(props.file.path)) return true
    })
    if (state && state.fileStateLabelClass) {
      setFileStateClasses(state.fileStateLabelClass)
    }
  }, [fileState])

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
        className={`text-nowrap remixui_label ${fileStateClasses} ` + (file.isDirectory ? 'folder' : 'remixui_leaf')}
        data-path={file.path}
      >
        {file.name}
      </span>
    </div>
  )
}
