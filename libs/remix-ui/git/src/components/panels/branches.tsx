import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { remote } from "../../types";
import GitUIButton from "../buttons/gituibutton";
import { gitPluginContext } from "../gitui";
import { LocalBranchDetails } from "./branches/localbranchdetails";
import { RemoteBranchDetails } from "./branches/remotebranchedetails";

export const Branches = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [newBranch, setNewBranch] = useState({ value: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBranch({ value: e.currentTarget.value });
  };

  const checkout = async (oid: string, remote: remote) => {
    try {
      actions.checkout({ ref: oid, remote: remote.remote });
    } catch (e) {
      // do nothing
    }
  };


  useEffect(() => {
    console.log("branches", context.branches)
  }, [context.branches])


  return (
    <>
      <div className="pt-1">
        {context.branches && context.branches.length ?
          <div>
            {context.branches && context.branches.filter((branch, index) => !branch.remote).map((branch, index) => {
              return (
                <LocalBranchDetails key={index} branch={branch}></LocalBranchDetails>
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
            <GitUIButton
              onClick={async () => actions.createBranch(newBranch.value)}
              className="btn w-md-25 w-100 btn-primary"
              id="createbranch-btn"
            >
              create new branch
            </GitUIButton>
          </div> : <div className="text-muted">No branches</div>}
      </div>
    </>
  );
}