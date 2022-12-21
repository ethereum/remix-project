import { commitChange } from "../../../types";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { file } from "jszip";
import path from "path";

export interface CCommitDetailsItemsProps {
  commitChange: commitChange;
}

const openChanges = () => {
  console.log("open changes");
}



export const CommitDetailsItems = (props: CCommitDetailsItemsProps) => {
  const { commitChange } = props;

  function FunctionStatusIcons() {
    const status = commitChange.type
    return (<>
        <div className='float-right pr-1'>
            {status && status.indexOf("modified") === -1 ? <></> : <button className='btn btn-sm mr-1'>M</button>}
            {status && status.indexOf("deleted") === -1 ? <></> : <button className='btn btn-sm  mr-1'>D</button>}
            {status && status.indexOf("added") === -1 ? <></> : <button className='btn btn-sm  mr-1'>A</button>}
        </div>
    </>)
  }
  return (<>
    <Row className='mb-1'>
      <Col className='col-10'>
        <div className='pointer text-truncate' onClick={async () => openChanges()}>
          <span className='font-weight-bold'>{path.basename(commitChange.path)}</span>
          <div className='text-secondary'> {commitChange.path}</div>
        </div>
      </Col>
      <Col className='col-2 p-0'>
          <FunctionStatusIcons></FunctionStatusIcons>
      </Col>
    </Row>
  </>)
}
