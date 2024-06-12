import { branch, commitChange } from "@remix-api";
import React from "react";
import path from "path";
import { gitActionsContext, pluginActionsContext } from "../../../state/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

export interface CCommitDetailsItemsProps {
  commitChange: commitChange;
  isAheadOfRepo: boolean;
  openFileOnRemote: (file: string, hash: string) => void;
}

export const CommitDetailsItems = (props: CCommitDetailsItemsProps) => {
  const { commitChange, isAheadOfRepo, openFileOnRemote } = props;
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)

  const openChanges = async (change: commitChange) => {
    await actions.diff(change)
    await pluginActions.openDiff(change)
  }

  const openRemote = () => {
    openFileOnRemote(commitChange.path, commitChange.hashModified)
  }

  function FunctionStatusIcons() {
    const status = commitChange.type
    return (<>

      {status && status.indexOf("modified") === -1 ? <></> : <span>M</span>}
      {status && status.indexOf("deleted") === -1 ? <></> : <span>D</span>}
      {status && status.indexOf("added") === -1 ? <></> : <span>A</span>}

    </>)
  }
  return (<>
    <div data-id={`commit-change-${commitChange.type}-${path.basename(commitChange.path)}`} className={`d-flex w-100 d-flex flex-row commitdetailsitem ${isAheadOfRepo ? 'text-success' : ''}`}>
      <div className='pointer gitfile long-and-truncated' onClick={async () => await openChanges(commitChange)}>
        <span className='font-weight-bold long-and-truncated'>{path.basename(commitChange.path)}</span>
        <div className='text-secondary long-and-truncated'> {commitChange.path}</div>
      </div>
      <div className="d-flex align-items-end">
        {!isAheadOfRepo ?
          <FontAwesomeIcon role={'button'} icon={faGlobe} onClick={() => openRemote()} className="pointer mr-1 align-self-center" /> : <></>}
        <FunctionStatusIcons></FunctionStatusIcons>
      </div>
    </div>
  </>)
}
