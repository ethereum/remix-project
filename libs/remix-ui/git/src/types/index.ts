import { ReadCommitResult } from "isomorphic-git"

export type gitState = {
    currentBranch: string
    commits: ReadCommitResult[]
    branch: string
    canCommit: boolean
    branches: any[]
    remotes: any[]
    fileStatusResult: fileStatusResult[]
    canUseApp: boolean
    loading: boolean
    storageUsed: any
    reponame: string
    staged: any[]
    untracked: any[]
    deleted: any[]
    modified: any[]
    allchangesnotstaged: any[]
}

export const defaultGitState: gitState = {
    currentBranch: "",
    commits: [],
    branch: "",
    canCommit: false,
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
    reponame: ""
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

export type gitActionDispatch = fileStatusAction | setLoadingAction | setCanUseAppAction | setRepoNameAction