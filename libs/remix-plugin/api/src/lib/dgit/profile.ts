import { IDgitSystem } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const dGitProfile: LibraryProfile<IDgitSystem> = {
  name: 'dGitProvider',
  methods: ['clone', 'addremote', 'delremote', 'remotes', 'init', 'status', 'log', 'commit', 'add', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branch', 'branches','checkout','currentbranch', 'zip', 'push', 'pull', 'setIpfsConfig','getItem','setItem', 'localStorageUsed']
}
