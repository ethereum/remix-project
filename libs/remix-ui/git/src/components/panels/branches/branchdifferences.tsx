import { branch, remote } from "../../../types";
import React, { useEffect, useState } from "react";
import { gitPluginContext } from "../../gitui";
import { CommitDetails } from "../commits/commitdetails";

export interface BrancheDetailsProps {
  branch: branch;
}

export const BranchDifferences = (props: BrancheDetailsProps) => {
  const { branch } = props;
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
    <div>
      <div>
        {context.remotes.map((remote, index) => {
          return (
            <div key={index}>
              <h5>{remote.remote}</h5>
              <ul>
                <li>ahead by {commitsAhead(remote).length} commit(s)</li>
                <li>behind by {commitsBehind(remote).length} commits(s)</li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}