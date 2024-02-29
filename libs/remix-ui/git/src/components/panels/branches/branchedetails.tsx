import { ReadCommitResult } from "isomorphic-git"
import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { CommitDetailsNavigation } from "../../navigation/commitdetails";
import { gitActionsContext } from "../../../state/context";
import { gitPluginContext } from "../../gitui";
import { branch } from "../../../types";
import { BrancheDetailsNavigation } from "../../navigation/branchedetails";
import { CommitDetailsItems } from "../commits/commitdetailsitem";
import { CommitDetails } from "../commits/commitdetails";
import { BranchCommits } from "./branchCommits";

export interface BrancheDetailsProps {
  branch: branch;
}

export const BranchDetails = (props: BrancheDetailsProps) => {
  const { branch } = props;
  const actions = React.useContext(gitActionsContext)
  const context = React.useContext(gitPluginContext)
  const [activePanel, setActivePanel] = useState<string>("");

  useEffect(() => {
    if (activePanel === "0") {
      console.log('GET BRANCH COMMITS', branch)
      actions.getBranchCommits(branch)
    }
  }, [activePanel])

  const checkout = (branch: branch) => {
    actions.checkout({
      ref: branch.name,
      remote: branch.remote && branch.remote.remote || null
    });
  }

  const checkoutCommit = async (oid: string) => {
    try {
        //await ModalRef.current?.show();
        actions.checkout({ ref: oid })
        //Utils.log("yes");
    } catch (e) {
        //Utils.log("no");
    }
};

  return (<Accordion activeKey={activePanel} defaultActiveKey="">
    <BrancheDetailsNavigation checkout={checkout} branch={branch} eventKey="0" activePanel={activePanel} callback={setActivePanel} />
    <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
      <div className="ml-1">
        {context.branchCommits && Object.entries(context.branchCommits).map(([key, value]) => {
          if(key == branch.name){
            return value.map((commit, index) => {
              return(<CommitDetails key={index} checkout={checkoutCommit} commit={commit}></CommitDetails>)
            })
          }
        })}
        

      </div>
    </Accordion.Collapse>
  </Accordion>)
}