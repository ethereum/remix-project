import { faCaretUp, faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight, faCaretRight, faCircleCheck, faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTooltip } from "@remix-ui/helper";
import React, { useContext, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { pluginActionsContext } from "../../state/context";
import { SourceControlMenu } from "./menu/sourcecontrolmenu";

export const CommandsNavigation = ({ eventKey, activePanel, callback }) => {
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
                    <label className="pl-1 nav form-check-label">COMMANDS</label>


                </span>
                {
                    activePanel === eventKey ?
                        <span className='d-flex justify-content-end align-items-center w-25'>
                            <CustomTooltip tooltipText={<FormattedMessage id="Pull" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></button>
                            </CustomTooltip>
                            <CustomTooltip tooltipText={<FormattedMessage id="Push" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></button>
                            </CustomTooltip>
                            <CustomTooltip tooltipText={<FormattedMessage id="Sync changes" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowsUpDown} className="" /></button>
                            </CustomTooltip>
                        </span> : null
                }

            </div>
        </>
    );
}