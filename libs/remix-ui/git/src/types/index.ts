import { ReadCommitResult } from "isomorphic-git"

export type gitState = {
    currentBranch: string
    commits: ReadCommitResult[]
    branch: string
    canCommit: boolean
    branches: any[]
    remotes: remote[]
    fileStatusResult: fileStatusResult[]
    canUseApp: boolean
    loading: boolean
    storageUsed: any
    reponame: string
    staged: any[]
    untracked: any[]
    deleted: any[]
    modified: any[]
    allchangesnotstaged: any[],
    repositories: repository[]
    remoteBranches: remoteBranch[]
}

export type repository = {
    name: string
    html_url: string
    owner: {
        login: string
    },
    full_name: string
    default_branch: string
    id: number
}

export type remote = {
    remote: string
    url: string
}

export type remoteBranch = {
    name: string
}

export const defaultGitState: gitState = {
    currentBranch: "",
    commits: [],
    branch: "",
    canCommit: true,
    branches: [],
    remotes: [],
    fileStatusResult: [],
    staged: [],
    untracked: [],
    deleted: [],
    modified: [],
    allchangesnotstaged: [],
    canUseApp: false,
    loading: false,
    storageUsed: {},
    reponame: "",
    repositories: [],
    remoteBranches: []
}

export type fileStatusResult = {
    filename:string,
    status?: fileStatus
    statusNames?:string[]
}

export type fileStatus =[string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]

export type statusMatrixType = { matrix: string[] | undefined; status: string[] }

export interface fileStatusAction  {
    type: string,
    payload: fileStatusResult[]
}

export interface setCommitsAction {
    type: string,
    payload: ReadCommitResult[]
}

export interface setBranchesAction {
    type: string,
    payload: any[]
}

export interface setReposAction {
    type: string,
    payload: any[]
}

export interface setRemoteBranchesAction {
    type: string,
    payload: any[]
}

export interface setLoadingAction {
    type: string,
    payload: boolean
}

export interface setCanUseAppAction {
    type: string,
    payload: boolean
}

export interface setRepoNameAction {
    type: string,
    payload: string
}

export interface setCurrentBranchAction {
    type: string,
    payload: string
}

export interface setRemotesAction {
    type: string,
    payload: remote[]
}

export type gitActionDispatch = setRemotesAction | setCurrentBranchAction | fileStatusAction | setLoadingAction | setCanUseAppAction | setRepoNameAction | setCommitsAction | setBranchesAction | setReposAction | setRemoteBranchesAction