import { faCaretUp, faCaretDown, faCaretRight, faArrowUp, faArrowDown, faArrowRotateRight, faArrowsUpDown, faGlobe, faCheckCircle, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { branch } from "../../types";
import { gitPluginContext } from "../gitui";

interface BrancheDetailsNavigationProps {
  eventKey: string;
  activePanel: string;
  callback: (eventKey: string) => void;
  branch: branch;
  checkout: (branch: string) => void;
}

export const BrancheDetailsNavigation = (props: BrancheDetailsNavigationProps) => {
  const { eventKey, activePanel, callback, branch, checkout } = props;
  const context = React.useContext(gitPluginContext)
  const handleClick = () => {
    if (!callback) return
    if (activePanel === eventKey) {
      callback('')
    } else {
      callback(eventKey)
    }
  }

  const openRemote = () => {
    console.log('branch.remote.url', branch)
    window.open(`${branch.remote.url}/tree/${branch.name}`, '_blank');
  }

  return (
    <>
      <div className="d-flex flex-row w-100 mb-2 mt-2">
        <div onClick={() => handleClick()} role={'button'} className='pointer d-flex flex-row w-100 commit-navigation'>
          {
            activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
          }
          <i className="fa fa-code-branch ml-1"></i>
          <div className={`ml-1 ${context.currentBranch === branch.name ? 'text-success' : ''}`}>{branch.name} {branch.remote ? `on ${branch.remote.remote}` : ''}</div>

        </div>
        {context.currentBranch === branch.name ?
          <FontAwesomeIcon className='ml-auto mr-1 pointer' icon={faToggleOn} onClick={() => checkout(branch.name)}></FontAwesomeIcon>
          :
          <FontAwesomeIcon className='ml-auto mr-1 pointer' icon={faToggleOff} onClick={() => checkout(branch.name)}></FontAwesomeIcon>
        }
        <FontAwesomeIcon className='ml-auto pointer' icon={faArrowsUpDown} onClick={() => checkout(branch.name)}></FontAwesomeIcon>
        {branch.remote?.url && <FontAwesomeIcon className='ml-2 pointer' icon={faGlobe} onClick={() => openRemote()}></FontAwesomeIcon>}
      </div>
    </>
  );
}