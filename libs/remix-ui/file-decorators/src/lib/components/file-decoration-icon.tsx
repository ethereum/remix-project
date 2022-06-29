// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'

import { fileDecoration, fileDecorationType, FileType } from '../types'
import FileDecorationCustomIcon from './filedecorationicons/file-decoration-custom-icon'
import FileDecorationErrorIcon from './filedecorationicons/file-decoration-error-icon'
import FileDecorationWarningIcon from './filedecorationicons/file-decoration-warning-icon'

export type fileDecorationProps = {
    file: FileType,
    fileDecorations: fileDecoration[]
}

export const FileDecorationIcons = (props: fileDecorationProps) => {
    const [states, setStates] = useState<fileDecoration[]>([])
    useEffect(() => {
        //console.log(props.file)
        //console.log(props.fileState)
        setStates(props.fileDecorations.filter((fileDecoration) => fileDecoration.path === props.file.path || `${fileDecoration.workspace.name}/${fileDecoration.path}` === props.file.path))
    }, [props.fileDecorations])

    const getTags = function () {
        if (states && states.length) {
            const elements: JSX.Element[] = []

            for (const [index, state] of states.entries()) {
                switch (state.fileStateType) {
                    case fileDecorationType.Error:
                        elements.push(<FileDecorationErrorIcon fileState={state} key={index} />)
                        break
                    case fileDecorationType.Warning:
                        elements.push(<FileDecorationWarningIcon fileState={state} key={index}/>)
                        break
                    case fileDecorationType.Custom:
                        elements.push(<FileDecorationCustomIcon fileState={state} key={index} />)
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