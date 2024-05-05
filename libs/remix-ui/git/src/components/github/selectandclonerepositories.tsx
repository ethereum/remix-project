import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { repository } from "../../types";
import { gitPluginContext } from "../gitui";
import RepositorySelect from "./repositoryselect";
import { BranchSelect } from "./branchselect";
import { TokenWarning } from "../panels/tokenWarning";
import GitUIButton from "../buttons/gituibutton";

interface RepositoriesProps {
  cloneDepth?: number
  cloneAllBranches?: boolean
}

export const SelectAndCloneRepositories = (props: RepositoriesProps) => {
  const { cloneDepth, cloneAllBranches } = props
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [branch, setBranch] = useState({ name: "" });
  const [repo, setRepo] = useState<repository>(null);

  const selectRemoteBranch = async (branch:{ name: string }) => {
    setBranch(branch)
  }

  const selectRepo = async (repo: repository) => {
    setBranch(null)
    setRepo(repo)
  }

  const clone = async () => {
    try {
      actions.clone(repo.html_url, branch.name, cloneDepth, !cloneAllBranches)
    } catch (e) {
      // do nothing
    }
  };

  return (
    <>
      <TokenWarning />
      <RepositorySelect title={`Clone Repository from GitHub`} select={selectRepo} />

      {repo &&<BranchSelect select={selectRemoteBranch} />}

      {repo && branch && branch.name && branch.name !== '0' ?
        <GitUIButton data-id='clonebtn' className='btn btn-primary mt-1 w-100' onClick={async () => {
          await clone()
        }}>clone {repo.full_name}:{branch.name}</GitUIButton> : null}

    </>
  )
}

