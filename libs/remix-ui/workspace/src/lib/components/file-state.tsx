// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { FileType, fileState, fileStateType } from '../types'
import FileStateModified from './filestates/file-state-modified'
import FileStateUntracked from './filestates/file-state-untracked'

export type fileStateProps = {
    file: FileType,
    fileState: fileState[]
}

export const FileState = (props: fileStateProps) => {
  const [state, setState] = useState<fileState>(undefined)
  useEffect(() => {
    console.log(props.file)
    console.log(props.fileState)
    setState(props.fileState.find((st) => st.path === props.file.path))
  }, [props.fileState])

  const getTags = function () {
    if (state) {
      const types = state.fileStateType
      const elements: any[] = []

      for (const type of types) {
        switch (type) {
          case fileStateType.Modified:
            elements.push(<FileStateModified key={type}/>)
            break
          case fileStateType.Untracked:
            elements.push(<FileStateUntracked key={type}/>)
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

export default FileState
