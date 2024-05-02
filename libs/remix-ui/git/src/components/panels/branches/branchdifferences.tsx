import { branch, remote } from "../../../types";
import React, { useEffect, useState } from "react";
import { gitPluginContext } from "../../gitui";
import { CommitDetails } from "../commits/commitdetails";
import { BranchDifferenceDetails } from "./branchdifferencedetails";

export interface BrancheDetailsProps {
  branch: branch;
  showSummary?: boolean;
}

export const BranchDifferences = (props: BrancheDetailsProps) => {
  const { branch, showSummary } = props;
  const context = React.useContext(gitPluginContext)

  useEffect(() => {
    console.log('GET BRANCH DIFF', branch)
  }, [])

  const getRemote = (): remote | null => {
    return context.upstream ? context.upstream : context.defaultRemote ? context.defaultRemote : null
  }

  useEffect(() => {
    console.log('BRANCH DIFF', context.branchDifferences)
  }, [context.branchDifferences])

  const commitsAhead = (remote: remote) => {
    if(!remote) return [];
    return context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueHeadCommits || [];
  }

  const commitsBehind = (remote: remote) => {
    if(!remote) return [];
    return context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueRemoteCommits || [];
  }

  if(!getRemote()) return null;

  return (

    <div>
      <BranchDifferenceDetails ahead={true} branch={branch} remote={getRemote()} title={`ahead of ${getRemote().remote} by ${commitsAhead(getRemote()).length} commit(s)`} commits={commitsAhead(getRemote())}></BranchDifferenceDetails>
      <BranchDifferenceDetails behind={true} branch={branch} remote={getRemote()} title={`behind ${getRemote().remote} by ${commitsBehind(getRemote()).length} commit(s)`} commits={commitsBehind(getRemote())}></BranchDifferenceDetails>
      {commitsAhead(getRemote()).length === 0 && commitsBehind(getRemote()).length === 0 ? null : <hr></hr>}
    </div>)
}