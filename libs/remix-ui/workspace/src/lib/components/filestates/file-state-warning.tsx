// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileState } from '../../types'

const FileStateWarning = (props: {
    fileState: fileState
}) => {
    return <><span className={`${props.fileState.fileStateIconClass} text-warning pr-2`}>&#11044;</span></>
}

export default FileStateWarning