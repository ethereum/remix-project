import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { fileDecoration } from "../../types";

const FileDecorationTooltip = (props: {
    fileDecoration: fileDecoration,
    icon: JSX.Element
    index: number
},
) => {
    const getComments = function (fileDecoration: fileDecoration) {
        if (fileDecoration.commment) {
            const commments = Array.isArray(fileDecoration.commment) ? fileDecoration.commment : [fileDecoration.commment]
            return commments.map((comment, index) => {
                return <div key={index}>{comment}<br></br></div>
            })
        }
    }

    return <OverlayTrigger
        key={`overlaytrigger-${props.fileDecoration.path}-${props.index}`}
        placement='auto'
        overlay={
            <Tooltip id={`error-tooltip-${props.fileDecoration.path}`}>
                <>{getComments(props.fileDecoration)}</>
            </Tooltip>
        }
    ><div>{props.icon}</div></OverlayTrigger>

}


export default FileDecorationTooltip;