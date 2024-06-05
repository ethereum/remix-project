import { commitChange, fileStatusResult, sourceControlGroup } from "../../../types";
import React from "react";
import path from "path";
import { gitActionsContext, pluginActionsContext } from "../../../state/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { SourceControlItemButtons } from "./sourcontrolitembuttons";
import { removeSlash } from "../../../utils";

export interface SourceControlItemProps {
  file: fileStatusResult;
  group: sourceControlGroup;
}

export const SourceControlItem = (props: SourceControlItemProps) => {
  const { file, group } = props;
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)

  async function fileClick(file: fileStatusResult) {
    if (file.statusNames && file.statusNames.indexOf("modified") !== -1) {
      const headHash = await actions.resolveRef("HEAD")
      const change: commitChange = {
        path: removeSlash(file.filename),
        type: "modified",
        hashOriginal: headHash,
        hashModified: '',
        readonly: false,
      }
      await actions.diff(change)
      await pluginActions.openDiff(change)
    } else {
      await pluginActions.openFile(file.filename)
      //await client.call('fileManager', 'open', file.filename)
    }
  }

  function FunctionStatusIcons() {

    const status = file.statusNames

    return (<>

      {status && status.indexOf("modified") === -1 ? <></> : <div>M</div>}
      {status && status.indexOf("deleted") === -1 ? <></> : <span>D</span>}
      {status && status.indexOf("added") === -1 ? <></> : <span>A</span>}
      {status && status.indexOf("untracked") === -1 ? <></> : <span>U</span>}
    </>)

  }
  return (<>
    <div className="d-flex w-100 d-flex flex-row align-items-center">
      <div className='pointer gitfile long-and-truncated' onClick={async () => await fileClick(file)}>
        <span className='font-weight-bold long-and-truncated'>{path.basename(file.filename)}</span>
        <div className='text-secondary long-and-truncated'> {file.filename}</div>
      </div>
      <div className="d-flex align-items-center ml-1">
        <SourceControlItemButtons group={group} file={file}></SourceControlItemButtons>
        <FunctionStatusIcons></FunctionStatusIcons>
      </div>
    </div>
  </>)
}