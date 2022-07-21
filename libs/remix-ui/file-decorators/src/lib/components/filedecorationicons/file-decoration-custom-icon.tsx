// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationCustomIcon = (props: {
    fileDecoration: fileDecoration
}) => {
<<<<<<< HEAD
    return <><span data-id={`file-decoration-custom-${props.fileDecoration.path}`} className={`${props.fileDecoration.fileStateIconClass} pr-2`}>
=======
    return <><span className={`${props.fileDecoration.fileStateIconClass}pr-2`}>
>>>>>>> 43bc1038a (add test)
        {props.fileDecoration.fileStateIcon}
    </span></>
}

export default FileDecorationCustomIcon