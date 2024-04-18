import { ReadCommitResult } from "isomorphic-git"
import { allChangedButNotStagedFiles, getFilesByStatus, getFilesWithNotModifiedStatus } from "../lib/fileHelpers"
import { branch, commitChange, defaultGitState, fileStatusResult, gitState, setRemoteBranchCommitsAction, setLocalBranchCommitsAction } from "../types"

interface Action {
    type: string
    payload: any
}

export const gitReducer = (state: gitState = defaultGitState, action: Action): gitState => {
    ///console.log(action, state)
    switch (action.type) {
       
        case 'FILE_STATUS':
            return {
                ...state,
                fileStatusResult: action.payload,
                staged: getFilesByStatus("staged", action.payload),
                modified: getFilesByStatus("modified", action.payload),
                untracked: getFilesByStatus("untracked", action.payload),
                deleted: getFilesByStatus("deleted", action.payload),
                allchangesnotstaged: allChangedButNotStagedFiles(action.payload)
            }

        case 'FILE_STATUS_MERGE':
            const filesStatusResults: fileStatusResult[] = action.payload
            filesStatusResults.map((fileStatusResult: fileStatusResult) => {
                const file = state.fileStatusResult.find( stateFile => {
                    return stateFile.filename === fileStatusResult.filename
                })
                if(file){
                    file.status = fileStatusResult.status
                    file.statusNames = fileStatusResult.statusNames
                }
            })
            
            return {...state,
                staged: getFilesByStatus("staged", state.fileStatusResult),
                modified: getFilesByStatus("modified", state.fileStatusResult),
                untracked: getFilesByStatus("untracked", state.fileStatusResult),
                deleted: getFilesByStatus("deleted", state.fileStatusResult),
                allchangesnotstaged: allChangedButNotStagedFiles(state.fileStatusResult)
            }

        case 'SET_COMMITS':
            return {
                ...state,
                commits: action.payload,
                localCommitCount: action.payload.length
            }

        case 'SET_BRANCHES':
            return {
                ...state,
                branches: action.payload
            }
        
        case 'SET_CURRENT_BRANCH':
            return {
                ...state,
                currentBranch: action.payload
            }
            
        case 'SET_CAN_USE_APP':
            return {
                ...state,
                canUseApp: action.payload
            }
        case 'SET_REPO_NAME':
            return {
                ...state,
                reponame: action.payload
            }
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            }

        case 'SET_REPOS':
            return {
                ...state,
                repositories: action.payload
            }

        case 'SET_REMOTE_BRANCHES':
            return {
                ...state,
                remoteBranches: action.payload
            }   
        
        case 'SET_CAN_COMMIT':
            return {
                ...state,
                canCommit: action.payload
            }

        case 'SET_REMOTES':
            return {
                ...state,
                remotes: action.payload
            }

        case 'SET_UPSTREAM':
            return {
                ...state,
                upstream: action.payload
            }

        case 'SET_COMMIT_CHANGES':

            action.payload.forEach((change: commitChange) => {
                state.commitChanges.find((c) => c.hashModified === change.hashModified && c.hashOriginal === change.hashOriginal && c.path === change.path) ? null : state.commitChanges.push(change)
            })

            return {
                ...state,
                commitChanges: [...state.commitChanges]
            }

        case 'SET_REMOTE_BRANCH_COMMITS':
            if(state.remoteBranchCommits[(action as setRemoteBranchCommitsAction).payload.branch.name]){
                state.remoteBranchCommits[(action as setRemoteBranchCommitsAction).payload.branch.name].push(...(action  as setRemoteBranchCommitsAction).payload.commits)
            }else{
                state.remoteBranchCommits[(action as setRemoteBranchCommitsAction).payload.branch.name] =  (action  as setRemoteBranchCommitsAction).payload.commits
            }
            return {
                ...state,
                remoteBranchCommits: {...state.remoteBranchCommits}
            }

        case 'SET_LOCAL_BRANCH_COMMITS':
            if(state.localBranchCommits[(action as setLocalBranchCommitsAction).payload.branch.name]){
                state.localBranchCommits[(action as setLocalBranchCommitsAction).payload.branch.name].push(...(action  as setLocalBranchCommitsAction).payload.commits)
            }else{
                state.localBranchCommits[(action as setLocalBranchCommitsAction).payload.branch.name] =  (action  as setLocalBranchCommitsAction).payload.commits
            }
            return {
                ...state,
                localBranchCommits: {...state.localBranchCommits}
            }

        case 'SET_GITHUB_ACCESS_TOKEN':

        case 'SET_GITHUB_USER':
            return {
                ...state,
                gitHubUser: action.payload
            }

        case 'SET_RATE_LIMIT':
            console.log("rate limit", action.payload)
            return {
                ...state,
                rateLimit: action.payload
            }

        case 'SET_GITHUB_ACCESS_TOKEN':
            return {
                ...state,
                gitHubAccessToken: action.payload
            }
    }
}