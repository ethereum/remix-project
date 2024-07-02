import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../../state/context";
import GitUIButton from "../../buttons/gituibutton";
import { gitPluginContext } from "../../gitui";

export const Fetch = () => {
  const actions = React.useContext(gitActionsContext)
  const context = React.useContext(gitPluginContext)

  const fetchIsDisabled = () => {
    return (!context.upstream) || context.remotes.length === 0
  }
  return (
    <>
      <div className="btn-group w-100" role="group">
        <GitUIButton data-id='sourcecontrol-fetch-remote' disabledCondition={fetchIsDisabled()} type="button" onClick={async () => actions.fetch({
          remote: context.upstream,
        })} className="btn btn-secondary mr-1 w-50"><div>Fetch {context.upstream && context.upstream.name}</div></GitUIButton>
        <GitUIButton data-id='sourcecontrol-fetch-branch' disabledCondition={fetchIsDisabled()} type="button" onClick={async () => actions.fetch({
          remote: context.upstream,
          ref: context.currentBranch
        })} className="btn btn-secondary w-50 long-and-truncated">Fetch {context.currentBranch.name}</GitUIButton>
      </div>
    </>)
}
