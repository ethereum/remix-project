import React, { useEffect } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { Remoteselect } from "./remoteselect";
import { RemotesImport } from "./remotesimport";

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
    actions.addRemote({
      remote: remoteName,
      url: url
    })
  }

  useEffect(() => {
    console.log('SHOW REMOTES', context.remotes)
  }, [context.remotes])

  return (
    <>

      {context.remotes && context.remotes.length ?
        <>

          {context.remotes && context.remotes.map((remote, index) => {

            return (
              <Remoteselect key={index} remote={remote}></Remoteselect>
            );
          })}
        </> : <>No remotes</>}
      <hr></hr>

      <input placeholder="remote name" name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control mb-2" type="text" id="remotename" />
      <input placeholder="remote url" name='remoteurl' onChange={e => onUrlChange(e.target.value)} value={url} className="form-control" type="text" id="remoteurl" />

      <button disabled={(remoteName && url)?false:true} className='btn btn-primary mt-1 w-100' onClick={async () => {
        addRemote();
      }}>add remote</button>
      <hr />
      <RemotesImport />
      <hr />

    </>)
}