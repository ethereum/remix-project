import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { selectStyles, selectTheme } from "../../types/styles";
import Select from 'react-select'

export const Commands = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [remoteBranch, setRemoteBranch] = useState('')
  const [localBranch, setLocalBranch] = useState('')
  const [localBranchOptions, setLocalBranchOptions] = useState<any>([]);
  const [remoteBranchOptions, setRemoteBranchOptions] = useState<any>([]);
  const [force, setForce] = useState(false)

  useEffect(() => {
    setRemoteBranch(context.currentBranch)
    setLocalBranch(context.currentBranch)
  }, [context.currentBranch])

  const onRemoteBranchChange = (value: string) => {
    setRemoteBranch(value)
  }

  const onLocalBranchChange = (value: any) => {
    console.log('onLocalBranchChange', value)
    setLocalBranch(value)
  }

  const onForceChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    setForce(value)
  }

  const push = async () => {
    //gitservice.push(currentRemote, branch || '', remoteBranch, force)
  }

  const pull = async () => {
    //gitservice.pull(currentRemote, branch || '', remoteBranch)
  }

  const fetch = async () => {
    //gitservice.fetch(currentRemote, '', '')
  }

  useEffect(() => {
    console.log('context', context.repositories)
    // map context.repositories to options
    const localBranches = context.branches && context.branches.length > 0 && context.branches
      .filter(branch => !branch.remote)
      .map(repo => {
        return { value: repo.name, label: repo.name }
      })
    setLocalBranchOptions(localBranches)

    const remoteBranches = context.branches && context.branches.length > 0 && context.branches
      .filter(branch => branch.remote)
      .map(repo => {
        return { value: repo.name, label: repo.name }
      }
      )
    setRemoteBranchOptions(remoteBranches)

  }, [context.branches])


  return (
    <>



      <div className="btn-group w-100" role="group" aria-label="Basic example">
        <button type="button" onClick={async () => push()} className="btn btn-primary mr-1">Push</button>
        <button type="button" onClick={async () => pull()} className="btn btn-primary mr-1">Pull</button>

      </div>


      <label>Local Branch</label>
      <Select
        options={localBranchOptions}
        onChange={(e: any) => e && onLocalBranchChange(e.value)}
        theme={selectTheme}
        styles={selectStyles}
        isClearable={true}
        value={{ value: localBranch, label: localBranch }}
        placeholder="Type to search for a branch..."
      />

      <label>Remote Branch</label>
      <Select
        options={remoteBranchOptions}
        onChange={(e: any) => e && onRemoteBranchChange(e.value)}
        theme={selectTheme}
        styles={selectStyles}
        isClearable={true}
        value={{ value: remoteBranch, label: remoteBranch }}
        placeholder="Type to search for a branch..."
      />

      <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
        <input checked={force} onChange={e => onForceChange(e)} className="remixui_autocompile custom-control-input" type="checkbox" data-id="compilerContainerAutoCompile" id="forcepush" title="Force Push" />
        <label className="form-check-label custom-control-label" htmlFor="forcepush">Force push</label>
      </div>
      <hr></hr>
      <button type="button" onClick={async () => fetch()} className="btn btn-primary w-100">Fetch</button>

    </>)
}