// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileState } from '../../types'

const FileStateError = (props: {
    fileState: fileState
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-danger pr-2`}>&#11044;</span></>
}

export default FileStateError