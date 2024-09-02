import { Endpoints } from "@octokit/types"
import { AuthCallback, HttpClient, ReadCommitResult } from "isomorphic-git"

export type branchDifference = {
  uniqueHeadCommits: ReadCommitResult[],
  uniqueRemoteCommits: ReadCommitResult[],
}


export type commitChange = {
  type: commitChangeType
  path: string,
  hashModified: string,
  hashOriginal: string,
  original?: string,
  modified?: string,
  readonly?: boolean
}

export type commitChangeTypes = {
  "deleted": "D"
  "modified": "M"
  "added": "A",
  "unknown": "?"
}

export type pagedCommits = {
  page: number,
  perPage: number,
  total: number,
  hasNextPage: boolean,
  commits: ReadCommitResult[]
}

export enum syncStatus {
  "sync" = "sync",
  "publishBranch" = "publishBranch",
  "none" = "none",
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

export type commitChangeType = keyof commitChangeTypes

export type initInputType = {
  defaultBranch: string
}

export type author = {
  name: string,
  email: string,
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
  author?: author
  token?: string
}

export type logInputType = {
  ref: string,
  depth?: number,
}

export type pullInputType = {
  remote: remote, 
  ref: branch, 
  remoteRef?: branch
  author?: author
  token?: string
}

export type pushInputType = {
  remote: remote, 
  ref: branch, 
  remoteRef?: branch, 
  force?: boolean,
  author?: author,
  token?: string
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

export type checkoutInputType = {
  ref: string,
  force?: boolean,
  remote?: string
  refresh?: boolean
  fetch?: boolean
}

export type addInputType = {
  filepath: string | string[]
}

export type rmInputType = {
  filepath: string
}

export type resolveRefInput = {
  ref: string
}

export type readBlobInput = {
  oid: string,
  filepath: string
}

export type commitInputType = {
  author: {
      name: string,
      email: string,
  },
  message: string,
}

export type branchesInputType = {
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
  dir?: string // where the clone should happen on desktop
}

export interface repositoriesInput { token: string, page?: number, per_page?: number }

export interface statusInput { ref: string, filepaths?: string[] }

export type isoGitFSConfig = {
  fs: any,
  dir: string,
}

export type isoGitProxyConfig = {
  corsProxy: string
  http: HttpClient
  onAuth: AuthCallback
}

export type GitHubUser = Partial<Endpoints["GET /user"]["response"]['data']> & {
  isConnected: boolean
}

export type userEmails = Endpoints["GET /user/emails"]["response"]["data"]

