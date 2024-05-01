import { faCaretUp, faCaretDown, faCaretRight, faArrowUp, faArrowDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { CommitSummary } from "../panels/commits/commitsummary";
import { ReadCommitResult } from "isomorphic-git"

interface CommitDetailsNavigationProps {
    commit: ReadCommitResult,
    checkout: (oid: string) => void
    eventKey: string
    activePanel: string
    callback: (eventKey: string) => void
}

export const CommitDetailsNavigation = (props: CommitDetailsNavigationProps) => {
  const { commit, checkout, eventKey, activePanel, callback } = props;
  const handleClick = () => {
    if (!callback) return
    if (activePanel === eventKey) {
      callback('')
    } else {
      callback(eventKey)
    }
  }
  return (
    <>
      <div onClick={() => handleClick()} role={'button'} className='pointer mb-2 mt-2 w-100 d-flex flex-row commit-navigation'>
        {
          activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
        }

        <CommitSummary commit={commit} checkout={checkout}></CommitSummary>
      </div>
    </>
  );
}