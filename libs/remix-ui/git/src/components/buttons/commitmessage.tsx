import React, { useEffect } from "react"
import { useState } from "react"
import { gitActionsContext } from "../../state/context"
import { gitPluginContext } from "../gitui"
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { syncStateContext } from "./sourceControlBase";

export const CommitMessage = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const syncState = React.useContext(syncStateContext)

  const [message, setMessage] = useState({ value: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ value: e.currentTarget.value })
  }

  useEffect(() => {
    if (context.fileStatusResult) {
      console.log(context.staged.length + ' staged')
    }
  }, [context.fileStatusResult])

  const commit = async() => {
    if (context.staged.length === 0 && context.allchangesnotstaged.length == 0) return
    if (context.staged.length === 0)
      await actions.addall()
    await actions.commit(message.value)
  }

  const commitAllowed = () => {
    return context.canCommit === false || message.value === "" || ( context.staged.length === 0 && context.allchangesnotstaged.length == 0 )
  }

  const commitMessagePlaceholder = () => {
    if (context.currentBranch === undefined || context.currentBranch.name === "")
      return `message`
    return `message ( commit on ${context.currentBranch.name} )`
  }

  return (
    <>
      <div className="form-group">
        <input placeholder={commitMessagePlaceholder()} data-id='commitMessage' className="form-control" type="text" onChange={handleChange} value={message.value} />
      </div>
      {context.canCommit ? <></> : <div className='alert alert-warning'>Cannot commit in detached state! Create a new branch and check it out first or checkout main.<br></br></div>}
      <button data-id='commitButton' className="btn btn-primary w-100" disabled={commitAllowed()} onClick={async () => await commit()} >
        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                Commit {syncState.commitsAhead? `+${syncState.commitsAhead.length}` : ''} {syncState.commitsBehind? `-${syncState.commitsBehind.length}` : ''}
      </button>
      <hr></hr>
    </>
  );
}