// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'

import { fileDecoration, fileDecorationType, FileType } from '../types'
import FileDecorationCustomIcon from './filedecorationicons/file-decoration-custom-icon'
import FileDecorationErrorIcon from './filedecorationicons/file-decoration-error-icon'
import FileDecorationTooltip from './filedecorationicons/file-decoration-tooltip'
import FileDecorationWarningIcon from './filedecorationicons/file-decoration-warning-icon'

export type fileDecorationProps = {
  file: FileType,
  fileDecorations: fileDecoration[]
}

export const FileDecorationIcons = (props: fileDecorationProps) => {
  const [states, setStates] = useState<fileDecoration[]>([])
  useEffect(() => {
    setStates(props.fileDecorations.filter((fileDecoration) => fileDecoration.path === props.file.path || `${fileDecoration.workspace.name}/${fileDecoration.path}` === props.file.path))
  }, [props.fileDecorations])

  const getTags = function () {
    if (states && states.length) {
      const elements: JSX.Element[] = []

      for (const [index, state] of states.entries()) {
        switch (state.fileStateType) {
          case fileDecorationType.Error:
            elements.push(<FileDecorationTooltip key={index} index={index} fileDecoration={state} icon={<FileDecorationErrorIcon fileDecoration={state} key={index}/>}/>)
            break
          case fileDecorationType.Warning:
            elements.push(<FileDecorationTooltip key={index} index={index} fileDecoration={state} icon={<FileDecorationWarningIcon fileDecoration={state} key={index}/>}/>)
            break
          case fileDecorationType.Custom:
            elements.push(<FileDecorationTooltip key={index} index={index} fileDecoration={state} icon={<FileDecorationCustomIcon fileDecoration={state} key={index}/>}/>)
            break
        }
      }
      return elements
    }
  }

  return <>
    {getTags()}
  </>
}

export default FileDecorationIcons