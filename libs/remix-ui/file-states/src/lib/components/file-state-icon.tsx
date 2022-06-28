// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'

import { fileState, fileStateType, FileType } from '../types'
import FileStateCustomIcon from './filestates/file-state-custom-icon'
import FileStateErrorIcon from './filestates/file-state-error-icon'
import FileStateWarningIcon from './filestates/file-state-warning-icon'

export type fileStateProps = {
    file: FileType,
    fileState: fileState[]
}

export const FileStateIcons = (props: fileStateProps) => {
    const [states, setStates] = useState<fileState[]>([])
    useEffect(() => {
        //console.log(props.file)
        //console.log(props.fileState)
        setStates(props.fileState.filter((st) => st.path === props.file.path))
    }, [props.fileState])

    const getTags = function () {
        if (states && states.length) {
            const elements: JSX.Element[] = []

            for (const [index, state] of states.entries()) {
                switch (state.fileStateType) {
                    case fileStateType.Error:
                        elements.push(<FileStateErrorIcon fileState={state} key={index} />)
                        break
                    case fileStateType.Warning:
                        elements.push(<FileStateWarningIcon fileState={state} key={index}/>)
                        break
                    case fileStateType.Custom:
                        elements.push(<FileStateCustomIcon fileState={state} key={index} />)
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

export default FileStateIcons