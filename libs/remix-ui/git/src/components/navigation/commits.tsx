import { faCaretDown, faArrowUp, faArrowDown, faArrowRotateRight, faCaretRight, faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTooltip } from "@remix-ui/helper";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { pluginActionsContext } from "../../state/context";
import { branch, remote } from "../../types";
import { SourceControlButtons } from "../buttons/sourcecontrolbuttons";
import { gitPluginContext } from "../gitui";

export interface CommitsNavigationProps {
    title: string,
    eventKey: string,
    activePanel: string,
    callback: (eventKey: string) => void
    branch?: branch,
    remote?: remote
}

export const CommitsNavigation = ({ eventKey, activePanel, callback, title, branch, remote }: CommitsNavigationProps) => {
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

                <SourceControlButtons branch={branch} remote={remote}></SourceControlButtons>


            </div>
        </>
    );
}