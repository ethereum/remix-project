import { faCaretUp, faCaretDown, faCaretRight, faArrowUp, faArrowDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { CommitSummary } from "../panels/commits/commitsummary";

export const CommitDetailsNavigation = ({ eventKey, activePanel, callback, commit, checkout }) => {

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
            <div className='d-flex justify-content-between'>
                <span onClick={() => handleClick()} role={'button'} className='nav d-flex justify-content-start align-items-center w-75'>
                    {
                        activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
                    }

                    <CommitSummary commit={commit} checkout={checkout}></CommitSummary>
                </span>
            </div>
        </>
    );
}