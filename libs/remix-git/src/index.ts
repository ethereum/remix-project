import { currentBranchInput, isoGitConfig, remote } from "@remix-api"
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

  export const isoGit = {
    currentbranch
  }