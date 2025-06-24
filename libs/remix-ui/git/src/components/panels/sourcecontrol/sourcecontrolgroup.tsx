import { ReadCommitResult } from "isomorphic-git"
import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { gitActionsContext } from "../../../state/context";
import { gitPluginContext } from "../../gitui";
import { sourceControlGroup } from "../../../types";
import { SourceControlGroupNavigation } from "../../navigation/sourcecontrolgroup";
import { SourceControlItem } from "./sourcecontrolitem";

export interface SourceControlGroupProps {
  group: sourceControlGroup
}

export const SourceControlGroup = (props: SourceControlGroupProps) => {
  const { group } = props;
  const actions = React.useContext(gitActionsContext)
  const context = React.useContext(gitPluginContext)
  const [activePanel, setActivePanel] = useState<string>("0");

  useEffect(() => {
    if (activePanel === "0") {
    }
  }, [activePanel])

  return (<>
    {group.group.length > 0 ?
      <Accordion activeKey={activePanel} defaultActiveKey="">
        <SourceControlGroupNavigation group={group} eventKey="0" activePanel={activePanel} callback={setActivePanel} />
        <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
          <>
            {group.group.map((file, index) => {
              return (<SourceControlItem key={index} group={group} file={file}></SourceControlItem>)
            })}
          </>
        </Accordion.Collapse>
      </Accordion> : <></>}
  </>)
}
