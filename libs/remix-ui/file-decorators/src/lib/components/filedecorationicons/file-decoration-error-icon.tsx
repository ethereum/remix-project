// eslint-disable-next-line no-use-before-define
import React from 'react'

import { fileDecoration } from '../../types'

const FileDecorationErrorIcon = (props: {
    fileDecoration: fileDecoration
}) => {
    return <>
<<<<<<< HEAD
        <span data-id={`file-decoration-error-${props.fileDecoration.path}`} className={`${props.fileDecoration.fileStateIconClass} text-danger pr-2`}>{props.fileDecoration.text}</span>
=======
        <span className={`${props.fileDecoration.fileStateIconClass} text-danger pr-2`}>{props.fileDecoration.text}</span>
>>>>>>> 43bc1038a (add test)
    </>
}

export default FileDecorationErrorIcon