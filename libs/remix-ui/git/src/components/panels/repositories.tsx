import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { repository } from "../../types";
import { gitPluginContext } from "../gitui";
import AsyncSelect from 'react-select'
import { selectStyles, selectTheme } from "../../types/styles";
import { TokenWarning } from "./tokenWarning";
import RepositorySelect from "../github/repositoryselect";

interface RepositoriesProps {
  cloneDepth?: number
  cloneAllBranches?: boolean
}

export const Repositories = (props: RepositoriesProps) => {
  const { cloneDepth, cloneAllBranches } = props
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [branch, setBranch] = useState({ name: "" });
  const [repo, setRepo] = useState<repository>(null);
  const [repoOtions, setRepoOptions] = useState<any>([]);
  const [branchOptions, setBranchOptions] = useState<any>([]);
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    console.log('context', context.repositories)
    if (context.repositories && context.repositories.length > 0) {
      // map context.repositories to options
      const options = context.repositories && context.repositories.length > 0 && context.repositories.map(repo => {
        return { value: repo.id, label: repo.full_name }
      })
      setRepoOptions(options)
    } else {
      setRepoOptions(null)
      setShow(false)
    }
    setLoading(false)

  }, [context.repositories])


  useEffect(() => {
    // map context.branches to options
    const options = context.remoteBranches && context.remoteBranches.length > 0 && context.remoteBranches.map(branch => {
      return { value: branch.name, label: branch.name }
    }
    )
    setBranchOptions(options)
  }, [context.remoteBranches])


  useEffect(() => {
    console.log('show', show)
  },[show])

  const fetchRepositories = async () => {
    try {
      setShow(true)
      setLoading(true)
      setRepoOptions([])
      setBranchOptions([])
      console.log(await actions.repositories())
    } catch (e) {
      // do nothing
    }
  };

  const selectRepo = async (value: number | string) => {
    // find repo
    console.log('setRepo', value, context.repositories)

    const repo = context.repositories.find(repo => {
      return repo.id.toString() === value.toString()
    })
    console.log('repo', repo)
    if (repo) {
      setBranchOptions([])
      setBranch({ name: "" })
      setRepo(repo)
      await actions.remoteBranches(repo.owner.login, repo.name)
    }
  }

  const selectRemoteBranch = async (value: number | string) => {
    console.log('setRemoteBranch', value)
    setBranch({ name: value.toString() })
  }

  const clone = async () => {
    try {
      console.log('clone', repo, branch)
      actions.clone(repo.html_url, branch.name, cloneDepth, !cloneAllBranches)
    } catch (e) {
      // do nothing
    }
  };

  
  return (
    <>
      <RepositorySelect />

      {branchOptions && branchOptions.length ?
        <AsyncSelect
          options={branchOptions}
          className="mt-1"
          onChange={(e: any) => e && selectRemoteBranch(e.value)}
          theme={selectTheme}
          styles={selectStyles}
          isClearable={true}
          placeholder="Type to search for a branch..."
        /> : null}

      {repo && branch.name && branch.name !== '0' ?
        <button data-id='clonebtn' className='btn btn-primary mt-1 w-100' onClick={async () => {
          await clone()
        }}>clone {repo.full_name}:{branch.name}</button> : null}

    </>
  )
}


