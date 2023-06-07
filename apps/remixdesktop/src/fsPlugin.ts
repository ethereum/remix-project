import { PluginClient } from "@remixproject/plugin";
import { createElectronClient } from "@remixproject/plugin-electron"
import { Plugin } from '@remixproject/engine';
import fs from 'fs/promises'
import { Stats } from "fs";
import { Profile } from "@remixproject/plugin-utils";
import chokidar from 'chokidar'
import { mainWindow } from "./main";

const profile: Profile = {
  displayName: 'fs',
  name: 'fs',
  description: 'fs',
}

export class FSPlugin extends Plugin {
  client: FSPluginClient
  constructor() {
    super(profile)
    this.methods = ['closeWatch']
  }

  onActivation(): void {
    this.client = new FSPluginClient()
  }

  async closeWatch(): Promise<void> {
    console.log('closeWatch')
    if (this.client)
      await this.client.closeWatch()
  }

}

class FSPluginClient extends PluginClient {
  watcher: chokidar.FSWatcher | undefined
  constructor() {
    super()
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists', 'watch', 'closeWatch', 'currentPath']
    createElectronClient(this, profile, mainWindow)
    console.log(mainWindow)
    this.onload(() => {
      console.log('fsPluginClient onload')
    })
  }

  async readdir(path: string): Promise<string[]> {

    return fs.readdir(path)
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf8')
  }

  async writeFile(path: string, content: string): Promise<void> {
    return fs.writeFile(path, content, 'utf8')
  }

  async mkdir(path: string): Promise<void> {
    return fs.mkdir(path)
  }

  async rmdir(path: string): Promise<void> {
    return fs.rmdir(path)
  }

  async unlink(path: string): Promise<void> {
    return fs.unlink(path)
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return fs.rename(oldPath, newPath)
  }

  async stat(path: string): Promise<any> {
    const stat =  await fs.stat(path)
    //console.log('stat', path, stat)
    const isDirectory = stat.isDirectory()
    return {
      ...stat,
      isDirectoryValue: isDirectory
    }
  }

  async exists(path: string): Promise<boolean> {
    return fs.access(path).then(() => true).catch(() => false)
  }

  async currentPath(): Promise<string> {
    return process.cwd()
  }

  async watch(path: string): Promise<void> {
    console.log('watch', path)
    if (this.watcher) this.watcher.close()
    this.watcher =
      chokidar.watch(path).on('change', (path, stats) => {
        console.log('change', path, stats)
        this.emit('change', path, stats)
      })
  }

  async closeWatch(): Promise<void> {
    console.log('closeWatch')
    if (this.watcher) this.watcher.close()
  }


}