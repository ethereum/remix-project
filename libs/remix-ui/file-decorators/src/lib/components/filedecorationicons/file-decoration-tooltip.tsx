import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { fileDecoration } from "../../types";

const FileDecorationTooltip = (props: {
  fileDecoration: fileDecoration,
  icon: JSX.Element
  index: number
},
) => {
  const getComments = function (fileDecoration: fileDecoration) {
    if (fileDecoration.comment) {
      const comments = Array.isArray(fileDecoration.comment) ? fileDecoration.comment : [fileDecoration.comment]
      return comments.map((comment, index) => {
        return <div className="bg-secondary text-left p-1 mx-1 my-0" key={index}>{comment}</div>
      })
    }
  }

  return <OverlayTrigger
    key={`overlaytrigger-${props.fileDecoration.path}-${props.index}`}
    placement='auto'
    overlay={
      <Popover id={`popover-positioned-auto}`}>
        <Popover.Content id={`error-tooltip-${props.fileDecoration.path}`} style={{minWidth: "fit-content"}} className={"text-wrap bg-secondary w-100 p-1 m-0"}>
          <pre>{getComments(props.fileDecoration)}</pre>
        </Popover.Content>
       </Popover>
    }
  >
    <div>{props.icon}</div>
  </OverlayTrigger>
}

export default FileDecorationTooltip;