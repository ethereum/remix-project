import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { remote } from "../../types";
import GitUIButton from "../buttons/gituibutton";
import { gitPluginContext } from "../gitui";
import { LocalBranchDetails } from "./branches/localbranchdetails";
import { RemoteBranchDetails } from "./branches/remotebranchedetails";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Branches = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [newBranch, setNewBranch] = useState({ value: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBranch({ value: e.currentTarget.value });
  };

  return (
    <>
      <div data-id='branches-panel-content' className="pt-2">
        {context.branches && context.branches.length ?
          <div>
            <div data-id='branches-panel-content-local-branches'>
              <label className="text-uppercase">local branches</label>
              {context.branches && context.branches.filter((branch, index) => !branch.remote).map((branch, index) => {
                return (
                  <LocalBranchDetails key={index} branch={branch}></LocalBranchDetails>
                );
              })}
            </div>
            <hr />
            {context.upstream ?
              <>
                <div data-id='branches-panel-content-remote-branches'>
                  <label className="text-uppercase">remote branches on {context.upstream ? context.upstream.name : null}</label>
                  {context.branches && context.branches.filter((branch, index) => branch.remote && branch.remote.name === context.upstream.name).map((branch, index) => {
                    return (
                      <RemoteBranchDetails allowCheckout={true} key={index} branch={branch}></RemoteBranchDetails>
                    );
                  })}
                  <GitUIButton data-id={`remote-sync-${context.upstream.name}`} className="btn btn-sm" onClick={async () => {
                    await actions.fetch({
                      remote: context.upstream
                    })
                  }}><FontAwesomeIcon icon={faSync} ></FontAwesomeIcon><label className="pl-1">Fetch more from remote</label></GitUIButton>
                  <hr /></div></> : null}

          </div> : null}
        {context.currentBranch
          && context.currentBranch.name !== ''
          && (!context.branches || context.branches.length === 0) ?
          <div className="text-muted">Current branch is <strong className="text-dark">{`${context.currentBranch.name}`}</strong> but you have no commits.</div>
          : null}
        <label className="text-uppercase pt-2 pb-1">Create branch</label>
        <div className="form-group">

          <input
            placeholder="branch name"
            onChange={handleChange}
            className="form-control w-md-25 w-100"
            data-id="newbranchname"
            type="text"
            id="newbranchname"
          />
        </div>
        <GitUIButton
          data-id="sourcecontrol-create-branch"
          onClick={async () => actions.createBranch(newBranch.value)}
          className="btn w-md-25 w-100 btn-primary mb-3"
          id="createbranch-btn"
        >
          create new branch
        </GitUIButton>
      </div>
    </>
  );
}
