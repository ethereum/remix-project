import { checkout, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";
import { Remoteselect } from "./remoteselect";

export const Remotes = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [remoteName, setRemoteName] = React.useState<string>('')
  const [url, setUrl] = React.useState<string>('')

  const onRemoteNameChange = (value: string) => {
    setRemoteName(value)
  }
  const onUrlChange = (value: string) => {
    setUrl(value)
  }

  const addRemote = async () => {
    //await gitservice.addRemote(remoteName, url)
    //setCurrentRemote(remoteName)
    //await gitservice.getRemotes()
  }

  return (
    <><div className='row mt-1'>
      <div className='col col-md-6 col-12'>
        <input placeholder="remote name" name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control" type="text" id="remotename" />
      </div>
      <div className='col col-md-6 col-12'>
        <input placeholder="remote url" name='remoteurl' onChange={e => onUrlChange(e.target.value)} value={url} className="form-control" type="text" id="remoteurl" />
      </div>
    </div><button className='btn btn-primary mt-1 w-100' onClick={async () => {
      addRemote();
    }}>add remote</button>
    <hr></hr>
    <Remoteselect></Remoteselect>
    </>)
}