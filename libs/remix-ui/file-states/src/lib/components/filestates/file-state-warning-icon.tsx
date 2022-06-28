// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileState } from '../../types'

const FileStateWarningIcon = (props: {
    fileState: fileState
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-warning pr-2`}>{props.fileState.comment}</span></>
}

export default FileStateWarningIcon