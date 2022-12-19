import { checkout, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";

export const Remoteselect = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  return (
    <>
      {context.remotes && context.remotes.length ?
        <>
          <h5>Available remotes</h5>
          <div className="container-fluid p-0">
            {context.remotes && context.remotes.map((remote) => {
              return (
                <div key={remote.remote} className="p-0">
                  <div className="font-weight-bold">{remote.remote}</div>
                  <div className="text-muted small">{remote.url}</div>
                  <hr></hr>
                </div>
              );
            })}
          </div> </> : <>No remotes</>}
    </>
  )
}