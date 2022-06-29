// eslint-disable-next-line no-use-before-define
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { fileDecoration } from '../../types'

const FileDecorationErrorIcon = (props: {
    fileState: fileDecoration
}) => {

    const getComments = function () {
        if(props.fileState.commment){
            const commments = Array.isArray(props.fileState.commment) ? props.fileState.commment : [props.fileState.commment]
            return commments.map((comment, index) => {
                return <div key={index}>{comment}<br></br></div>
            })
        }
    }

    return <>
        <OverlayTrigger

            placement='auto'
            overlay={
                <Tooltip id={`tooltip-${props.fileState.path}`}>
                    <>{getComments()}</>
                </Tooltip>
            }
        >
            <span className={`${props.fileState.fileStateIconClass} text-danger pr-2`}>{props.fileState.text}</span>
        </OverlayTrigger>
    </>
}

export default FileDecorationErrorIcon