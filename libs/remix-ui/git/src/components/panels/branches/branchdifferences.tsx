import { branch, remote } from "../../../types";
import React, { useEffect, useState } from "react";
import { gitPluginContext } from "../../gitui";
import { CommitDetails } from "../commits/commitdetails";
import { BranchDifferenceDetails } from "./branchdifferencedetails";

export interface BrancheDetailsProps {
  branch: branch;
  showSummary?: boolean;
  remote?: remote;
}

export const BranchDifferences = (props: BrancheDetailsProps) => {
  const { branch, showSummary, remote } = props;
  const context = React.useContext(gitPluginContext)

  useEffect(() => {
    console.log('GET BRANCH DIFF', branch)
  }, [])

  useEffect(() => {
    console.log('BRANCH DIFF', context.branchDifferences)
  }, [context.branchDifferences])

  const commitsAhead = (remote: remote) => {
    return context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueHeadCommits || [];
  }

  const commitsBehind = (remote: remote) => {
    return context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueRemoteCommits || [];
  }

  return (
    <>
        {!showSummary && context.remotes.map((remote, index) => {
          return (
            <div key={index}>
                <BranchDifferenceDetails branch={branch} remote={remote} title={`ahead of ${remote.remote} by ${commitsAhead(remote).length} commit(s)`} commits={commitsAhead(remote)}></BranchDifferenceDetails>
                <BranchDifferenceDetails branch={branch} remote={remote} title={`behind ${remote.remote} by ${commitsBehind(remote).length} commit(s)`} commits={commitsBehind(remote)}></BranchDifferenceDetails>
                {commitsAhead(remote).length === 0 && commitsBehind(remote).length === 0? null: <hr></hr>}
            </div>
          );
        })}
        {showSummary && <div>summary</div>}

    </>
  );
}