import { checkout, ReadCommitResult } from "isomorphic-git";
import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";
import { RemotesDetailsNavigation } from "../navigation/remotesdetails";
import { Accordion } from "react-bootstrap";
import { remote } from "../../types";

export interface RemoteSelectProps {
  remote: remote
}

export const Remoteselect = (props: RemoteSelectProps) => {
  const { remote } = props;
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [activePanel, setActivePanel] = useState<string>("");

  useEffect(() => {
    if (activePanel === "0") {
      console.log('fetching', remote)
    }
  }, [activePanel])

  return (
    <>
      <Accordion activeKey={activePanel} defaultActiveKey="">
        <RemotesDetailsNavigation callback={setActivePanel} eventKey="0" activePanel={activePanel} remote={remote} />
        <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
          <div className="ml-1">
            </div>



        </Accordion.Collapse>
      </Accordion>
    </>
  )
}