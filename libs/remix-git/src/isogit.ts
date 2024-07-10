import { branch, commitChange, currentBranchInput, isoGitConfig, remote } from "@remix-api"
import git from 'isomorphic-git'

const currentbranch = async (input: currentBranchInput, defaultConfig: isoGitConfig ) => {
    console.log('CURRENT BRANCH', input)

    try {
      const cmd = input ? defaultConfig ? { ...defaultConfig, ...input } : input : defaultConfig
      
      const name = await git.currentBranch(cmd)
      let remote: remote = undefined
      try {
        const remoteName = await git.getConfig({
          ...defaultConfig,
          path: `branch.${name}.remote`
        })
        if (remoteName) {
          const remoteUrl = await git.getConfig({
            ...defaultConfig,
            path: `remote.${remoteName}.url`
          })
          remote = { name: remoteName, url: remoteUrl }
        }

      } catch (e) {
        // do nothing
      }
      console.log('NAME', name)
      console.log('REMOTE', remote)
      
      return {
        remote: remote,
        name: name || ''
      }
    } catch (e) {
      return undefined
    }
  }

  const branches = async (defaultConfig: isoGitConfig ) => {
    try {

      const remotes = await isoGit.remotes(defaultConfig)
      let branches: branch[] = []
      branches = (await git.listBranches(defaultConfig)).map((branch) => { return { remote: undefined, name: branch } })
      for (const remote of remotes) {
        const cmd = {
          ...defaultConfig,
          remote: remote.name
        }
        const remotebranches = (await git.listBranches(cmd)).map((branch) => { return { remote: remote, name: branch } })
        branches = [...branches, ...remotebranches]
      }
      return branches
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const remotes = async(defaultConfig: isoGitConfig) => {

    let remotes: remote[] = []
    try {
      remotes = (await git.listRemotes({ ...defaultConfig })).map((remote) => { return { name: remote.remote, url: remote.url } }
      )
    } catch (e) {
      // do nothing
    }
    return remotes
  }

  const getCommitChanges = async (commitHash1: string, commitHash2: string, defaultConfig: isoGitConfig) => {
    const result: commitChange[] = await git.walk({
      ...defaultConfig,
      trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
      map: async function (filepath, [A, B]) {

        if (filepath === '.') {
          return
        }
        try {
          if ((A && await A.type()) === 'tree' || B && (await B.type()) === 'tree') {
            return
          }
        } catch (e) {
          // ignore
        }

        // generate ids
        const Aoid = A && await A.oid() || undefined
        const Boid = B && await B.oid() || undefined

        const commitChange: Partial<commitChange> = {
          hashModified: commitHash1,
          hashOriginal: commitHash2,
          path: filepath,
        }

        // determine modification type
        if (Aoid !== Boid) {
          commitChange.type = "modified"
        }
        if (Aoid === undefined) {
          commitChange.type = "deleted"
        }
        if (Boid === undefined || !commitHash2) {
          commitChange.type = "added"
        }
        if (Aoid === undefined && Boid === undefined) {
          commitChange.type = "unknown"
        }
        if (commitChange.type)
          return commitChange
        else
          return undefined
      },
    })

    return result
  }

  export const isoGit = {
    currentbranch,
    remotes,
    branches,
    getCommitChanges
  }