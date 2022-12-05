import { faCaretUp, faCaretDown, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { SourceControlMenu } from "./menu/sourcecontrolmenu";

export const SourceControlMenuButton = ({ eventKey, activePanel, callback  }) => {


    const handleClick = () => {
        if(callback) {
            callback(eventKey)
        }
    }

    return (
        <>
            <div className='d-flex justify-content-between'>
                <span onClick={()=>handleClick()} role={'button'} className='d-flex justify-content-start align-items-center w-75'>
                    {
                        <FontAwesomeIcon className='' icon={faCaretUp}></FontAwesomeIcon>
                    }
                    <label className="pl-1 form-check-label">SOURCE CONTROL</label>


                </span>
                <span className='d-flex justify-content-end align-items-center w-25'>
                    <FontAwesomeIcon className='' icon={faArrowUp}></FontAwesomeIcon>
                    <FontAwesomeIcon className='pl-2 pr-2' icon={faArrowDown}></FontAwesomeIcon>
                    <SourceControlMenu/>
                </span>

            </div>
        </>
    );
}