import React, { useEffect } from "react"
import { gitActionsContext } from "../../state/context"
import { gitPluginContext } from "../gitui"
import { Remoteselect } from "./remoteselect"
import { RemotesImport } from "./remotesimport"

export interface RemotesProps {
  plugin: any
}

export const Remotes = (props: RemotesProps) => {
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
      name: remoteName,
      url: url
    })
  }

  return (
    <>
      <div data-id="remotes-panel-content" className="d-flex flex-column">
        <RemotesImport plugin={props.plugin} />
        <hr className="mt-0 border border-2" />
        {context.remotes && context.remotes.length ?
          <div>

            {context.remotes && context.remotes.map((remote, index) => {

              return (
                <Remoteselect key={index} remote={remote}></Remoteselect>
              );
            })}
          </div> : <div>
            <label className="text-uppercase">No remotes</label>
          </div>}

        <input placeholder="remote name" name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control mb-3" type="text" id="remotename" />
        <input placeholder="remote url" name='remoteurl' onChange={e => onUrlChange(e.target.value)} value={url} className="form-control mb-3" type="text" id="remoteurl" />

        <button disabled={(remoteName && url) ? false : true} className='btn btn-primary mt-1 w-100' onClick={async () => {
          addRemote();
        }}>add remote</button>
        <hr className="mt-0 border border-2" />
      </div>
    </>)
}
