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
<<<<<<< HEAD
        if (fileDecoration.comment) {
            const comments = Array.isArray(fileDecoration.comment) ? fileDecoration.comment : [fileDecoration.comment]
            return comments.map((comment, index) => {
=======
        if (fileDecoration.commment) {
            const commments = Array.isArray(fileDecoration.commment) ? fileDecoration.commment : [fileDecoration.commment]
            return commments.map((comment, index) => {
>>>>>>> 43bc1038a (add test)
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