import { allChangedButNotStagedFiles, getFilesByStatus, getFilesWithNotModifiedStatus } from "../lib/fileHelpers"
import { defaultGitState, gitState } from "../types"

interface Action {
    type: string
    payload: any
}

export const gitReducer = (state: gitState = defaultGitState, action: Action) => {
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

        case 'SET_COMMITS':
            return {
                ...state,
                commits: action.payload
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
                repoName: action.payload
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

    }
}