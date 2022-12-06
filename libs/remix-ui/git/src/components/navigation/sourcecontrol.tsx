import { faCaretUp, faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { pluginActionsContext } from "../../state/context";
import { SourceControlMenu } from "./menu/sourcecontrolmenu";

export const SourceControlNavigation = ({ eventKey, activePanel, callback }) => {
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
                <span onClick={() => handleClick()} role={'button'} className='nav d-flex justify-content-start align-items-center w-75'>
                    {
                        activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretUp}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon>
                    }
                    <label className="nav pl-1 form-check-label">SOURCE CONTROL</label>


                </span>
                {
                    activePanel === eventKey ?
                        <span className='d-flex justify-content-end align-items-center w-25'>
                            <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></button>
                            <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></button>
                            <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowRotateRight} className="" /></button>
                        </span> : null
                }

            </div>
        </>
    );
}