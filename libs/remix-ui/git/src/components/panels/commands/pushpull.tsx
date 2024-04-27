import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../../state/context";
import { gitPluginContext } from "../../gitui";
import { selectStyles, selectTheme } from "../../../types/styles";
import Select, { Options, OptionsOrGroups } from 'react-select'
import { setUpstream } from "../../../state/gitpayload";
import GitUIButton from "../../buttons/gituibutton";

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
    console.log('onRemoteChange', value, context)
    actions.setUpstreamRemote(value)
  }

  useEffect(() => {
    console.log('UPSTREAM', context.upstream, context)
  }, [context.upstream])

  const onForceChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    setForce(value)
  }

  const push = async () => {
    console.log('PUSH', context.upstream, localBranch, remoteBranch, force)
    actions.push(context.upstream, localBranch, remoteBranch, force)
  }

  const pull = async () => {
    actions.pull(context.upstream, localBranch, remoteBranch)
  }


  useEffect(() => {
    console.log('context branches', context.branches)
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


  const pushPullIsDisabled = () => {
    return localBranch === '' || remoteBranch === '' || context.upstream === '' || context.remotes.length === 0
  }


  return (
    <>



      <div className="btn-group w-100" role="group">
   
        <GitUIButton disabledCondition={pushPullIsDisabled()} type="button" onClick={async () => pull()} className="btn btn-primary mr-1">Pull</GitUIButton>
        <GitUIButton disabledCondition={pushPullIsDisabled()} type="button" onClick={async () => push()} className="btn btn-primary">Push</GitUIButton>
      </div>


      <label>Local Branch</label>
      <Select
        options={localBranchOptions}
        isDisabled={context.branches.length === 0}
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
        isDisabled={context.branches.length === 0}
        onChange={(e: any) => e && onRemoteBranchChange(e.value)}
        theme={selectTheme}
        styles={selectStyles}
        isClearable={true}
        value={{ value: remoteBranch, label: remoteBranch }}
        placeholder="Type to search for a branch..."
      />

      <label>Remote</label>
      <Select
        options={localRemotesOptions}
        isDisabled={context.remotes.length === 0}
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