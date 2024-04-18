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
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [lastPageNumber, setLastPageNumber] = useState<number>(0)

  useEffect(() => {
    if (activePanel === "0") {
      console.log('GET BRANCH COMMITS', branch)
      if(lastPageNumber === 0)
        actions.getBranchCommits(branch, 1)
    }
  }, [activePanel])

  useEffect(() => {
    let hasNextPage = false
    let lastPageNumber = 0
    console.log('BRANCH COMMITS', context.remoteBranchCommits)
    context.remoteBranchCommits && Object.entries(context.remoteBranchCommits).map(([key, value]) => {
      if(key == branch.name){
        value.map((page, index) => {
          hasNextPage = page.hasNextPage
          lastPageNumber = page.page
        })
      }
    })
    setHasNextPage(hasNextPage)
    setLastPageNumber(lastPageNumber)
  }, [context.remoteBranchCommits])

  const checkout = (branch: branch) => {
    actions.checkout({
      ref: branch.name,
      remote: branch.remote && branch.remote.remote || null
    });
  }

  const loadNextPage = () => {
    console.log('LOAD NEXT PAGE', lastPageNumber+1)
    actions.getBranchCommits(branch, lastPageNumber+1)
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
      <>
      <div className="ml-1">
        {context.remoteBranchCommits && Object.entries(context.remoteBranchCommits).map(([key, value]) => {
          if(key == branch.name){
            return value.map((page, index) => {
              return page.commits.map((commit, index) => {
                return(<CommitDetails key={index} checkout={checkoutCommit} commit={commit}></CommitDetails>)
              })
            })
          }
        })}
        

      </div>
      {hasNextPage && <a href="#" className="cursor-pointer mb-1 ml-2" onClick={loadNextPage}>Load more</a>}
      </>
    </Accordion.Collapse>
  </Accordion>)
}