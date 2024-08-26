import { ReadCommitResult } from "isomorphic-git"
import { branch, branchDifference, commitChange, fileStatusResult, GitHubUser, gitLog, pagedCommits, remote, remoteBranch, repository, storage, userEmails } from "../types"

export interface ActionPayloadTypes {
  FILE_STATUS: fileStatusResult[],
  FILE_STATUS_MERGE: fileStatusResult[]
  SET_COMMITS: ReadCommitResult[]
  SET_BRANCHES: branch[]
  SET_CURRENT_BRANCH: branch
  SET_CURRENT_HEAD: string
  SET_CAN_USE_APP: boolean
  SET_REPO_NAME: string
  SET_LOADING: boolean
  SET_REPOS: repository[]
  SET_REMOTE_BRANCHES: remoteBranch[]
  SET_CAN_COMMIT: boolean
  SET_REMOTES: remote[]
  SET_UPSTREAM: remote
  SET_COMMIT_CHANGES: commitChange[]
  RESET_REMOTE_BRANCH_COMMITS: {
    branch: branch
    pagedCommits: pagedCommits[]
  }
  SET_REMOTE_BRANCH_COMMITS: {
    branch: branch
    commits: pagedCommits[]
  }
  SET_LOCAL_BRANCH_COMMITS: {
    branch: branch
    commits: ReadCommitResult[]
  }
  SET_BRANCH_DIFFERENCES: {
    branch: branch
    remote: remote
    branchDifference: branchDifference
  }
  RESET_BRANCH_DIFFERENCES: null
  SET_GITHUB_USER: GitHubUser
  SET_RATE_LIMIT: any
  SET_GITHUB_ACCESS_TOKEN: string
  SET_SCOPES: string[]
  SET_DEFAULT_REMOTE: remote
  SET_LOG: gitLog
  CLEAR_LOG: void
  SET_USER_EMAILS: userEmails
  SET_STORAGE: storage
  SET_TIMESTAMP: number
  SET_GIT_LOG_COUNT: number
}

export interface Action<T extends keyof ActionPayloadTypes> {
  type: T,
  payload: ActionPayloadTypes[T]
}

export type Actions = {[A in keyof ActionPayloadTypes]: Action<A>}[keyof ActionPayloadTypes]