import { ReadCommitResult } from "isomorphic-git";
import { Accordion } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { CommitDetails } from "../commits/commitdetails";
import { CommitsNavigation } from "../../navigation/commits";
import { branch, remote } from "../../../types";
import { gitActionsContext } from "../../../state/context";

export interface BrancheDifferenceProps {
  commits: ReadCommitResult[];
  title: string,
  remote?: remote,
  branch?: branch
}

export const BranchDifferenceDetails = (props: BrancheDifferenceProps) => {
  const { commits, title, branch, remote } = props;
  const [activePanel, setActivePanel] = useState<string>("");
  const actions = React.useContext(gitActionsContext)

  if (commits.length === 0) return null

  const getCommitChanges = async (commit: ReadCommitResult) => {
    await actions.getCommitChanges(commit.oid, commit.commit.parent[0])
  }

  return (
    <Accordion activeKey={activePanel} defaultActiveKey="">
      <CommitsNavigation branch={branch} remote={remote} title={title} eventKey="0" activePanel={activePanel} callback={setActivePanel} />
      <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
        <div className="ml-1">
          {commits && commits.map((commit, index) => {
            return (
              <CommitDetails getCommitChanges={getCommitChanges} key={index} checkout={()=>{}} commit={commit}></CommitDetails>
            );
          })}
        </div>
      </Accordion.Collapse>
    </Accordion>)
}