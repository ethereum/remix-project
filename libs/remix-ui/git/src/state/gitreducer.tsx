import { commitChange } from "@remix-api"
import { allChangedButNotStagedFiles, getFilesByStatus } from "../lib/fileHelpers"
import { defaultGitState, fileStatusResult, gitState } from "../types"
import { Actions } from "./actions"

export const gitReducer = (state: gitState = defaultGitState, action: Actions): gitState => {
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

  case 'FILE_STATUS_MERGE':
    action.payload.map((fileStatusResult: fileStatusResult) => {
      const file = state.fileStatusResult.find(stateFile => {
        return stateFile.filename === fileStatusResult.filename
      })
      if (file) {
        file.status = fileStatusResult.status
        file.statusNames = fileStatusResult.statusNames
      }
    })

    return {
      ...state,
      staged: getFilesByStatus("staged", state.fileStatusResult),
      modified: getFilesByStatus("modified", state.fileStatusResult),
      untracked: getFilesByStatus("untracked", state.fileStatusResult),
      deleted: getFilesByStatus("deleted", state.fileStatusResult),
      allchangesnotstaged: allChangedButNotStagedFiles(state.fileStatusResult)
    }

  case 'SET_COMMITS':
    return {
      ...state,
      commits: action.payload,
      localCommitCount: action.payload.length
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

  case 'SET_CURRENT_HEAD':
    return {
      ...state,
      currentHead: action.payload
    }

  case 'SET_CAN_USE_APP':
    return {
      ...state,
      canUseApp: action.payload
    }
  case 'SET_REPO_NAME':
    return {
      ...state,
      reponame: action.payload
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

  case 'SET_UPSTREAM':
    return {
      ...state,
      upstream: action.payload
    }

  case 'SET_COMMIT_CHANGES':

    action.payload.forEach((change: commitChange) => {
      state.commitChanges.find((c) => c.hashModified === change.hashModified && c.hashOriginal === change.hashOriginal && c.path === change.path) ? null : state.commitChanges.push(change)
    })

    return {
      ...state,
      commitChanges: [...state.commitChanges]
    }

  case 'RESET_REMOTE_BRANCH_COMMITS':
    if (state.remoteBranchCommits[action.payload.branch.name]) {
      delete state.remoteBranchCommits[action.payload.branch.name]
    }
    return {
      ...state,
      remoteBranchCommits: { ...state.remoteBranchCommits }
    }

  case 'SET_REMOTE_BRANCH_COMMITS':
    if (state.remoteBranchCommits[action.payload.branch.name]) {
      state.remoteBranchCommits[action.payload.branch.name].push(...action.payload.commits)
    } else {
      state.remoteBranchCommits[action.payload.branch.name] = action.payload.commits
    }
    return {
      ...state,
      remoteBranchCommits: { ...state.remoteBranchCommits }
    }

  case 'SET_LOCAL_BRANCH_COMMITS':

    state.localBranchCommits[action.payload.branch.name] = action.payload.commits
    return {
      ...state,
      localBranchCommits: { ...state.localBranchCommits }
    }

  case 'SET_BRANCH_DIFFERENCES':

    state.branchDifferences[`${action.payload.remote.name}/${action.payload.branch.name}`] = action.payload.branchDifference

    return {
      ...state,
      branchDifferences: { ...state.branchDifferences }
    }

  case 'RESET_BRANCH_DIFFERENCES':
    return {
      ...state,
      branchDifferences: {}
    }

  case 'SET_GITHUB_USER':
    return {
      ...state,
      gitHubUser: action.payload
    }

  case 'SET_GITHUB_ACCESS_TOKEN':
    return {
      ...state,
      gitHubAccessToken: action.payload
    }

  case 'SET_SCOPES':
    return {
      ...state,
      gitHubScopes: action.payload
    }

  case 'SET_USER_EMAILS':
    return {
      ...state,
      userEmails: action.payload
    }

  case 'SET_DEFAULT_REMOTE':
    return {
      ...state,
      defaultRemote: action.payload
    }

  case 'SET_LOG':
    if (state.log.length > 0 && state.log[[...state.log].length - 1].message === action.payload.message) {
      return {
        ...state,
        log: [...state.log]
      }
    }
    return {
      ...state,
      log: [...state.log, action.payload]
    }

  case 'CLEAR_LOG':
    return {
      ...state,
      log: []
    }

  case 'DESKTOP_SET_WORKING_DIR':
    return {
      ...state,
      desktopWorkingDir: action.payload
    }

  case 'SET_VERSION':
    return {
      ...state,
      version: action.payload
    }
  case 'SET_STORAGE':
    return {
      ...state,
      storage: action.payload
    }
  case 'SET_TIMESTAMP':
    return {
      ...state,
      timestamp: action.payload
    }

  case 'SET_GIT_LOG_COUNT':
    return {
      ...state,
      gitLogCount: action.payload
    }
  }

}
