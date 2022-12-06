import React from "react"
import { useState } from "react"
import { gitActionsContext } from "../../state/context"
import { gitPluginContext } from "../gitui"
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CommitMessage = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)

    const [message, setMessage] = useState({ value: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage({ value: e.currentTarget.value })
    }

    const commitAllowed = () => {
        return context.canCommit === false || message.value === ""
    }

    return (
        <>
            <div className="form-group">
                <input placeholder="message" data-id='commitMessage' className="form-control" type="text" onChange={handleChange} value={message.value} />
            </div>
            {context.canCommit ? <></> : <div className='alert alert-warning'>Cannot commit in detached state! Create a new branch and check it out first or checkout main.<br></br></div>}
            <button data-id='commitButton' className="btn btn-primary w-100" disabled={commitAllowed()} onClick={async () => actions.commit(message.value)} >
                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                Commit
            </button>
            <hr></hr>
        </>
    );
}