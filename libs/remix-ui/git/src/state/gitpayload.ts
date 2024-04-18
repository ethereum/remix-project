import { ReadCommitResult } from "isomorphic-git"
import { GitHubUser, branch, commitChange, fileStatusResult, remote } from "../types"
import { Endpoints } from "@octokit/types"

export const fileStatus = (files: fileStatusResult[]) => {
    return {
        type: 'FILE_STATUS',
        payload: files
    }
}

export const fileStatusMerge = (files: fileStatusResult[]) => {
    return {
        type: 'FILE_STATUS_MERGE',
        payload: files
    }
}

export const setCommits = (commits: ReadCommitResult[]) => {
    return {
        type: 'SET_COMMITS',
        payload: commits
    }
}

export const setBranches = (branches: any[]) => {
    return {
        type: 'SET_BRANCHES',
        payload: branches
    }
}

export const setRepos = (repos: any[]) => {
    return {
        type: 'SET_REPOS',
        payload: repos
    }
}

export const setRemoteBranches = (branches: any[]) => {
    return {
        type: 'SET_REMOTE_BRANCHES',
        payload: branches
    }
}

export const setGitHubUser = (user: any) => {
    return {
        type: 'SET_GITHUB_USER',
        payload: user
    }
}

export const setRateLimit = (rateLimit: any) => {
    return {
        type: 'SET_RATE_LIMIT',
        payload: rateLimit
    }
}

export const setGitHubAccessToken = (token: string) => {
    return {
        type: 'SET_GITHUB_ACCESS_TOKEN',
        payload: token
    }
}


export const setLoading = (loading: boolean) => {
    return {
        type: 'SET_LOADING',
        payload: loading
    }
}

export const setCanUseApp = (canUseApp: boolean) => {
    return {
        type: 'SET_CAN_USE_APP',
        payload: canUseApp
    }
}

export const setRepoName = (reponame: string) => {
    return {
        type: 'SET_REPO_NAME',
        payload: reponame
    }
}

export const setCurrentBranch = (currentBranch: branch) => {
    return {
        type: 'SET_CURRENT_BRANCH',
        payload: currentBranch
    }
}

export const setCanCommit = (canCommit: boolean) => {
    return {
        type: 'SET_CAN_COMMIT',
        payload: canCommit
    }
}

export const setRemotes = (remotes: remote[]) => {
    return {
        type: 'SET_REMOTES',
        payload: remotes
    }
}

export const setUpstream = (upstream: string) => {
    return {
        type: 'SET_UPSTREAM',
        payload: upstream
    }
}

export const setCommitChanges = (commitChanges: commitChange[]) => {
    return {
        type: 'SET_COMMIT_CHANGES',
        payload: commitChanges
    }
}

export const setRemoteBranchCommits =({branch, commits}) => {
    return {
        type: 'SET_REMOTE_BRANCH_COMMITS',
        payload: { branch, commits }
    }
}

export const setLocalBranchCommits = ({branch, commits}) => {
    return {
        type: 'SET_LOCAL_BRANCH_COMMITS',
        payload: { branch, commits }
    }
}

export const setGItHubToken = (token: string) => {
    return {
        type: 'SET_GITHUB_ACCESS_TOKEN',
        payload: token
    }
}
