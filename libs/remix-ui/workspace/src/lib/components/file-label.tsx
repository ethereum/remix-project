// eslint-disable-next-line no-use-before-define
import {fileDecoration} from '@remix-ui/file-decorators'
import {CustomTooltip} from '@remix-ui/helper'
import {FormattedMessage} from 'react-intl'
import React, {useEffect, useRef, useState} from 'react'
import {FileType} from '../types'
export interface FileLabelProps {
  file: FileType
  focusEdit: {
    element: string
    type: string
    isNew: boolean
    lastEdit: string
  }
  fileDecorations: fileDecoration[]
  editModeOff: (content: string) => void
  dragStatus: boolean
  hover: boolean
}

export const FileLabel = (props: FileLabelProps) => {
  const {file, focusEdit, editModeOff, fileDecorations} = props
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [fileStateClasses, setFileStateClasses] = useState<string>('')

  const labelRef = useRef(null)

  useEffect(() => {
    if (focusEdit.element && file.path) {
      setIsEditable(focusEdit.element === file.path)
    }
  }, [file.path, focusEdit])

  useEffect(() => {
    const state = props.fileDecorations.find((state: fileDecoration) => {
      if (state.path === props.file.path) return true
      if (state.bubble && props.file.isDirectory && state.path.startsWith(props.file.path)) return true
    })
    if (state && state.fileStateLabelClass) {
      setFileStateClasses(state.fileStateLabelClass)
    } else {
      setFileStateClasses('')
    }
  }, [fileDecorations])

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
    if (event.which === 27) {
      event.preventDefault()
      // don't change it
      editModeOff(file.name)
    }
  }

  const handleEditBlur = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    editModeOff(labelRef.current.innerText)
    labelRef.current.innerText = file.name
  }

  // The tooltip is setted up on the label and not the whole line to avoid unnecessary tooltips on the short filenames.
  // It has the delay for the same reason.
  return (
    <div
      className="remixui_items d-inline-block w-100"
      ref={isEditable ? labelRef : null}
      suppressContentEditableWarning={true}
      contentEditable={isEditable}
      onKeyDown={handleEditInput}
      onBlur={handleEditBlur}
    >
      <div className="d-flex flex-row align-items-center w-100">
        <CustomTooltip
          placement="top"
          delay={{show: 1000, hide: 0}}
          tooltipText={`${file.path}`}
          tooltipId={`fileExplorer.${file.path}`}
          tooltipClasses="text-nowrap"
          hide={props.dragStatus}
        >
          <span className={`remixui_label ${fileStateClasses} ` + (file.isDirectory ? 'folder w-100' : 'remixui_leaf')} data-path={file.path}>
            {file.name}
          </span>
        </CustomTooltip>
        {props.hover && <div className={`d-flex flex-row align-items-center`}>
          {
            file.isDirectory ? (
              <>
                <CustomTooltip
                  placement="right-start"
                  delay={{show: 1000, hide: 0}}
                  tooltipText={<FormattedMessage id="fileExplorer.edit" />}
                  tooltipId={`fileExplorer.edit.${file.path}`}
                  tooltipClasses="text-nowrap"
                >
                  <span className="far fa-file fa-1x ml-3"></span>
                </CustomTooltip>
                <CustomTooltip
                  placement="right-start"
                  delay={{show: 1000, hide: 0}}
                  tooltipText={<FormattedMessage id="fileExplorer.edit" />}
                  tooltipId={`fileExplorer.edit.${file.path}`}
                  tooltipClasses="text-nowrap"
                >
                  <span className="far fa-folder fa-1x ml-3 mr-3"></span>
                </CustomTooltip>
              </>
            ) : null
          }
          <CustomTooltip
            placement="right-start"
            delay={{show: 1000, hide: 0}}
            tooltipText={<FormattedMessage id="fileExplorer.edit" />}
            tooltipId={`fileExplorer.edit.${file.path}`}
            tooltipClasses="text-nowrap"
          >
            <span className="far fa-pen fa-1x"></span>
          </CustomTooltip>
          <CustomTooltip
            placement="right-start"
            delay={{show: 1000, hide: 0}}
            tooltipText={<FormattedMessage id="fileExplorer.edit" />}
            tooltipId={`fileExplorer.edit.${file.path}`}
            tooltipClasses="text-nowrap"
          >
            <span className="far fa-trash fa-1x ml-3"></span>
          </CustomTooltip>
        </div>
        }
      </div>
    </div>
  )
}
