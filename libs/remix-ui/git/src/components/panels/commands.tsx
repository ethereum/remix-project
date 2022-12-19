import { checkout, ReadCommitResult } from "isomorphic-git";
import React, { useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";

export const Commands = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [remoteBranch, setRemoteBranch] = useState('')
  const [force, setForce] = useState(false)

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
      <div className='row'>
        <div className='col col-md-6 col-12'>
          <label>LOCAL BRANCH</label>
          <input name='localbranch' readOnly value={context.currentBranch} className="form-control" type="text" id="localbranch" />
        </div>
        <div className='col col-md-6 col-12'>
          <label>REMOTE BRANCH</label>
          <input name='remotebranch' onChange={e => onRemoteBranchChange(e.target.value)} value={remoteBranch} className="form-control" type="text" id="remotebranch" />
        </div></div>
      <button className='btn btn-primary m-1' onClick={async () => {
        //await gitservice.init()
      }}>init</button>
      <button className='btn btn-primary m-1' onClick={async () => {
        push()
      }}>push</button>
      <button className='btn btn-primary m-1' onClick={async () => {
        pull()
      }}>pull</button>
      <button className='btn btn-primary m-1' onClick={async () => {
        fetch()
      }}>fetch</button><br></br>
      <label>FORCE PUSH</label>
      <input name='force' className='ml-2' checked={force} onChange={e => onForceChange(e)} type="checkbox" id="forecepush" />
    </>)
}