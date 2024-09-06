import { Endpoints } from "@octokit/types"
import { IRemixApi } from "@remixproject/plugin-api"
import { LibraryProfile, StatusEvents } from "@remixproject/plugin-utils"
import { CommitObject, ReadBlobResult, ReadCommitResult, StatusRow } from "isomorphic-git"
import { CustomRemixApi } from "@remix-api";
import { Plugin } from "@remixproject/engine";

export type GitHubUser = Partial<Endpoints["GET /user"]["response"]['data']> & {
    isConnected: boolean
}

export type userEmails = Endpoints["GET /user/emails"]["response"]["data"]

export interface IGitUi {
    plugin: Plugin<any, CustomRemixApi>
}

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
        log(cmd: { ref: string, depth?: number }): Promise<ReadCommitResult[]>,
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
    force?: boolean
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
    fetch?: boolean
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
    currentHead: string
    commits: ReadCommitResult[]
    branch: string
    canCommit: boolean
    branches: branch[]
    remotes: remote[]
    defaultRemote: remote
    fileStatusResult: fileStatusResult[]
    canUseApp: boolean
    loading: boolean
    storage: storage
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
    userEmails: userEmails
    gitHubScopes: string[]
    gitHubAccessToken: string
    log: gitLog[]
    timestamp: number
    gitLogCount: number
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
  currentHead: "",
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
  canUseApp: true,
  loading: false,
  storage: {
    used: 0,
    total: 0,
    available: 0,
    percentUsed: 0,
    enabled: false
  },
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
  userEmails: [] as userEmails,
  gitHubScopes: [],
  gitHubAccessToken: "",
  log: [],
  timestamp: 0,
  gitLogCount: 22
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

export type storage = {
    used: number,
    total: number
    available: number
    percentUsed: number
    enabled: boolean
}

export enum gitMatomoEventTypes {
    INIT = 'INIT',
    COMMIT = 'COMMIT',
    PUSH = 'PUSH',
    PULL = 'PULL',
    ADDREMOTE = 'ADDREMOTE',
    RMREMOTE = 'RMREMOTE',
    CLONE = 'CLONE',
    FETCH = 'FETCH',
    ADD = 'ADD',
    ADD_ALL = 'ADD_ALL',
    RM = 'RM',
    CHECKOUT = 'CHECKOUT',
    CHECKOUT_LOCAL_BRANCH = 'CHECKOUT_LOCAL_BRANCH',
    CHECKOUT_REMOTE_BRANCH = 'CHECKOUT_REMOTE_BRANCH',
    DIFF = 'DIFF',
    BRANCH = 'BRANCH',
    CREATEBRANCH = 'CREATEBRANCH',
    GETGITHUBDEVICECODE = 'GET_GITHUB_DEVICECODE',
    CONNECTTOGITHUB = 'CONNECT_TO_GITHUB',
    DISCONNECTFROMGITHUB = 'DISCONNECT_FROM_GITHUB',
    SAVEMANUALGITHUBCREDENTIALS = 'SAVE_MANUAL_GITHUB_CREDENTIALS',
    LOADREPOSITORIESFROMGITHUB = 'LOAD_REPOSITORIES_FROM_GITHUB',
    COPYGITHUBDEVICECODE = 'COPY_GITHUB_DEVICE_CODE',
    CONNECTTOGITHUBSUCCESS = 'CONNECT_TO_GITHUB_SUCCESS',
    CONNECTTOGITHUBFAIL = 'CONNECT_TO_GITHUB_FAIL',
    OPENPANEL = 'OPEN_PANEL',
    ADDMANUALREMOTE = 'ADD_MANUAL_REMOTE',
    SETDEFAULTREMOTE = 'SET_DEFAULT_REMOTE',
    SETLOCALBRANCHINCOMMANDS = 'SET_LOCAL_BRANCH_IN_COMMANDS',
    SETREMOTEBRANCHINCOMMANDS = 'SET_REMOTE_IN_COMMANDS',
    REFRESH = 'REFRESH',
    ERROR = 'ERROR',
    LOADGITHUBUSERSUCCESS = 'LOAD_GITHUB_USER_SUCCESS',
}

export enum gitUIPanels {
    SOURCECONTROL = '0',
    COMMANDS = '1',
    BRANCHES = '2',
    COMMITS = '3',
    CLONE = '4',
    REMOTES = '5',
    GITHUB = '7',
    LOG = '6'
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

export interface setCurrentHeadAction {
    type: string,
    payload: string
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

export interface setTimeStampAction {
    type: string,
    payload: number
}

export type gitActionDispatch = setTimeStampAction | setCurrentHeadAction | clearLogAction | setLogAction | setDefaultRemoteAction | setTokenAction | setUpstreamAction | setRemoteBranchCommitsAction | setLocalBranchCommitsAction | setBranchDifferencesAction | setRemotesAction | setCurrentBranchAction | fileStatusAction | setLoadingAction | setCanUseAppAction | setRepoNameAction | setCommitsAction | setBranchesAction | setReposAction | setRemoteBranchesAction
