import { ReadCommitResult } from "isomorphic-git"
import { default as dateFormat } from "dateformat";
import React, { useEffect, useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { CommitDetailsNavigation } from "../../navigation/commitdetails";

export interface CommitDetailsProps {
  commit: ReadCommitResult;
}

export const CommitDetails = (props: CommitDetailsProps) => {
  const { commit } = props;
  const [activePanel, setActivePanel] = useState<string>("");

  useEffect(() => {
    if (activePanel === "0") {
      console.log(commit.oid,  commit.commit.parent)
    }
  }, [activePanel])


  return (<Accordion activeKey={activePanel} defaultActiveKey="">
    <CommitDetailsNavigation eventKey="0" activePanel={activePanel} callback={setActivePanel} />
    <Accordion.Collapse eventKey="0">
      <>
        <div>test</div>
      </>
    </Accordion.Collapse>
  </Accordion>)
}