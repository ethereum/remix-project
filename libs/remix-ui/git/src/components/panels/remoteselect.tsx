import { branch, checkout, ReadCommitResult } from "isomorphic-git";
import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";
import { RemotesDetailsNavigation } from "../navigation/remotesdetails";
import { Accordion } from "react-bootstrap";
import { remote } from "../../types";
import { RemoteBranchDetails } from "./branches/remotebranchedetails";

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

  useEffect(() => {
    console.log('remote branches', context.branches)
  }, [context.branches])

  return (
    <>
      <Accordion activeKey={activePanel} defaultActiveKey="">
        <RemotesDetailsNavigation callback={setActivePanel} eventKey="0" activePanel={activePanel} remote={remote} />
        <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
          <>
            {context.branches && context.branches.filter((branch, index) => branch.remote && branch.remote.remote === remote.remote ).map((branch, index) => {
              return (
                <RemoteBranchDetails key={index} branch={branch}></RemoteBranchDetails>
              );
            })}</>

        </Accordion.Collapse>
      </Accordion>
    </>
  )
}