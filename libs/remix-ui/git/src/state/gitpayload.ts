import { ReadCommitResult } from "isomorphic-git"
import { fileStatusResult, gitLog } from "../types"
import { repository, pagedCommits, branch, remote, commitChange, branchDifference, GitHubUser, userEmails } from "@remix-api"
import { storage } from "../types"
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

export const setRepos = (repos: repository[]) => {
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

export const setGitHubUser = (user: GitHubUser) => {

  return {
    type: 'SET_GITHUB_USER',
    payload: user
  }
}

export const setUserEmails = (emails: userEmails) => {
  return {
    type: 'SET_USER_EMAILS',
    payload: emails
  }
}

export const setScopes = (scopes: string[]) => {
  return {
    type: 'SET_SCOPES',
    payload: scopes
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

export const setCurrenHead = (currentHead: string) => {
  return {
    type: 'SET_CURRENT_HEAD',
    payload: currentHead
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

export const setUpstream = (upstream: remote) => {
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

export const setRemoteBranchCommits = ({ branch, commits }:{
    branch: branch,
    commits: pagedCommits[]
}):{
    type: string;
    payload: { branch: branch; commits: pagedCommits[] };
} => {
  return {
    type: 'SET_REMOTE_BRANCH_COMMITS',
    payload: { branch, commits }
  }
}

export const resetRemoteBranchCommits = ({ branch }:{
    branch: branch,
}):{
    type: string;
    payload: { branch: branch };
} => {
  return {
    type: 'RESET_REMOTE_BRANCH_COMMITS',
    payload: { branch }
  }
}

export const setLocalBranchCommits = ({
  branch,
  commits
}: {
    branch: branch;
    commits: ReadCommitResult[];
}): {
    type: string;
    payload: { branch: branch; commits: ReadCommitResult[] };
} => {
  return {
    type: 'SET_LOCAL_BRANCH_COMMITS',
    payload: { branch, commits }
  };
};

export const setBranchDifferences = ({
  branch,
  remote,
  branchDifference
}:{
    branch: branch;
    remote: remote;
    branchDifference: branchDifference;
}) => {
  return {
    type: 'SET_BRANCH_DIFFERENCES',
    payload: { branch, remote, branchDifference }
  }
}

export const resetBranchDifferences = () => {
  return {
    type: 'RESET_BRANCH_DIFFERENCES'
  }
}

export const setGItHubToken = (token: string) => {
  return {
    type: 'SET_GITHUB_ACCESS_TOKEN',
    payload: token
  }
}

export const setRemoteAsDefault = (remote: remote) => {
  return {
    type: 'SET_DEFAULT_REMOTE',
    payload: remote
  }
}

export const setLog = (message: gitLog) => {
  return {
    type: 'SET_LOG',
    payload: message
  }
}

export const clearLog = () => {
  return {
    type: 'CLEAR_LOG'
  }
}

export const setDesktopWorkingDir = (dir: string) => {
  return {
    type: 'DESKTOP_SET_WORKING_DIR',
    payload: dir
  }
}

export const setVersion = (version: string) => {
  return {
    type: 'SET_VERSION',
    payload: version
  }
}
export const setStoragePayload = (storage: storage) => {
  return {
    type: 'SET_STORAGE',
    payload: storage
  }
}

export const setTimestamp = (timestamp: number) => {
  return {
    type: 'SET_TIMESTAMP',
    payload: timestamp
  }
}

export const setGitLogCount = (count: number) => {
  return {
    type: 'SET_GIT_LOG_COUNT',
    payload: count
  }
}
