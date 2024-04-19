import { faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight, faCaretRight, faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTooltip } from "@remix-ui/helper";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { pluginActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";

export interface CommitsNavigationProps {
    title: string,
    eventKey: string,
    activePanel: string,
    callback: (eventKey: string) => void
}

export const CommitsNavigation = ({ eventKey, activePanel, callback, title }: CommitsNavigationProps) => {
    const pluginactions = React.useContext(pluginActionsContext)
    const [pullEnabled, setPullEnabled] = React.useState(true)
    const [pushEnabled, setPushEnabled] = React.useState(true)
    const [syncEnabled, setSyncEnabled] = React.useState(false)
    const [fetchEnabled, setFetchEnabled] = React.useState(true)
    const context = React.useContext(gitPluginContext)

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
                    <label className="pl-1 nav form-check-label">{title}</label>


                </span>
                {
                    activePanel === eventKey ?
                        <span className='d-flex justify-content-end align-items-center w-25'>
                            {pullEnabled ? 
                            <CustomTooltip tooltipText={<FormattedMessage id="git.pull" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></button>
                            </CustomTooltip>: null}
                            {pushEnabled ? 
                            <CustomTooltip tooltipText={<FormattedMessage id="git.push" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></button>
                            </CustomTooltip>: null}
                            {syncEnabled ? 
                            <CustomTooltip tooltipText={<FormattedMessage id="git.sync" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowsUpDown} className="" /></button>
                            </CustomTooltip>: null}
                            {fetchEnabled ? 
                            <CustomTooltip tooltipText={<FormattedMessage id="git.fetch" />}>
                                <button onClick={async () => { await pluginactions.loadFiles() }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowRotateRight} className="" /></button>
                            </CustomTooltip>: null}             
                        </span> : null
                }

            </div>
        </>
    );
}