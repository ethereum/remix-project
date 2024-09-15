import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import GitUIButton from "../buttons/gituibutton";
import { gitPluginContext } from "../gitui";
import { LocalBranchDetails } from "./branches/localbranchdetails";
import { RemoteBranchDetails } from "./branches/remotebranchedetails";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { branch } from "@remix-api";

const pageLength = 5;

export const Branches = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [localBranchPage, setLocalBranchPage] = useState(1);
  const [remoteBranchPage, setRemoteBranchPage] = useState(1);
  const [newBranch, setNewBranch] = useState({ value: "" });
  const [localBranches, setLocalBranches] = useState<branch[]>([]);
  const [remoteBranches, setRemoteBranches] = useState<branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<branch | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBranch({ value: e.currentTarget.value });
  };

  useEffect(() => {
    if (context.branches) {

      if (context.currentBranch && context.currentBranch.name !== '') {
        setCurrentBranch(context.branches.filter((branch, index) => !branch.remote && branch.name === context.currentBranch.name)[0]);
        setLocalBranches(context.branches.filter((branch, index) => !branch.remote && branch.name !== context.currentBranch.name));
      } else {
        setLocalBranches(context.branches.filter((branch, index) => !branch.remote));
      }
      if (context.upstream) {
        setRemoteBranches(context.branches.filter((branch, index) => branch.remote && branch.remote.name === context.upstream.name));
      } else {
        setRemoteBranches([]);
      }
    } else {
      setLocalBranches([]);
      setRemoteBranches([]);
    }
  }, [context.branches, context.defaultRemote, context.upstream, context.currentBranch]);

  return (
    <>
      <div data-id='branches-panel-content' className="pt-2">
        {context.branches && context.branches.length ?
          <div>
            <div data-id='branches-panel-content-local-branches'>
              <label className="text-uppercase">local branches </label><div className="badge badge-info badge-pill ml-2">{localBranches.length}</div>
              {currentBranch && <LocalBranchDetails branch={currentBranch}></LocalBranchDetails>}
              {context.branches && localBranches.slice(0, localBranchPage * pageLength).map((branch, index) => {
                return (
                  <LocalBranchDetails key={index} branch={branch}></LocalBranchDetails>
                );
              })}
              {context.branches && localBranches.length > localBranchPage * pageLength && <GitUIButton className="btn btn-sm" onClick={() => {
                setLocalBranchPage(localBranchPage + 1)
              }}>Show more</GitUIButton>}
            </div>
            <hr />
            {context.upstream ?
              <>
                <div data-id='branches-panel-content-remote-branches'>
                  <label className="text-uppercase">remote branches on {context.upstream ? context.upstream.name : null}</label><div className="badge badge-info badge-pill ml-2">{remoteBranches.length}</div>
                  {context.branches && remoteBranches
                    .slice(0, remoteBranchPage * pageLength)
                    .map((branch, index) => {
                      return (
                        <RemoteBranchDetails allowCheckout={true} key={index} branch={branch}></RemoteBranchDetails>
                      );
                    })}
                  {context.branches && remoteBranches.length > remoteBranchPage * pageLength && <><GitUIButton data-id='show-more-branches-on-remote' className="btn btn-sm" onClick={() => {
                    setRemoteBranchPage(remoteBranchPage + 1);
                  }}>Show more</GitUIButton><br></br></>}
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
