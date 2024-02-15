import { faCaretUp, faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight, faCaretRight, faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTooltip } from "@remix-ui/helper";
import React, { useContext, useEffect } from "react";
import { FormattedMessage } from "react-intl";
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
            <div className={'d-flex justify-content-between ' + (activePanel === eventKey ? 'bg-light' : '')}>
                <span onClick={() => handleClick()} role={'button'} className='nav d-flex justify-content-start align-items-center w-75'>
                    {
                        activePanel === eventKey ? <FontAwesomeIcon className='' icon={faCaretDown}></FontAwesomeIcon> : <FontAwesomeIcon className='' icon={faCaretRight}></FontAwesomeIcon>
                    }
                    <label className="nav pl-1 form-check-label">SOURCE CONTROL</label>


                </span>
                {
                    activePanel === eventKey ?
                        <span className='d-flex justify-content-end align-items-center w-25'>
                            <CustomTooltip tooltipText={<FormattedMessage id="git.pull" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></button>
                            </CustomTooltip>
                            <CustomTooltip tooltipText={<FormattedMessage id="git.push" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></button>
                            </CustomTooltip>
                            <CustomTooltip tooltipText={<FormattedMessage id="git.sync" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowsUpDown} className="" /></button>
                            </CustomTooltip>
                            <CustomTooltip tooltipText={<FormattedMessage id="git.refresh" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowRotateRight} className="" /></button>
                            </CustomTooltip>

                        </span> : null
                }

            </div>
        </>
    );
}