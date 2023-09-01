import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../../state/context";
import { gitPluginContext } from "../../gitui";
import { selectStyles, selectTheme } from "../../../types/styles";
import Select, { Options, OptionsOrGroups } from 'react-select'
import { setUpstream } from "../../../state/gitpayload";

export const PushPull = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [remoteBranch, setRemoteBranch] = useState('')
  const [localBranch, setLocalBranch] = useState('')
  const [localBranchOptions, setLocalBranchOptions] = useState<any>([]);
  const [remoteBranchOptions, setRemoteBranchOptions] = useState<any>([]);
  const [localRemotesOptions, setLocalRemotesOptions] = useState<any>([]);
  const [force, setForce] = useState(false)

  useEffect(() => {
    setRemoteBranch(context.currentBranch.name)
    setLocalBranch(context.currentBranch.name)
    if ((!context.upstream || context.upstream === '') && context.currentBranch && context.currentBranch.remote && context.currentBranch.remote.remote) {
      actions.setUpstreamRemote(context.currentBranch.remote.remote)
    }
  }, [context.currentBranch])



  const onRemoteBranchChange = (value: string) => {
    setRemoteBranch(value)
  }

  const onLocalBranchChange = (value: any) => {
    console.log('onLocalBranchChange', value)
    setLocalBranch(value)
  }

  const onRemoteChange = (value: any) => {
    console.log('onRemoteChange', value)
    actions.setUpstreamRemote(value)
  }

  useEffect(() => {
    console.log('UPSTREAM', context.upstream)
  }, [context.upstream])

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

  useEffect(() => {
    console.log('context', context.remotes)
    // map context.repositories to options
    const options = context.remotes && context.remotes.length > 0 && context.remotes
      .map(repo => {
        return { value: repo.remote, label: repo.remote }
      })

    setLocalRemotesOptions(options)

  }, [context.remotes])


  return (
    <>



      <div className="btn-group w-100" role="group" aria-label="Basic example">
        <button type="button" onClick={async () => push()} className="btn btn-primary mr-1">Push</button>
        <button type="button" onClick={async () => pull()} className="btn btn-primary">Pull</button>

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

      <label>Upstream</label>
      <Select
        options={localRemotesOptions}
        onChange={(e: any) => e && onRemoteChange(e.value)}
        theme={selectTheme}
        styles={selectStyles}
        isClearable={true}
        value={{ value: context.upstream, label: context.upstream }}
        placeholder="Type to search for a branch..."
      />


      <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
        <input checked={force} onChange={e => onForceChange(e)} className="remixui_autocompile custom-control-input" type="checkbox" data-id="compilerContainerAutoCompile" id="forcepush" title="Force Push" />
        <label className="form-check-label custom-control-label" htmlFor="forcepush">Force push</label>
      </div>

    </>)
}