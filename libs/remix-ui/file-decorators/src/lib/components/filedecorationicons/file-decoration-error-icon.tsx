// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationErrorIcon = (props: {
    fileState: fileDecoration
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-danger pr-2`}>{props.fileState.text}</span></>
}

export default FileDecorationErrorIcon