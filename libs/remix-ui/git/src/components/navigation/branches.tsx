import { faCaretUp, faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { pluginActionsContext } from "../../state/context";

export const BranchesNavigation = ({ eventKey, activePanel, callback  }) => {
    const pluginactions = React.useContext(pluginActionsContext)

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
                <span onClick={()=>handleClick()} role={'button'} className='nav d-flex justify-content-start align-items-center w-75'>
                    {
                        activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretUp}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon>
                    }
                    <label className="pl-1 nav form-check-label">BRANCHES</label>
                </span>
            </div>
        </>
    );
}