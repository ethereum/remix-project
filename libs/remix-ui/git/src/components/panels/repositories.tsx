import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { repository } from "../../types";
import { gitPluginContext } from "../gitui";


export const Repositories = () => {
    const context = React.useContext(gitPluginContext)
    const actions = React.useContext(gitActionsContext)
    const [branch, setBranch] = useState({ name: "" });
    const [repo, setRepo] = useState<repository>(null);

    useEffect(() => {
        console.log('context', context.repositories)
    }, [context.repositories])


    const fetchRepositories = async () => {
        try {
            console.log(await actions.repositories())
        } catch (e) {
            // do nothing
        }
    };

    const selectRepo = async (value: number | string) => {
        // find repo
        console.log('setRepo', value, context.repositories)

        const repo = context.repositories.find(repo => {
            return repo.id.toString() === value.toString()
        })
        console.log('repo', repo)
        if (repo) {
            setRepo(repo)
            const remotebranches = await actions.remoteBranches(repo.owner.login, repo.name)
            console.log(remotebranches)
        }
    }

    const selectRemoteBranch = async (value: number | string) => {
        console.log('setRemoteBranch', value)
        setBranch({ name: value.toString() })
    }

    const clone = async () => {
        try {
            console.log('clone', repo, branch)
        } catch (e) {
            // do nothing
        }
    };

    return (
        <>
            <Button onClick={fetchRepositories} className="w-100 mt-1">
                <i className="fab fa-github mr-1"></i>Fetch Repositories from GitHub
            </Button>
            {context.repositories && context.repositories.length ?
                <select onChange={(e) => selectRepo(e.target.value)} data-id="compiledContracts" id="compiledContracts" className="custom-select mt-1">
                    <option key={0} value={0}>-- Select a repository --</option>
                    {context.repositories.map(({ full_name, id }, index) => <option value={id} key={id}>{full_name}</option>)}
                </select>
                : null}
            {context.remoteBranches && context.remoteBranches.length ?
                <select onChange={(e) => selectRemoteBranch(e.target.value)} data-id="compiledContracts" id="compiledContracts" className="custom-select mt-1">
                    <option key={0} value={0}>-- Select a branch --</option>
                    {context.remoteBranches.map(({ name }, index) => <option value={name} key={name}>{name}</option>)}
                </select>
                : null}
            {repo && branch.name && branch.name !=='0' ?
                <button data-id='clonebtn' className='btn btn-primary mt-1 w-100' onClick={async () => {
                    await clone()
                }}>clone</button> : null}

        </>
    )
}


