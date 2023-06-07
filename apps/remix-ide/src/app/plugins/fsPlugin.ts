import { ElectronPlugin } from '@remixproject/engine-electron';

const fixPath = (path: string) => {
  const workingDir = '/Volumes/bunsen/code/rmproject2/remix-project/apps/remix-ide/contracts/'
  // if it starts with /, it's an absolute path remove it
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  path = workingDir + path
  
  return path
}

export class fsPlugin extends ElectronPlugin {
  public fs: any
  constructor() {
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists']
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
        const files =  await this.call('fs', 'readdir', path)
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
      readFile: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'readFile', path)
      }
      ,
      rename: async (from: string, to: string) => {
        return await this.call('fs', 'rename', from, to)
      },
      writeFile: async (path: string, content: string) => {
        path = fixPath(path)
        return await this.call('fs', 'writeFile', path, content)
      }
      ,
      stat: async (path: string) => {
        path = fixPath(path)
        const stat =  await this.call('fs', 'stat', path)
        stat.isDirectory = () => stat.isDirectoryValue
        stat.isFile = () => !stat.isDirectoryValue
        //console.log('stat', path, stat)
        return stat
      }



    }
  }



  async onActivation() {
    console.log('fsPluginClient onload', this.fs);
    (window as any).remixFileSystem = this.fs
  }

}