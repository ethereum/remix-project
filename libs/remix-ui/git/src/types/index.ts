import { Endpoints } from "@octokit/types"
import { IRemixApi } from "@remixproject/plugin-api"
import { LibraryProfile, StatusEvents } from "@remixproject/plugin-utils"
import { CommitObject, ReadBlobResult, ReadCommitResult, StatusRow } from "isomorphic-git"
export type GitHubUser = Partial<Endpoints["GET /user"]["response"]['data']>
export type RateLimit = Endpoints["GET /rate_limit"]["response"]["data"]
export type userEmails = Endpoints["GET /user/emails"]["response"]["data"]

export interface IGitApi {
    events: {
        "checkout": () => void
        "clone": () => void
        "add": () => void
        "rm": () => void
        "commit": () => void
        "branch": () => void
        "init": () => void
    } & StatusEvents,
    methods: {
        getCommitChanges(oid1: string, oid2: string): Promise<commitChange[]>
        repositories(input: repositoriesInput): Promise<repository[]>
        clone(input: cloneInputType): Promise<any>
        branches(input?: branchesInput): Promise<branch[]>,
        remotes(): Promise<remote[]>,
        log(cmd: { ref: string }): Promise<ReadCommitResult[]>,
        remotecommits(input: remoteCommitsInputType): Promise<pagedCommits[]>
        fetch(input: fetchInputType): Promise<any>
        pull(input: pullInputType): Promise<any>
        push(input: pushInputType): Promise<any>
        currentbranch(input?: currentBranchInput): Promise<branch>
        branch(input: branchInputType): Promise<void>
        checkout(input: checkoutInput): Promise<void>
        add(input: addInput): Promise<void>
        rm(input: rmInput): Promise<void>
        resolveref(input: resolveRefInput): Promise<string>
        readblob(input: readBlobInput): Promise<ReadBlobResult>
        commit(input: commitInput): Promise<string>
        addremote(input: remote): Promise<void>
        delremote(input: remote): Promise<void>
        status(input?: statusInput): Promise<Array<StatusRow>>
        compareBranches(input: compareBranchesInput): Promise<branchDifference>
        init(input?: initInput): Promise<void>
        updateSubmodules: (input: updateSubmodulesInput) => Promise<void>
    }
}

export type initInput = {
    defaultBranch: string
}

export type updateSubmodulesInput = {
    dir?: string
    token?: string
}

export type remoteCommitsInputType = {
    owner: string, repo: string, token: string, branch: string, length: number, page: number
}

export type compareBranchesInput = {
    branch: branch, remote: remote
}

export type fetchInputType = {
    remote: remote, 
    ref?: branch, 
    remoteRef?: branch, 
    depth?: number, 
    singleBranch?: boolean, 
    relative?: boolean, 
    quiet?: boolean
}

export type pullInputType = {
    remote: remote, ref: branch, remoteRef?: branch
}

export type pushInputType = {
    remote: remote, ref: branch, remoteRef?: branch, force?: boolean
}

export type branchInputType = {
    ref: string,
    checkout?: boolean
    refresh?: boolean
}

export type currentBranchInput = {
    fs: any,
    dir: string
}

export type checkoutInput = {
    ref: string,
    force?: boolean,
    remote?: string
    refresh?: boolean
}

export type addInput = {
    filepath: string | string[]
}

export type rmInput = {
    filepath: string
}

export type resolveRefInput = {
    ref: string
}

export type readBlobInput = {
    oid: string,
    filepath: string
}

export type commitInput = {
    author: {
        name: string,
        email: string,
    },
    message: string,
}

export type branchesInput = {
    fs?: any
    dir?: string
}

export interface cloneInputType {
    url: string,
    branch?: string,
    depth?: number,
    singleBranch?: boolean
    workspaceName?: string
    workspaceExists?: boolean
    token?: string
}

export interface repositoriesInput { token: string, page?: number, per_page?: number }

export interface statusInput { ref: string, filepaths?: string[] }

export const dGitProfile: LibraryProfile<IGitApi> = {
    name: 'dgitApi',
    methods: ['clone', 'branches', 'remotes', 'getCommitChanges', 'log', 'remotecommits'],
}


export interface customGitApi extends IRemixApi {
    dgit: IGitApi
}

export type gitState = {
    currentBranch: branch
    commits: ReadCommitResult[]
    branch: string
    canCommit: boolean
    branches: branch[]
    remotes: remote[]
    defaultRemote: remote
    fileStatusResult: fileStatusResult[]
    canUseApp: boolean
    loading: boolean
    storageUsed: any
    reponame: string
    staged: fileStatusResult[]
    untracked: fileStatusResult[]
    deleted: fileStatusResult[]
    modified: fileStatusResult[]
    allchangesnotstaged: fileStatusResult[],
    repositories: repository[]
    remoteBranches: remoteBranch[]
    commitChanges: commitChange[]
    remoteBranchCommits: Record<string, pagedCommits[]>
    localBranchCommits: Record<string, ReadCommitResult[]>
    branchDifferences: Record<remoteBranchIdentifier, branchDifference>
    syncStatus: syncStatus,
    localCommitCount: number
    remoteCommitCount: number
    upstream: remote
    gitHubUser: GitHubUser
    rateLimit: RateLimit
    userEmails: userEmails
    gitHubScopes: string[]
    gitHubAccessToken: string
    log: gitLog[]
}
export type gitLog = {
    type: 'error' | 'warning' | 'info' | 'success',
    message: string
}

export type remoteBranchIdentifier = `${string}/${string}`

export type branchDifference = {
    uniqueHeadCommits: ReadCommitResult[],
    uniqueRemoteCommits: ReadCommitResult[],
}

export type pagedCommits = {
    page: number,
    perPage: number,
    total: number,
    hasNextPage: boolean,
    commits: ReadCommitResult[]
}

export type loaderState = {
    branches: boolean
    remotes: boolean
    commits: boolean
    sourcecontrol: boolean
    plugin: boolean
}

export type commitChangeTypes = {
    "deleted": "D"
    "modified": "M"
    "added": "A",
    "unknown": "?"
}

export enum syncStatus {
    "sync" = "sync",
    "publishBranch" = "publishBranch",
    "none" = "none",
}

export type commitChangeType = keyof commitChangeTypes

export type commitChange = {
    type: commitChangeType
    path: string,
    hashModified: string,
    hashOriginal: string,
    original?: string,
    modified?: string,
    readonly?: boolean
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
    url: string
}

export type branch = {
    name: string
    remote: remote
}

export type remote = {
    name: string
    url: string
}

export type remoteBranch = {
    name: string
}

export const defaultGitState: gitState = {
    currentBranch: { name: "", remote: { name: "", url: "" } },
    commits: [],
    branch: "",
    canCommit: true,
    branches: [],
    remotes: [],
    defaultRemote: null,
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
    remoteBranches: [],
    commitChanges: [],
    remoteBranchCommits: {},
    localBranchCommits: {},
    branchDifferences: {},
    syncStatus: syncStatus.none,
    localCommitCount: 0,
    remoteCommitCount: 0,
    upstream: null,
    gitHubUser: {} as GitHubUser,
    rateLimit: {} as RateLimit,
    userEmails: [] as userEmails,
    gitHubScopes: [],
    gitHubAccessToken: "",
    log: []
}

export const defaultLoaderState: loaderState = {
    branches: false,
    commits: false,
    sourcecontrol: false,
    remotes: false,
    plugin: false
}

export type fileStatusResult = {
    filename: string,
    status?: fileStatus
    statusNames?: string[]
}

export type fileStatus = [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]

export type statusMatrixType = { matrix: string[] | undefined; status: string[] }

export type sourceControlGroup = {
    group: fileStatusResult[],
    name: string
}

export interface fileStatusAction {
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

export interface setGitHubUserAction {
    type: string,
    payload: any
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
    payload: branch
}

export interface setRemotesAction {
    type: string,
    payload: remote[]
}

export interface setUpstreamAction {
    type: string,
    payload: remote
}

export interface setRemoteBranchCommitsAction {
    type: string,
    payload: {
        branch: branch,
        commits: pagedCommits[]
    }
}

export interface setLocalBranchCommitsAction {
    type: string,
    payload: {
        branch: branch,
        commits: ReadCommitResult[]
    }
}

export interface setBranchDifferencesAction {
    type: string,
    payload: {
        branch: branch,
        remote: remote,
        branchDifference: branchDifference
    }
}

export interface setTokenAction {
    type: string,
    payload: string
}

export interface setDefaultRemoteAction {
    type: string,
    payload: remote
}

export interface setLogAction {
    type: string,
    payload: gitLog
}

export interface clearLogAction {
    type: string
}

export type gitActionDispatch = clearLogAction | setLogAction | setDefaultRemoteAction | setTokenAction | setUpstreamAction | setRemoteBranchCommitsAction | setLocalBranchCommitsAction | setBranchDifferencesAction | setRemotesAction | setCurrentBranchAction | fileStatusAction | setLoadingAction | setCanUseAppAction | setRepoNameAction | setCommitsAction | setBranchesAction | setReposAction | setRemoteBranchesAction