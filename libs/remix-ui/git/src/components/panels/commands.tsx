import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";

export const Commands = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [remoteBranch, setRemoteBranch] = useState('')
  const [force, setForce] = useState(false)

  useEffect(() => {
    setRemoteBranch(context.currentBranch)
  }, [context.currentBranch])

  const onRemoteBranchChange = (value: string) => {
    setRemoteBranch(value)
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


  return (
    <>



      <div className="btn-group w-100" role="group" aria-label="Basic example">
        <button type="button" onClick={async () => push()} className="btn btn-primary mr-1">Push</button>
        <button type="button" onClick={async () => pull()} className="btn btn-primary mr-1">Pull</button>
        <button type="button" onClick={async () => fetch()} className="btn btn-primary">Fetch</button>
      </div>

      <div className='row mt-2'>
        <div className='col col-md-6 col-12'>
          <label>Local Branch</label>
          <input name='localbranch' readOnly value={context.currentBranch} className="form-control" type="text" id="localbranch" />
        </div>
        <div className='col col-md-6 col-12'>
          <label>Remote Branch</label>
          <input name='remotebranch' onChange={e => onRemoteBranchChange(e.target.value)} value={remoteBranch} className="form-control" type="text" id="remotebranch" />
        </div></div>

      <hr></hr>
      <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
        <input checked={force} onChange={e => onForceChange(e)} className="remixui_autocompile custom-control-input" type="checkbox" data-id="compilerContainerAutoCompile" id="forcepush" title="Force Push" />
        <label className="form-check-label custom-control-label" htmlFor="forcepush">Force push</label>
      </div>

    </>)
}