import { branch, checkout, ReadCommitResult } from "isomorphic-git";
import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { default as dateFormat } from "dateformat";
import { RemotesDetailsNavigation } from "../navigation/remotesdetails";
import { Accordion } from "react-bootstrap";
import { remote } from "../../types";
import { RemoteBranchDetails } from "./branches/remotebranchedetails";
import GitUIButton from "../buttons/gituibutton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

export interface RemoteSelectProps {
  remote: remote
  openDefault: boolean
}

export const Remoteselect = (props: RemoteSelectProps) => {
  const { remote, openDefault } = props;
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [activePanel, setActivePanel] = useState<string>("");

  useEffect(() => {
    setActivePanel(openDefault ? "0" : "")
  }, [openDefault])

  return (
    <>
      <Accordion activeKey={activePanel} defaultActiveKey=''>
        <RemotesDetailsNavigation callback={setActivePanel} eventKey="0" activePanel={activePanel} remote={remote} />
        <Accordion.Collapse className="pl-2 border-left ml-1" eventKey="0">
          <>
            {context.branches && context.branches.filter((branch, index) => branch.remote && branch.remote.name === remote.name).map((branch, index) => {
              return (
                <RemoteBranchDetails allowCheckout={false} key={index} branch={branch}></RemoteBranchDetails>
              );
            })}
            <GitUIButton data-id={`remote-sync-${remote.name}`} className="btn btn-sm" onClick={async () => {
              await actions.fetch({
                remote
              })
            }}><FontAwesomeIcon icon={faSync} ></FontAwesomeIcon><label className="pl-1">Fetch more from remote</label></GitUIButton>
          </>

        </Accordion.Collapse>
      </Accordion>
    </>
  )
}