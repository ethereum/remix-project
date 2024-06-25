import { ElectronPlugin } from '@remixproject/engine-electron';

let workingDir = null

const fixPath = (path: string) => {
  return path
}

export class fsPlugin extends ElectronPlugin {
  public fs: any
  public fsSync: any

  constructor() {
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'lstat', 'exists', 'setWorkingDir', 'getRecentFolders', 'openWindow']

    // List of commands all filesystems are expected to provide. `rm` is not
    // included since it may not exist and must be handled as a special case
    const commands = [
      'readFile',
      'writeFile',
      'mkdir',
      'rmdir',
      'unlink',
      'stat',
      'lstat',
      'readdir',
      'readlink',
      'symlink',
    ]

    this.fs = {
      exists: async (path: string) => {
        path = fixPath(path)
        const exists = await this.call('fs', 'exists', path)
        return exists
      },
      rmdir: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'rmdir', path)
      },
      readdir: async (path: string) => {
        path = fixPath(path)
        const files = await this.call('fs', 'readdir', path)
        return files
      },
      unlink: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'unlink', path)
      },
      mkdir: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'mkdir', path)
      },
      readFile: async (path: string, options) => {
        try {
          path = fixPath(path)
          const file = await this.call('fs', 'readFile', path, options)
          return file
        } catch (e) {
          return undefined
        }
      }
      ,
      rename: async (from: string, to: string) => {
        return await this.call('fs', 'rename', from, to)
      },
      writeFile: async (path: string, content: string, options: any) => {
        path = fixPath(path)
        return await this.call('fs', 'writeFile', path, content, options)
      }
      ,
      stat: async (path: string) => {
        try {
          path = fixPath(path)
          const stat = await this.call('fs', 'stat', path)
          if (!stat) return undefined
          stat.isDirectory = () => stat.isDirectoryValue
          stat.isFile = () => !stat.isDirectoryValue
          return stat
        } catch (e) {
          return undefined
        }
      },
      lstat: async (path: string) => {
        try {
          path = fixPath(path)
          const stat = await this.call('fs', 'lstat', path)
          if (!stat) return undefined
          stat.isDirectory = () => stat.isDirectoryValue
          stat.isFile = () => !stat.isDirectoryValue
          return stat
        } catch (e) {
          return undefined
        }
      },
      readlink: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'readlink', path)
      },
      symlink: async (target: string, path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'symlink', target, path)
      }
    }
  }

  async onActivation() {
    (window as any).remixFileSystem = this.fs
    this.on('fs', 'workingDirChanged', async (path: string) => {
      workingDir = path
      await this.call('fileManager', 'refresh')
    })
    this.on('fs', 'error', async (error: string) => {
      if (error === 'ENOSPC'){
        this.call('notification', 'alert', {
          id: 'fsError',
          message: 'Cannot watch file changes. There are too many files in your project.'
        })
      }
    })
  }
}
