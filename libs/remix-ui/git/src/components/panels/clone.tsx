
import React, { useState } from "react";
import { Alert, Form, FormControl, InputGroup } from "react-bootstrap";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { SelectAndCloneRepositories } from "../github/selectandclonerepositories";
import { RemixUiCheckbox } from "@remix-ui/checkbox";
import GitUIButton from "../buttons/gituibutton";

export const Clone = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)
    const [cloneUrl, setCloneUrl] = useLocalStorage(
        "CLONE_URL",
        ''
    );

    const [cloneDepth, setCloneDepth] = useLocalStorage(
        "CLONE_DEPTH",
        1
    );

    const [cloneBranch, setCloneBranch] = useLocalStorage(
        "CLONE_BRANCH",
        ''
    );

    const [url, setUrl] = useLocalStorage(
        "GITHUB_URL",
        ''
    );


    const clone = async () => {
        await actions.clone(cloneUrl, cloneBranch, cloneDepth, !cloneAllBranches)
    }

    const onCloneBranchChange = (value: string) => {
        setCloneBranch(value)
    }

    const onGitHubCloneUrlChange = (value: string) => {
        setCloneUrl(value)
    }

    const onDepthChange = (value: number) => {
        setCloneDepth(value)
    }

    const [cloneAllBranches, setcloneAllBranches] = useLocalStorage(
        "GITHUB_CLONE_ALL_BRANCES",
        false
    );

    const onAllBranchChange = () => {
        setcloneAllBranches((e: any) => !e)
    }

    return (
        <>
            <InputGroup className="mb-1">
                <FormControl id="cloneulr" placeholder="url" name='cloneurl' value={cloneUrl} onChange={e => onGitHubCloneUrlChange(e.target.value)} aria-describedby="urlprepend" />
            </InputGroup>


            <input name='clonebranch' onChange={e => onCloneBranchChange(e.target.value)} value={cloneBranch} className="form-control mb-1 mt-2" placeholder="branch" type="text" id="clonebranch" />
            <GitUIButton disabledCondition={!cloneUrl || !cloneBranch} data-id='clonebtn' className='btn btn-primary mt-1 w-100' onClick={async () => {
                clone()
            }}>clone</GitUIButton>
            <hr />
            <SelectAndCloneRepositories cloneAllBranches={cloneAllBranches} cloneDepth={cloneDepth} />
            <hr />
            <label>options</label>
            <InputGroup className="mt-1 mb-1">
                <InputGroup.Prepend>
                    <InputGroup.Text id="clonedepthprepend">
                        --depth
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl id="clonedepth" type="number" value={cloneDepth} onChange={e => onDepthChange(parseInt(e.target.value))} aria-describedby="clonedepthprepend" />
            </InputGroup>

            <RemixUiCheckbox
                id={`cloneAllBranches`}
                inputType="checkbox"
                name="cloneAllBranches"
                label={`Clone all branches`}
                onClick={() => onAllBranchChange()}
                checked={cloneAllBranches}
                onChange={() => { }}
            />


            <hr></hr>
        </>)
}