import React, { useEffect } from "react"
import { gitActionsContext } from "../../state/context"
import { gitPluginContext } from "../gitui"
import { Remoteselect } from "./remoteselect"
import { RemotesImport } from "./remotesimport"
import { sendToMatomo } from "../../lib/pluginActions"
import { gitMatomoEventTypes } from "../../types"

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
    await sendToMatomo(gitMatomoEventTypes.ADDMANUALREMOTE)
    actions.addRemote({
      name: remoteName,
      url: url
    })
  }

  return (
    <>
      <div data-id="remotes-panel-content" className="d-flex flex-column">
        {context.remotes && context.remotes.length ?
          <div>

            {context.remotes && context.remotes.map((remote, index) => {

              return (
                <Remoteselect key={index} openDefault={(context.upstream && context.upstream.name === remote.url) || index===0} remote={remote}></Remoteselect>
              );
            })}
          </div> : <div>
            <label className="text-uppercase">No remotes</label>
          </div>}
        <hr></hr>
        <label className="text-uppercase">Add remote from GitHub</label>
        <RemotesImport />
        <hr></hr>
        <label className="text-uppercase">Add remote manually</label>
        <input data-id="add-manual-remotename" placeholder="remote name" name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control mb-2" type="text" id="remotename" />
        <input data-id="add-manual-remoteurl" placeholder="remote url" name='remoteurl' onChange={e => onUrlChange(e.target.value)} value={url} className="form-control mb-2" type="text" id="remoteurl" />

        <button data-id="add-manual-remotebtn" disabled={(remoteName && url) ? false : true} className='btn btn-primary mt-1 w-100' onClick={async () => {
          addRemote();
        }}>add remote</button>
        <hr className="mt-0 border border-2" />
      </div>
    </>)
}
