import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";

export const Branches = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)
    const [newBranch, setNewBranch] = useState({ value: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBranch({ value: e.currentTarget.value });
    };

    const checkout = async (oid: string, remote: string | 'origin') => {
        try {
            actions.checkout({ ref: oid, remote: remote });
        } catch (e) {
            // do nothing
        }
    };
    return (
        <>
            <hr></hr>
            {context.branches && context.branches.length ?
                <div>
                    <Alert className="w-md-50 w-100 text-break" variant="success">
                        {context.currentBranch}
                    </Alert>
                    {context.branches && context.branches.map((branch, index) => {
                        return (
                            <div key={index} className="row p-1">
                                <div className="col-6">{branch.name} on {branch.remote || 'local'}</div>
                                <div className="col">
                                    <span className="float-right">
                                        <div
                                            onClick={async () => await checkout(branch.name, branch.remote)}
                                            className="btn btn-primary btn-sm checkout-btn"
                                        >
                                            checkout
                                        </div>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <hr />
                    <label>create branch</label>
                    <div className="form-group">

                        <input
                            placeholder="branch name"
                            onChange={handleChange}
                            className="form-control w-md-25 w-100"
                            type="text"
                            id="newbranchname"
                        />
                    </div>
                    <button
                        onClick={async () => actions.createBranch(newBranch.value)}
                        className="btn w-md-25 w-100 btn-primary"
                        id="createbranch-btn"
                    >
                        create new branch
                    </button>
                </div> : <div className="text-muted">No branches</div>}
        </>
    );
}