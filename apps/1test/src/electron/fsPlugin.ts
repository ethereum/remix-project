import fs from 'fs/promises'
import { Stats } from "fs";
import { Profile } from "@remixproject/plugin-utils";
import chokidar from 'chokidar'
import { ElectronBasePlugin, ElectronBasePluginClient, ElectronBasePluginInterface } from "./lib/electronBasePlugin";
import { dialog } from 'electron';

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

}

const clientProfile: Profile = {
  name: 'fs',
  displayName: 'fs',
  description: 'fs',
  methods: ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists', 'currentPath', 'watch', 'closeWatch', 'setWorkingDir']
}

class FSPluginClient extends ElectronBasePluginClient {
  watcher: chokidar.FSWatcher
  workingDir: string = '/Volumes/bunsen/code/rmproject2/remix-project/apps/remix-ide/contracts/'

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      console.log('fsPluginClient onload')
    })
  }

  async readdir(path: string): Promise<string[]> {
    // call node fs.readdir
    return fs.readdir(this.fixPath(path))
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(this.fixPath(path), 'utf8')
  }

  async writeFile(path: string, content: string): Promise<void> {
    return fs.writeFile(this.fixPath(path), content, 'utf8')
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
    const stat = await fs.stat(path)
    //console.log('stat', path, stat)
    const isDirectory = stat.isDirectory()
    return {
      ...stat,
      isDirectoryValue: isDirectory
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
        console.log('change', path, stats)
        this.emit('change', path, stats)
      })
  }

  async closeWatch(): Promise<void> {
    console.log('closing Watcher', this.webContentsId)
    if (this.watcher) this.watcher.close()
  }

  async setWorkingDir(): Promise<void> {
    const dirs = dialog.showOpenDialogSync(this.window, {
      properties: ['openDirectory']
    })
    if (dirs && dirs.length > 0)
      this.workingDir = dirs[0]

    this.emit('workingDirChanged', dirs[0])
  }

  fixPath(path: string): string {

    if (path.startsWith('/')) {
      path = path.slice(1)
    }
    path = this.workingDir + path
    return path
  }


}