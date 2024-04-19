import { ReadCommitResult } from "isomorphic-git";
import { Accordion } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { CommitDetails } from "../commits/commitdetails";
import { CommitsNavigation } from "../../navigation/commits";

export interface BrancheDifferenceProps {
  commits: ReadCommitResult[];
  title: string
}

export const BranchDifferenceDetails = (props: BrancheDifferenceProps) => {
  const { commits, title } = props;
  const [activePanel, setActivePanel] = useState<string>("");

  if (commits.length === 0) return null

  return (
  <Accordion activeKey={activePanel} defaultActiveKey="">
    <CommitsNavigation title={title} eventKey="0" activePanel={activePanel} callback={setActivePanel} />
    <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
    <div className="ml-1">
      {commits && commits.map((commit, index) => {
        return (
          <CommitDetails key={index} checkout={()=>{}} commit={commit}></CommitDetails>
        );
      })}
    </div>
    </Accordion.Collapse>
  </Accordion>)
}