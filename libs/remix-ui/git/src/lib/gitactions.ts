import { ViewPlugin } from "@remixproject/engine-web";
import { ReadBlobResult, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { fileStatus, fileStatusMerge, setRemoteBranchCommits, resetRemoteBranchCommits, setBranches, setCanCommit, setCommitChanges, setCommits, setCurrentBranch, setGitHubUser, setLoading, setRateLimit, setRemoteBranches, setRemotes, setRepos, setUpstream, setLocalBranchCommits, setBranchDifferences, setRemoteAsDefault, setScopes, setLog, clearLog, setUserEmails } from "../state/gitpayload";
import { GitHubUser, RateLimit, branch, commitChange, gitActionDispatch, statusMatrixType, gitState, branchDifference, remote, gitLog, fileStatusResult, customGitApi, IGitApi, cloneInputType, fetchInputType, pullInputType, pushInputType, checkoutInput, rmInput, addInput, repository, userEmails } from '../types';
import { removeSlash } from "../utils";
import { disableCallBacks, enableCallBacks } from "./listeners";
import { AlertModal, ModalTypes } from "@remix-ui/app";
import { gitActions, gitActionsContext } from "../state/context";
import { gitPluginContext } from "../components/gitui";
import { setFileDecorators } from "./pluginActions";
import { IDgitSystem, IRemixApi, RemixApi } from "@remixproject/plugin-api";
import { Plugin } from "@remixproject/engine";
import { AnyMxRecord } from "dns";
import { StatusEvents } from "@remixproject/plugin-utils";
import { CustomRemixApi } from "@remix-api";

export const fileStatuses = [
  ["new,untracked", 0, 2, 0], // new, untracked
  ["added,staged", 0, 2, 2], //
  ["added,staged,with unstaged changes", 0, 2, 3], // added, staged, with unstaged changes
  ["unmodified", 1, 1, 1], // unmodified
  ["modified,unstaged", 1, 2, 1], // modified, unstaged
  ["modified,staged", 1, 2, 2], // modified, staged
  ["modified,staged,with unstaged changes", 1, 2, 3], // modified, staged, with unstaged changes
  ["deleted,unstaged", 1, 0, 1], // deleted, unstaged
  ["deleted,staged", 1, 0, 0],
  ["unmodified", 1, 1, 3],
  ["deleted,not in git", 0, 0, 3],
  ["unstaged,modified", 1, 2, 0]
];

const statusmatrix: statusMatrixType[] = fileStatuses.map((x: any) => {
  return {
    matrix: x.shift().split(","),
    status: x,
  };
});

let plugin: Plugin<any, CustomRemixApi>, dispatch: React.Dispatch<gitActionDispatch>

export const setPlugin = (p: Plugin, dispatcher: React.Dispatch<gitActionDispatch>) => {
  plugin = p
  dispatch = dispatcher
  console.log('setPlugin')
}

export const getBranches = async () => {
  console.log('getBranches')
  const branches = await plugin.call('dgitApi', "branches")
  console.log('branches :>>', branches)
  dispatch(setBranches(branches));
}
export const getRemotes = async () => {
  console.log('getRemotes')
  const remotes: remote[] = await plugin.call('dgitApi', "remotes");
  console.log('remotes :>>', remotes)
  dispatch(setRemotes(remotes));
}

export const setUpstreamRemote = async (remote: remote) => {
  dispatch(setUpstream(remote));
}

export const getFileStatusMatrix = async (filepaths: string[]) => {
  const fileStatusResult = await statusMatrix(filepaths);
  fileStatusResult.map((m) => {
    statusmatrix.map((sm) => {
      if (JSON.stringify(sm.status) === JSON.stringify(m.status)) {
        //Utils.log(m, sm);
        m.statusNames = sm.matrix;
      }
    });
  });
  //console.log(fileStatusResult);
  if (!filepaths) {
    dispatch(fileStatus(fileStatusResult))
  } else {
    dispatch(fileStatusMerge(fileStatusResult))
    setFileDecorators(fileStatusResult)
  }
}

export const getCommits = async () => {
  //Utils.log("get commits");
  console.log('getCommits')
  try {
    const commits: ReadCommitResult[] = await plugin.call(
      'dgitApi',
      "log",
      { ref: "HEAD" }
    );
    console.log('commits :>>', commits)
    return commits;
  } catch (e) {
    return [];
  }
}

export const gitlog = async () => {
  let commits = []
  try {
    commits = await getCommits()
  } catch (e) {
  }
  dispatch(setCommits(commits))
  await showCurrentBranch()
}

export const showCurrentBranch = async () => {
  try {
    const branch = await currentBranch();
    const currentcommitoid = await getCommitFromRef("HEAD");

    if (typeof branch === "undefined" || branch.name === "") {

      branch.name = `HEAD detached at ${currentcommitoid}`;
      //canCommit = false;
      dispatch(setCanCommit(false));
    } else {
      //canCommit = true;
      dispatch(setCanCommit(true));
      dispatch(setCurrentBranch(branch));
    }
  } catch (e) {
    // show empty branch
  }
}

export const currentBranch = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const branch: branch =
      (await plugin.call('dgitApi', "currentbranch")) || {
        name: "",
        remote: {
          name: "",
          url: "",
        },
      };
    return branch;
  } catch (e) {
    throw e;
  }
}

export const createBranch = async (name: string = "") => {
  dispatch(setLoading(true))
  if (name) {
    await plugin.call('dgitApi', 'branch', { ref: name });
    await plugin.call('dgitApi', 'checkout', { ref: name });
  }
  dispatch(setLoading(false))
}

export const getCommitFromRef = async (ref: string) => {
  const commitOid = await plugin.call('dgitApi', "resolveref", {
    ref: ref,
  });
  return commitOid;
}

const settingsWarning = async () => {
  const username = await plugin.call('config', 'getAppParameter', 'settings/github-user-name')
  const email = await plugin.call('config', 'getAppParameter', 'settings/github-email')
  if (!username || !email) {
    plugin.call('notification', 'toast', 'Please set your github username and email in the settings')
    return false;
  } else {
    return {
      username,
      email
    };
  }
}

export const commit = async (message: string = "") => {

  try {
    const credentials = await settingsWarning()
    if (!credentials) {
      dispatch(setLoading(false))
      return
    }

    const sha = await plugin.call('dgitApi', 'commit', {
      author: {
        name: credentials.username,
        email: credentials.email,
      },
      message: message,
    });

    sendToGitLog({
      type: 'success',
      message: `Commited: ${sha}`
    })

  } catch (err) {
    plugin.call('notification', 'toast', `${err}`)
  }

}

export const addall = async (files: fileStatusResult[]) => {
  try {
    console.log('addall', files.map(f => removeSlash(f.filename)))
    const filesToAdd = files.map(f => removeSlash(f.filename))
    try {
      add({ filepath: filesToAdd })
    } catch (e) { }
    sendToGitLog({
      type: 'success',
      message: `Added all files to git`
    })

  } catch (e) {
    plugin.call('notification', 'toast', `${e}`)
  }
}

export const add = async (filepath: addInput) => {
  try {
    await plugin.call('dgitApi', 'add', filepath);
    sendToGitLog({
      type: 'success',
      message: `Added to git`
    })
  } catch (e) {
    plugin.call('notification', 'toast', `${e}`)
  }

}

const getLastCommmit = async () => {
  try {
    let currentcommitoid = "";
    currentcommitoid = await getCommitFromRef("HEAD");
    return currentcommitoid;
  } catch (e) {
    return false;
  }
}

export const rm = async (args: rmInput) => {
  await plugin.call('dgitApi', 'rm', {
    filepath: removeSlash(args.filepath),
  });
  sendToGitLog({
    type: 'success',
    message: `Removed from git`
  })
}

export const checkoutfile = async (filename: string) => {
  const oid = await getLastCommmit();
  if (oid)
    try {
      const commitOid = await plugin.call('dgitApi', 'resolveref', {
        ref: oid,
      });
      const { blob } = await plugin.call('dgitApi', 'readblob', {
        oid: commitOid,
        filepath: removeSlash(filename),
      });
      const original = Buffer.from(blob).toString("utf8");
      //(original, filename);
      await disableCallBacks();
      await plugin.call(
        "fileManager",
        "setFile",
        removeSlash(filename),
        original
      );
      await enableCallBacks();
    } catch (e) {
      plugin.call('notification', 'toast', `No such file`)
    }
}

export const checkout = async (cmd: checkoutInput) => {
  console.log(cmd)
  await disableCallBacks();
  await plugin.call('fileManager', 'closeAllFiles')
  try {
    await plugin.call('dgitApi', 'checkout', cmd)
    gitlog();
  } catch (e) {
    plugin.call('notification', 'toast', `${e}`)
  }
  await enableCallBacks();
}

export const clone = async (input: cloneInputType) => {

  dispatch(setLoading(true))
  try {
    await disableCallBacks()
    // get last part of url
    const urlParts = input.url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const repoName = lastPart.split(".")[0];
    // add timestamp to repo name
    const timestamp = new Date().getTime();
    const repoNameWithTimestamp = `${repoName}-${timestamp}`;
    //const token = await tokenWarning();
    const token = await plugin.call('config' as any, 'getAppParameter' as any, 'settings/gist-access-token')

    await plugin.call('dgitApi', 'clone', { ...input, workspaceName: repoNameWithTimestamp });
    await enableCallBacks()

    sendToGitLog({
      type: 'success',
      message: `Cloned ${input.url} to ${repoNameWithTimestamp}`
    })
    //}
  } catch (e: any) {
    await parseError(e)
  }
  dispatch(setLoading(false))
}

export const fetch = async (input: fetchInputType) => {
  dispatch(setLoading(true))
  await disableCallBacks()
  try {
    await plugin.call('dgitApi', 'fetch', input);
    if (!input.quiet) {
      await gitlog()
      await getBranches()
    }
  } catch (e: any) {
    console.log(e)
    await parseError(e)
  }
  dispatch(setLoading(false))
  await enableCallBacks()
}

export const pull = async (input: pullInputType) => {
  dispatch(setLoading(true))
  await disableCallBacks()
  try {
    await plugin.call('dgitApi', 'pull', input)
    await gitlog()
  } catch (e: any) {
    await parseError(e)
  }
  dispatch(setLoading(false))
  await enableCallBacks()
}

export const push = async (input: pushInputType) => {
  dispatch(setLoading(true))
  await disableCallBacks()
  try {
    await plugin.call('dgitApi', 'push', input)
  } catch (e: any) {
    await parseError(e)
  }
  dispatch(setLoading(false))
  await enableCallBacks()
}

const tokenWarning = async () => {
  const token = await plugin.call('config' as any, 'getAppParameter' as any, 'settings/gist-access-token')
  if (!token) {
    return false;
  } else {
    return token;
  }
}

const parseError = async (e: any) => {
  console.trace(e)
  // if message conttains 401 Unauthorized, show token warning
  if (e.message.includes('401')) {
    const result = await plugin.call('notification', 'modal' as any, {
      title: 'The GitHub token may be missing or invalid',
      message: 'Please check the GitHub token and try again. Error: 401 Unauthorized',
      okLabel: 'Go to settings',
      cancelLabel: 'Close',
      type: ModalTypes.confirm
    })
    console.log(result)
  }
  // if message contains 404 Not Found, show repo not found
  else if (e.message.includes('404')) {
    await plugin.call('notification', 'modal' as any, {
      title: 'Repository not found',
      message: 'Please check the URL and try again.',
      okLabel: 'Go to settings',
      cancelLabel: 'Close',
      type: ModalTypes.confirm
    })
  }
  // if message contains 403 Forbidden
  else if (e.message.includes('403')) {
    await plugin.call('notification', 'modal' as any, {
      title: 'The GitHub token may be missing or invalid',
      message: 'Please check the GitHub token and try again. Error: 403 Forbidden',
      okLabel: 'Go to settings',
      cancelLabel: 'Close',
      type: ModalTypes.confirm
    })
  } else if (e.toString().includes('NotFoundError') && !e.toString().includes('fetch')) {
    await plugin.call('notification', 'modal', {
      title: 'Remote branch not found',
      message: 'The branch you are trying to fetch does not exist on the remote. If you have forked this branch from another branch, you may need to fetch the original branch first or publish this branch on the remote.',
      okLabel: 'OK',
      type: ModalTypes.alert
    })
  } else {
    await plugin.call('notification', 'alert' as any, {
      title: 'Error',
      message: e.message
    })
  }
}

export const repositories = async () => {
  try {
    const token = await tokenWarning();
    if (token) {
      let repos = await plugin.call('dgitApi', 'repositories', { token, per_page: 100 })
      dispatch(setRepos(repos))
      let page = 2
      let hasMoreData = true
      const per_page = 100
      while (hasMoreData) {
        const pagedResponse = await plugin.call('dgitApi', 'repositories', { token, page: page, per_page: per_page })
        if (pagedResponse.length < per_page) {
          hasMoreData = false
        }
        repos = [...repos, ...pagedResponse]
        dispatch(setRepos(repos))
        page++
      }

    } else {
      plugin.call('notification', 'alert', {
        title: 'Error getting repositories',
        message: `Please check your GitHub token in the GitHub settings... cannot connect to GitHub`
      })
      dispatch(setRepos([]))
    }
  } catch (e) {
    console.log(e)
    plugin.call('notification', 'alert', {
      title: 'Error getting repositories',
      message: `${e.message}: Please check your GitHub token in the GitHub settings.`
    })
    dispatch(setRepos([]))
  }
}

export const remoteBranches = async (owner: string, repo: string) => {
  try {
    const token = await tokenWarning();
    if (token) {
      let branches = await plugin.call('dgitApi' as any, 'remotebranches', { token, owner, repo, per_page: 100 });
      dispatch(setRemoteBranches(branches))
      let page = 2
      let hasMoreData = true
      const per_page = 100
      while (hasMoreData) {
        const pagedResponse = await plugin.call('dgitApi' as any, 'remotebranches', { token, owner, repo, page: page, per_page: per_page })
        if (pagedResponse.length < per_page) {
          hasMoreData = false
        }
        branches = [...branches, ...pagedResponse]
        dispatch(setRemoteBranches(branches))
        page++
      }
    } else {
      plugin.call('notification', 'alert', {
        title: 'Error getting branches',
        message: `Please check your GitHub token in the GitHub settings. It needs to have access to the branches.`
      })
      dispatch(setRemoteBranches([]))
    }
  } catch (e) {
    console.log(e)
    plugin.call('notification', 'alert', {
      title: 'Error',
      message: e.message
    })
    dispatch(setRemoteBranches([]))
  }
}

export const remoteCommits = async (url: string, branch: string, length: number) => {
  const urlParts = url.split("/");

  console.log(urlParts, 'urlParts')
  // check if it's github
  if (!urlParts[urlParts.length - 3].includes('github')) {
    return
  }

  const owner = urlParts[urlParts.length - 2];
  const repo = urlParts[urlParts.length - 1].split(".")[0];

  try {
    const token = await tokenWarning();
    if (token) {
      console.log(token, owner, repo, branch, length)
      const commits = await plugin.call('dgitApi' as any, 'remotecommits', { token, owner, repo, branch, length });
      console.log(commits, 'remote commits')
    } else {
      sendToGitLog({
        type: 'error',
        message: `Please check your GitHub token in the GitHub settings.`
      })
    }
  } catch (e) {
    console.log(e)
    plugin.call('notification', 'alert', {
      title: 'Error',
      message: e.message
    })
  }
}

export const saveGitHubCredentials = async (credentials: { username: string, email: string, token: string }) => {
  try {
    await plugin.call('config', 'setAppParameter', 'settings/github-user-name', credentials.username)
    await plugin.call('config', 'setAppParameter', 'settings/github-email', credentials.email)
    await plugin.call('config', 'setAppParameter', 'settings/gist-access-token', credentials.token)
  } catch (e) {
    console.log(e)
  }
}

export const getGitHubCredentialsFromLocalStorage = async () => {
  if (!plugin) return
  try {
    const username = await plugin.call('config', 'getAppParameter', 'settings/github-user-name')
    const email = await plugin.call('config', 'getAppParameter', 'settings/github-email')
    const token = await plugin.call('config', 'getAppParameter', 'settings/gist-access-token')
    return {
      username,
      email,
      token
    }
  } catch (e) {
    console.log(e)
  }
}

export const loadGitHubUserFromToken = async () => {
  if (!plugin) return
  try {
    const token = await tokenWarning();
    if (token) {
      const data: {
        user: GitHubUser,
        ratelimit: RateLimit
        scopes: string[]
        emails: userEmails
      } = await plugin.call('dgitApi' as any, 'getGitHubUser', { token });

      console.log('GET USER"', data)
      if (data && data.emails && data.user && data.user.login) {
        const primaryEmail = data.emails.find(email => email.primary)
        if (primaryEmail) await plugin.call('config', 'setAppParameter', 'settings/github-email', primaryEmail.email)
        data.user && data.user.login && await plugin.call('config', 'setAppParameter', 'settings/github-user-name', data.user.login)
        dispatch(setGitHubUser(data.user))
        dispatch(setRateLimit(data.ratelimit))
        dispatch(setScopes(data.scopes))
        dispatch(setUserEmails(data.emails))
      }
    } else {
      const credentials = await getGitHubCredentialsFromLocalStorage()
      if (credentials) {
        //dispatch(setGitHubUser({ login: credentials.username }))
        //dispatch(setUserEmails([{ email: credentials.email, primary: true, visibility: 'public', verified: true }]))
      }
      dispatch(setGitHubUser(null))
    }
  } catch (e) {
    console.log(e)
  }
}

export const statusMatrix = async (filepaths: string[]) => {
  const matrix = await plugin.call('dgitApi', 'status', { ref: "HEAD", filepaths: filepaths || ['.'] });
  const result = (matrix || []).map((x) => {
    return {
      filename: `/${x.shift()}`,
      status: x,
      statusNames: []
    };
  });

  return result;
}

export const resolveRef = async (ref: string) => {
  const oid = await plugin.call('dgitApi', "resolveref", {
    ref,
  });
  return oid;
}

export const diff = async (commitChange: commitChange) => {

  if (!commitChange.hashModified) {
    const newcontent = await plugin.call(
      "fileManager",
      "readFile",//
      removeSlash(commitChange.path)
    );
    commitChange.modified = newcontent;
    commitChange.readonly = false;

  } else {

    try {
      const modifiedContentReadBlobResult: ReadBlobResult = await plugin.call('dgitApi', "readblob", {
        oid: commitChange.hashModified,
        filepath: removeSlash(commitChange.path),
      });

      const modifiedContent = Buffer.from(modifiedContentReadBlobResult.blob).toString("utf8");
      console.log(modifiedContent)
      commitChange.modified = modifiedContent;
      commitChange.readonly = true;
    } catch (e) {
      commitChange.modified = "";
    }
  }

  try {
    const originalContentReadBlobResult: ReadBlobResult = await plugin.call('dgitApi', "readblob", {
      oid: commitChange.hashOriginal,
      filepath: removeSlash(commitChange.path),
    });

    const originalContent = Buffer.from(originalContentReadBlobResult.blob).toString("utf8");
    console.log(originalContent)
    commitChange.original = originalContent;
  } catch (e) {
    commitChange.original = "";
  }

}

export const getCommitChanges = async (oid1: string, oid2: string, branch?: branch, remote?: remote) => {
  console.log(oid1, oid2, branch, remote)

  try {
    let log
    try {
      // check if oid2 exists
      log = await plugin.call('dgitApi', 'log', {
        ref: branch ? branch.name : 'HEAD',
      })
      console.log(log, 'log')
    } catch (e) {
      console.log(e, 'log error')
    }
    if (log) {
      const foundCommit = log.find((commit: ReadCommitResult) => commit.oid === oid2)
      if (!foundCommit && remote) {
        console.log('getCommitChanges fetching remote')
        //await fetch(remote ? remote.name : null, branch ? branch.name : null, null, 5, true, true)
        await fetch({
          remote: remote,
          singleBranch: true,
          quiet: true,
          relative: true,
          depth: 5,
          ref: branch,
          remoteRef: null
        })
      }
    }
    const result: commitChange[] = await plugin.call('dgitApi', 'getCommitChanges', oid1, oid2)
    dispatch(setCommitChanges(result))
    return result
  } catch (e) {
    console.log(e)
    return false
  }
}

async function getRepoDetails(url: string) {
  // Extract the owner and repo name from the URL
  const pathParts = new URL(url).pathname.split('/').filter(part => part);
  if (pathParts.length < 2) {
    throw new Error("URL must be in the format 'https://github.com/[owner]/[repository]'");
  }
  const owner = pathParts[0];
  const repo = pathParts[1];
  return { owner, repo };
}

export const fetchBranch = async (branch: branch, page: number) => {
  if (!branch.remote || !branch.remote.url) return
  const token = await tokenWarning();
  console.log('fetch', branch)
  if (page == 1) {
    dispatch(resetRemoteBranchCommits({ branch }))
  }
  const { owner, repo } = await getRepoDetails(branch.remote.url);
  const rc = await plugin.call('dgitApi', 'remotecommits', { token, owner: owner, repo: repo, branch: branch.name, length, page });
  console.log(rc, 'remote commits from octokit')
  dispatch(setRemoteBranchCommits({ branch, commits: rc }))
  return
}

export const getBranchDifferences = async (branch: branch, remote: remote, state: gitState) => {
  if (!remote && state) {
    if (state.defaultRemote) {
      remote = state.defaultRemote
    } else {
      remote = state.remotes.find((remote: remote) => remote.name === 'origin')
    }
    if (!remote && state.remotes[0]) {
      remote = state.remotes[0]
    }
  }
  if (!remote) return
  try {
    console.log('compare', branch, remote)
    const branchDifference: branchDifference = await plugin.call('dgitApi', 'compareBranches', {
      branch,
      remote
    })

    dispatch(setBranchDifferences(
      {
        branch,
        remote,
        branchDifference: branchDifference
      }))
  } catch (e) {
    console.log(e)
  }
}

export const getBranchCommits = async (branch: branch, page: number) => {
  dispatch(setLoading(true))
  await disableCallBacks()
  try {
    console.log(branch)
    if (!branch.remote) {
      const commits: ReadCommitResult[] = await plugin.call('dgitApi', 'log', {
        ref: branch.name,
      })
      console.log(commits)
      dispatch(setLocalBranchCommits({ branch, commits }))
    } else {
      await fetchBranch(branch, page)
    }
  } catch (e) {
    console.trace(e)
    await fetchBranch(branch, page)
  }
  dispatch(setLoading(false))
  await enableCallBacks()
}

export const setDefaultRemote = async (remote: remote) => {
  dispatch(setRemoteAsDefault(remote))
}

export const addRemote = async (remote: remote) => {
  try {
    await plugin.call('dgitApi', 'addremote', remote)
    await getRemotes()
  } catch (e) {
    console.log(e)
  }
}

export const removeRemote = async (remote: remote) => {
  try {
    await plugin.call('dgitApi', 'delremote', remote)
    await getRemotes()
  } catch (e) {
    console.log(e)
  }
}

export const sendToGitLog = async (message: gitLog) => {
  dispatch(setLog(message))
}

export const clearGitLog = async () => {
  dispatch(clearLog())
}