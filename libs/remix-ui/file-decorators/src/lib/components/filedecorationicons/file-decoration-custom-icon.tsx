// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationCustomIcon = (props: {
    fileState: fileDecoration
}) => {
    return <><span className={`${props.fileState.fileStateIconClass}pr-2`}>
        {props.fileState.fileStateIcon}
    </span></>
}

export default FileDecorationCustomIcon