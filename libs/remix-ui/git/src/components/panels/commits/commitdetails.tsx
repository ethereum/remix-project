import { ReadCommitResult } from "isomorphic-git"
import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { CommitDetailsNavigation } from "../../navigation/commitdetails";
import { gitActionsContext } from "../../../state/context";
import { gitPluginContext } from "../../gitui";
import { CommitDetailsItems } from "./commitdetailsitem";

export interface CommitDetailsProps {
  commit: ReadCommitResult;
  checkout: (oid: string) => void;
  getCommitChanges: (commit: ReadCommitResult) => void;
}

export const CommitDetails = (props: CommitDetailsProps) => {
  const { commit, checkout, getCommitChanges } = props;
  const actions = React.useContext(gitActionsContext)
  const context = React.useContext(gitPluginContext)
  const [activePanel, setActivePanel] = useState<string>("");

  useEffect(() => {
    if (activePanel === "0") {
      console.log(context)
      getCommitChanges(commit)
    }
  }, [activePanel])

  return (<Accordion activeKey={activePanel} defaultActiveKey="">
    <CommitDetailsNavigation commit={commit} checkout={checkout} eventKey="0" activePanel={activePanel} callback={setActivePanel} />
    <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
      <>
        {context.commitChanges && context.commitChanges.filter(
          (change) => change.hashModified === commit.oid && change.hashOriginal === commit.commit.parent[0]
        ).map((change, index) => {
          return (<CommitDetailsItems key={index} commitChange={change}></CommitDetailsItems>)
        })}

      </>
    </Accordion.Collapse>
  </Accordion>)
}