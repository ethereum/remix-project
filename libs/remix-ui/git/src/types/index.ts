import { Endpoints } from "@octokit/types"
import { GitHubUser, branch, branchDifference, commitChange, pagedCommits, remote, remoteBranch, repository, syncStatus, userEmails } from "@remix-api"
import { ReadCommitResult } from "isomorphic-git"
import { Plugin } from "@remixproject/engine";
import { CustomRemixApi } from "@remix-api"

export interface IGitUi {
    plugin: Plugin<any, CustomRemixApi>
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
    desktopWorkingDir?: string
    version: string
    timestamp: number
    gitLogCount: number
}
export type gitLog = {
    type: 'error' | 'warning' | 'info' | 'success',
    message: string
}

export type remoteBranchIdentifier = `${string}/${string}`

export type loaderState = {
    branches: boolean
    remotes: boolean
    commits: boolean
    sourcecontrol: boolean
    plugin: boolean
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
  canUseApp: false,
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
  desktopWorkingDir: null,
  version: "",
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

export interface setDesktopWorkingDirAction {
    type: string,
    payload: string
}

export interface setTimeStampAction {
    type: string,
    payload: number
}

export type gitActionDispatch = setTimeStampAction |setDesktopWorkingDirAction | setCurrentHeadAction | clearLogAction | setLogAction | setDefaultRemoteAction | setTokenAction | setUpstreamAction | setRemoteBranchCommitsAction | setLocalBranchCommitsAction | setBranchDifferencesAction | setRemotesAction | setCurrentBranchAction | fileStatusAction | setLoadingAction | setCanUseAppAction | setRepoNameAction | setCommitsAction | setBranchesAction | setReposAction | setRemoteBranchesAction
