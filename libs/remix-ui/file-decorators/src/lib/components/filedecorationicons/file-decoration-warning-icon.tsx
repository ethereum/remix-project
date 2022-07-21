// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationWarningIcon = (props: {
    fileDecoration: fileDecoration
}) => {
<<<<<<< HEAD
    return <><span data-id={`file-decoration-warning-${props.fileDecoration.path}`} className={`${props.fileDecoration.fileStateIconClass} text-warning pr-2`}>{props.fileDecoration.text}</span></>
=======
    return <><span className={`${props.fileDecoration.fileStateIconClass} text-warning pr-2`}>{props.fileDecoration.text}</span></>
>>>>>>> 43bc1038a (add test)
}

export default FileDecorationWarningIcon