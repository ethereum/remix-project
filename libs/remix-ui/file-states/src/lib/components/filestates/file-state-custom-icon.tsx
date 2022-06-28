// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileState } from '../../types'

const FileStateCustomIcon = (props: {
    fileState: fileState
}) => {
    return <><span className={`${props.fileState.fileStateIconClass}pr-2`}>
        {props.fileState.fileStateIcon}
    </span></>
}

export default FileStateCustomIcon