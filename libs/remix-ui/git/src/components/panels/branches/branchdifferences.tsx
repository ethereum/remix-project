import { branch, remote } from "@remix-api";
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

  const getRemote = (): remote | null => {
    return context.upstream ? context.upstream : context.defaultRemote ? context.defaultRemote : null
  }

  const commitsAhead = (remote: remote) => {
    if (!remote) return [];
    return context.branchDifferences[`${remote.name}/${branch.name}`]?.uniqueHeadCommits || [];
  }

  const commitsBehind = (remote: remote) => {
    if (!remote) return [];
    return context.branchDifferences[`${remote.name}/${branch.name}`]?.uniqueRemoteCommits || [];
  }

  if (!getRemote()) return null;

  return (

    <div>
      <BranchDifferenceDetails ahead={true} branch={branch} remote={getRemote()} title={`ahead of ${getRemote().name} by ${commitsAhead(getRemote()).length} commit(s)`} commits={commitsAhead(getRemote())}></BranchDifferenceDetails>
      <BranchDifferenceDetails behind={true} branch={branch} remote={getRemote()} title={`behind ${getRemote().name} by ${commitsBehind(getRemote()).length} commit(s)`} commits={commitsBehind(getRemote())}></BranchDifferenceDetails>
      {commitsAhead(getRemote()).length === 0 && commitsBehind(getRemote()).length === 0 ? null : <hr></hr>}
    </div>)
}