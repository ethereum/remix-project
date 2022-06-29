// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationWarningIcon = (props: {
    fileState: fileDecoration
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-warning pr-2`}>{props.fileState.text}</span></>
}

export default FileDecorationWarningIcon