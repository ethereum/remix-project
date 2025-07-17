// eslint-disable-next-line no-use-before-define
import React from 'react'
import { fileDecoration } from '../../types'

const FileDecorationWarningIcon = (props: {fileDecoration: fileDecoration}) => {
  return (
    <>
      <span data-id={`file-decoration-warning-${props.fileDecoration.path}`} className={`${props.fileDecoration.fileStateIconClass} text-warning pe-2`}>
        {props.fileDecoration.text}
      </span>
    </>
  )
}

export default FileDecorationWarningIcon
