import React from "react"
import { useState } from "react"
import { gitActionsContext } from "../state/context"
import { gitPluginContext } from "./gitui"

export const CommitMessage = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)

    const [message, setMessage] = useState({ value: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage({ value: e.currentTarget.value })
    }

    const commitAllowed = ()=>{
        return context.canCommit === false || message.value ===""
      }

    return (
        <>
            <div className="form-group">
                <label>Message</label>
                <input data-id='commitMessage' className="form-control" type="text" onChange={handleChange} value={message.value} />
            </div>
            {context.canCommit ? <></> : <div className='alert alert-warning'>Cannot commit in detached state! Create a new branch and check it out first or checkout main.<br></br></div>}
            <button data-id='commitButton' className="btn btn-primary" disabled={commitAllowed()} onClick={async () => actions.commit(message.value)} >git commit</button>
            <hr></hr>
        </>
    );
}