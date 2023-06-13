import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import fs from 'fs/promises'
import { Profile } from "@remixproject/plugin-utils";
import chokidar from 'chokidar'
import { dialog } from "electron";

const profile: Profile = {
  displayName: 'fs',
  name: 'fs',
  description: 'fs'
}

export class FSPlugin extends ElectronBasePlugin {
  clients: FSPluginClient[] = []
  constructor() {
    super(profile, clientProfile, FSPluginClient)
    this.methods = [...super.methods, 'closeWatch']
  }

  async closeWatch(): Promise<void> {
    for (const client of this.clients) {
      await client.closeWatch()
    }
  }

  openFolder(webContentsId: any): void {
    const client = this.clients.find(c => c.webContentsId === webContentsId)
    if (client) {
      client.openFolder()
    }
  }

}

const clientProfile: Profile = {
  name: 'fs',
  displayName: 'fs',
  description: 'fs',
  methods: ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'lstat', 'exists', 'currentPath', 'watch', 'closeWatch', 'setWorkingDir', 'openFolder']
}

class FSPluginClient extends ElectronBasePluginClient {
  watcher: chokidar.FSWatcher
  workingDir: string = '/Volumes/bunsen/code/empty/'

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      //console.log('fsPluginClient onload')
    })
  }


  async readdir(path: string): Promise<string[]> {
    // call node fs.readdir
    //console.log('readdir', path)
    if (!path) return []
    const files = fs.readdir(this.fixPath(path))
    return files
  }

  async readFile(path: string, options: any): Promise<string | undefined> {
    //console.log('readFile', path, options)
    // hacky fix for TS error
    if (!path) return undefined
    try {
      return (fs as any).readFile(this.fixPath(path), options)
    } catch (e) {
      //console.log('readFile error', e)
      return undefined
    }
  }

  async writeFile(path: string, content: string, options: any): Promise<void> {
    //console.log('writeFile', path, content, options)
    return (fs as any).writeFile(this.fixPath(path), content, options)
  }

  async mkdir(path: string): Promise<void> {
    return fs.mkdir(this.fixPath(path))
  }

  async rmdir(path: string): Promise<void> {
    return fs.rmdir(this.fixPath(path))
  }

  async unlink(path: string): Promise<void> {
    return fs.unlink(this.fixPath(path))
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return fs.rename(this.fixPath(oldPath), this.fixPath(newPath))
  }

  async stat(path: string): Promise<any> {
    try {
      const stat = await fs.stat(this.fixPath(path))
      ////console.log('stat', path, stat)
      const isDirectory = stat.isDirectory()
      return {
        ...stat,
        isDirectoryValue: isDirectory
      }
    } catch (e) {
      //console.log('stat error', e)
      return undefined
    }
  }

  async lstat(path: string): Promise<any> {
    try {
      const stat = await fs.lstat(this.fixPath(path))
      const isDirectory = stat.isDirectory()
      return {
        ...stat,
        isDirectoryValue: isDirectory
      }
    } catch (e) {
      //console.log('lstat error', e)
      return undefined
    }
  }



  async exists(path: string): Promise<boolean> {
    return fs.access(this.fixPath(path)).then(() => true).catch(() => false)
  }

  async currentPath(): Promise<string> {
    return process.cwd()
  }

  async watch(path: string): Promise<void> {
    if (this.watcher) this.watcher.close()
    this.watcher =
      chokidar.watch(this.fixPath(path)).on('change', (path, stats) => {
        //console.log('change', path, stats)
        this.emit('change', path, stats)
      })
  }

  async closeWatch(): Promise<void> {
    //console.log('closing Watcher', this.webContentsId)
    if (this.watcher) this.watcher.close()
  }

  async openFolder(): Promise<void> {
    const dirs = dialog.showOpenDialogSync(this.window, {
      properties: ['openDirectory', 'createDirectory', "showHiddenFiles"]
    })
    if (dirs && dirs.length > 0) {
      this.workingDir = dirs[0]
      this.emit('workingDirChanged', dirs[0])
    }

  }

  async setWorkingDir(path: string): Promise<void> {
      console.log('setWorkingDir', path)
      this.workingDir = path
      this.emit('workingDirChanged', path)
  }

  fixPath(path: string): string {
    if (path) {
      if (path.startsWith('/')) {
        path = path.slice(1)
      }
    }
    if (!this.workingDir.endsWith('/')) this.workingDir = this.workingDir + '/'
    path = this.workingDir + path
    return path
  }


}