import { commitChange } from "../../../types";
import React from "react";
import path from "path";
import { gitActionsContext, pluginActionsContext } from "../../../state/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

export interface CCommitDetailsItemsProps {
  commitChange: commitChange;
}

export const CommitDetailsItems = (props: CCommitDetailsItemsProps) => {
  const { commitChange } = props;
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)

  const openChanges = async (change: commitChange) => {
    console.log("open changes", change);
    await actions.diff(change)
    console.log("open changes", change);
    await pluginActions.openDiff(change)
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
    <div className="d-flex w-100 d-flex flex-row commitdetailsitem">
      <div className='pointer gitfile long-and-truncated' onClick={async () => await openChanges(commitChange)}>
        <span className='font-weight-bold long-and-truncated'>{path.basename(commitChange.path)}</span>
        <div className='text-secondary long-and-truncated'> {commitChange.path}</div>
      </div>
      <div className="d-flex align-items-end">
        <FontAwesomeIcon icon={faGlobe} className="mr-1 align-self-center" />
        <FunctionStatusIcons></FunctionStatusIcons>
      </div>
    </div>
  </>)
}
