import { faCaretDown, faCaretRight, faArrowRightArrowLeft, faGlobe, faToggleOff, faToggleOn, faTrash, faCheck, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTooltip } from "@remix-ui/helper";
import React, { useContext, useEffect } from "react";
import { gitActionsContext } from "../../state/context";
import { remote } from "@remix-api";
import GitUIButton from "../buttons/gituibutton";
import { gitPluginContext } from "../gitui";

interface RemotesDetailsNavigationProps {
  eventKey: string;
  activePanel: string;
  callback: (eventKey: string) => void;
  remote: remote;
}

export const RemotesDetailsNavigation = (props: RemotesDetailsNavigationProps) => {
  const { eventKey, activePanel, callback, remote } = props;
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)

  const handleClick = () => {
    if (!callback) return
    if (activePanel === eventKey) {
      callback('')
    } else {
      callback(eventKey)
    }
  }

  const openRemote = () => {
    window.open(`${remote.url}`, '_blank');
  }

  const setAsDefault = () => {
    actions.setDefaultRemote(remote)
  }

  return (
    <>
      <div className="d-flex flex-row w-100 mb-2 mt-2">
        <div data-id={`remote-detail-${remote.name}${context.defaultRemote && context.defaultRemote?.url === remote.url ? '-default' : ''}`} onClick={() => handleClick()} role={'button'} className='pointer long-and-truncated d-flex flex-row commit-navigation'>
          {
            activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
          }
          <CustomTooltip tooltipText={remote.url} placement="top">
            <div className={`long-and-truncated ml-1 ${context.defaultRemote && context.defaultRemote?.url === remote.url ? 'text-success' : ''}`}>
              {remote.name}  <FontAwesomeIcon className='' icon={faArrowRightArrowLeft}></FontAwesomeIcon> {remote.url}
            </div>
          </CustomTooltip>

        </div>
        {context.defaultRemote && context.defaultRemote?.url === remote.url ?
          <GitUIButton className="btn btn-sm" onClick={() => { }} disabledCondition={true}><FontAwesomeIcon className='text-success' icon={faCheck} ></FontAwesomeIcon></GitUIButton>
          :
          <GitUIButton className="btn btn-sm" onClick={setAsDefault}><FontAwesomeIcon icon={faToggleOn}></FontAwesomeIcon></GitUIButton>
        }
        <GitUIButton data-id={`remote-sync-${remote.name}`} className="btn btn-sm" onClick={async () => {
          await actions.fetch({
            remote
          })
        }}><FontAwesomeIcon icon={faSync} ></FontAwesomeIcon></GitUIButton>
        <GitUIButton data-id={`remote-rm-${remote.name}`} className="btn btn-sm" onClick={() => actions.removeRemote(remote)}><FontAwesomeIcon className='text-danger' icon={faTrash} ></FontAwesomeIcon></GitUIButton>
        {remote?.url && <GitUIButton className="btn btn-sm pr-0" onClick={() => openRemote()}><FontAwesomeIcon icon={faGlobe} ></FontAwesomeIcon></GitUIButton>}
      </div>
    </>
  );
}