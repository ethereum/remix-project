// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileState } from '../../types'

const FileStateErrorIcon = (props: {
    fileState: fileState
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-danger pr-2`}>{props.fileState.comment}</span></>
}

export default FileStateErrorIcon