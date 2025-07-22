import {ElectronBasePlugin, ElectronBasePluginClient} from '@remixproject/plugin-electron'
import fs from 'fs/promises'
import {Profile} from '@remixproject/plugin-utils'
import chokidar from 'chokidar'
import {dialog, shell} from 'electron'
import {createWindow, isE2E, isPackaged} from '../main'
import {writeConfig} from '../utils/config'
import path from 'path'
import {customAction} from '@remixproject/plugin-api'
import { PluginEventDataBatcher } from '../utils/pluginEventDataBatcher'

type recentFolder = {
  timestamp: number,
  path: string
}

const profile: Profile = {
  displayName: 'fs',
  name: 'fs',
  description: 'fs',
}

const convertPathToPosix = (pathName: string): string => {
  return pathName.split(path.sep).join(path.posix.sep)
}

const convertPathToLocalFileSystem = (pathName: string): string => {
  return pathName.split(path.posix.sep).join(path.sep)
}

const getBaseName = (pathName: string): string => {
  return path.basename(pathName)
}

function onlyUnique(value: recentFolder, index: number, self: recentFolder[]) {
  return self.findIndex((rc, index) => rc.path === value.path) === index
}

const deplucateFolderList = (list: recentFolder[]): recentFolder[] => {
  return list.filter(onlyUnique)
}

export class FSPlugin extends ElectronBasePlugin {
  clients: FSPluginClient[] = []
  constructor() {
    super(profile, clientProfile, isE2E? FSPluginClientE2E: FSPluginClient)
    this.methods = [...super.methods, 'closeWatch', 'removeCloseListener']
  }

  async onActivation(): Promise<void> {
    const config = await this.call('electronconfig', 'readConfig')
    const openedFolders = (config && config.openedFolders) || []
    const recentFolders: recentFolder[] = (config && config.recentFolders) || []
    this.call('electronconfig', 'writeConfig', {...config, 
      recentFolders: deplucateFolderList(recentFolders),
      openedFolders: openedFolders})
    const foldersToDelete: string[] = []
    if (recentFolders && recentFolders.length) {
      for (const folder of recentFolders) {
        try {
          const stat = await fs.stat(folder.path);
          if (stat.isDirectory()) {
            // do nothing
          }
        } catch (e) {
          console.log('error opening folder', folder, e)
          foldersToDelete.push(folder.path)
        }
      }
      if (foldersToDelete.length) {
        const newFolders = recentFolders.filter((f: recentFolder) => !foldersToDelete.includes(f.path))
        this.call('electronconfig', 'writeConfig', {recentFolders: deplucateFolderList(newFolders)})
      }
    }
    createWindow()
  }

  async removeCloseListener(): Promise<void> {
    for (const client of this.clients) {
      client.window.removeAllListeners()
    }
  }

  async closeWatch(): Promise<void> {
    for (const client of this.clients) {
      await client.closeWatch()
    }
  }

  openFolder(webContentsId: any, path?: string): void {
    const client = this.clients.find((c) => c.webContentsId === webContentsId)
    if (client) {
      client.openFolder(path)
    }
  }

  openFolderInSameWindow(webContentsId: any, path?: string): void {
    const client = this.clients.find((c) => c.webContentsId === webContentsId)
    if (client) {
      client.openFolderInSameWindow(path)
    }
  }
}

const clientProfile: Profile = {
  name: 'fs',
  displayName: 'fs',
  description: 'fs',
  methods: ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'lstat', 'exists', 'currentPath', 'getWorkingDir', 'watch', 'closeWatch', 'setWorkingDir', 'openFolder', 'openFolderInSameWindow', 'getRecentFolders', 'removeRecentFolder', 'openWindow', 'selectFolder', 'revealInExplorer', 'openInVSCode', 'openInVSCode', 'currentPath'],
}

class FSPluginClient extends ElectronBasePluginClient {
  watchers: Record<string, chokidar.FSWatcher> = {}
  workingDir: string = ''
  trackDownStreamUpdate: Record<string, string> = {}
  expandedPaths: string[] = ['.']
  dataBatcher: PluginEventDataBatcher
  private writeQueue: Map<string, {content: string, options: any, timestamp: number}> = new Map()
  private writeTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      if (!isPackaged) {
        this.window.webContents.openDevTools()
      }
      this.window.on('close', async () => {
        await this.removeFromOpenedFolders(this.workingDir)
        await this.closeWatch()
      })
    })
    this.dataBatcher = new PluginEventDataBatcher(webContentsId)
    this.dataBatcher.on('flush', (data: any) => {
      //console.log('flush', data)
      this.emit('eventGroup', data)
    })
  }

  // best for non recursive
  async readdir(path: string): Promise<string[]> {
    if (this.workingDir === '') return new Promise((resolve, reject) => reject({
      message: 'no working dir has been set'
    }))
    // call node fs.readdir
    if (!path) return []
    const startTime = Date.now()
    const files = await fs.readdir(this.fixPath(path), {
      withFileTypes: true,
    })

    const result: any[] = []
    for (const file of files) {
      const isDirectory = file.isDirectory()
      result.push({
        file: file.name,
        isDirectory,
      })
    }
    return result
  }

  async readFile(path: string, options: any): Promise<string | undefined> {
    // hacky fix for TS error
    if (!path) return undefined
    try {
      return (fs as any).readFile(this.fixPath(path), options)
    } catch (e) {
      return undefined
    }
  }

  async writeFile(path: string, content: string, options: any): Promise<void> {
    // Cancel any pending write for this file
    const existingTimeout = this.writeTimeouts.get(path)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    // Queue the write with a small delay to handle rapid successive writes
    this.writeQueue.set(path, {content, options, timestamp: Date.now()})
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const queuedWrite = this.writeQueue.get(path)
          if (!queuedWrite) {
            resolve()
            return
          }
          
          // Check if this is still the latest write request
          if (queuedWrite.timestamp !== this.writeQueue.get(path)?.timestamp) {
            resolve()
            return
          }
          
          const fullPath = this.fixPath(path)
          
          // First, check if file exists and read current content
          let currentContent: string | null = null
          try {
            currentContent = await fs.readFile(fullPath, 'utf-8')
          } catch (e) {
            // File doesn't exist, that's ok
          }
          
          // Use atomic write with temporary file
          const tempPath = fullPath + '.tmp'
          await (fs as any).writeFile(tempPath, queuedWrite.content, queuedWrite.options)
          
          // Atomic rename (this is atomic on most filesystems)
          await fs.rename(tempPath, fullPath)
          
          // Only update tracking after successful write
          this.trackDownStreamUpdate[path] = queuedWrite.content
          
          // Clean up queue and timeout
          this.writeQueue.delete(path)
          this.writeTimeouts.delete(path)
          
          resolve()
        } catch (error) {
          // Clean up temp file if it exists
          try {
            await fs.unlink(this.fixPath(path) + '.tmp')
          } catch (e) {
            // Ignore cleanup errors
          }
          
          // Clean up queue and timeout
          this.writeQueue.delete(path)
          this.writeTimeouts.delete(path)
          
          reject(error)
        }
      }, 50) // 50ms debounce delay
      
      this.writeTimeouts.set(path, timeout)
    })
  }

  async mkdir(path: string): Promise<void> {
    return fs.mkdir(this.fixPath(path))
  }

  async rmdir(path: string): Promise<void> {
    await fs.rm(this.fixPath(path), {
      recursive: true,
    })
    this.emit('change', 'unlinkDir', path)
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
      const isDirectory = stat.isDirectory()
      return {
        ...stat,
        isDirectoryValue: isDirectory,
      }
    } catch (e) {
      return undefined
    }
  }

  async lstat(path: string): Promise<any> {
    try {
      const stat = await fs.lstat(this.fixPath(path))
      const isDirectory = stat.isDirectory()
      return {
        ...stat,
        isDirectoryValue: isDirectory,
      }
    } catch (e) {
      return undefined
    }
  }

  async exists(path: string): Promise<boolean> {
    if (this.workingDir === '') return false
    return fs
      .access(this.fixPath(path))
      .then(() => true)
      .catch(() => false)
  }

  async currentPath(): Promise<string> {
    return process.cwd()
  }

  async getWorkingDir(): Promise<string> {
    return convertPathToPosix(this.workingDir)
  }

  async watch(): Promise<void> {
    try {
      if(this.events && this.events.eventNames().includes('[filePanel] expandPathChanged')) {
        this.off('filePanel' as any, 'expandPathChanged')
      }
      this.on('filePanel' as any, 'expandPathChanged', async (paths: string[]) => {
        this.expandedPaths = ['.', ...paths] // add root
        //console.log(Object.keys(this.watchers))
        paths = paths.map((path) => this.fixPath(path))
        for (const path of paths) {
          if (!Object.keys(this.watchers).includes(path)) {
            this.watchers[path] = await this.watcherInit(path)
            //console.log('added watcher', path)
          }
        }
       
        for (const watcher in this.watchers) {
          if (watcher === this.workingDir) continue
          if (!paths.includes(watcher)) {
            await this.watchers[watcher].close()
            delete this.watchers[watcher]
            //console.log('removed watcher', watcher)
          }
        }
      })
      this.watchers[this.workingDir] = await this.watcherInit(this.workingDir) // root
      //console.log('added root watcher', this.workingDir)
    } catch (e) {
      console.log('error watching', e)
    }
  }

  private async watcherInit(path: string) {
    const watcher = chokidar
      .watch(path, {
        ignorePermissionErrors: true,
        ignoreInitial: true,
        ignored: [
          '**/.git/index.lock', // this file is created and unlinked all the time when git is running on Windows
        ],
        depth: 0,
      })
      .on('all', async (eventName, path, stats) => {
        this.watcherExec(eventName, convertPathToPosix(path))
      })
      .on('error', (error) => {
        watcher.close()
        if (error.message.includes('ENOSPC')) {
          this.emit('error', 'ENOSPC')
        }
        console.log(`Watcher error: ${error}`)
      })
    return watcher
  }

  private async watcherExec(eventName: string, eventPath: string) {
    let pathWithoutPrefix = eventPath.replace(this.workingDir, '')
    pathWithoutPrefix = convertPathToPosix(pathWithoutPrefix)
    if (pathWithoutPrefix.startsWith('/')) pathWithoutPrefix = pathWithoutPrefix.slice(1)

    if (eventName === 'change') {
      try {
        // Read the current file content
        const newContent = await fs.readFile(eventPath, 'utf-8')
        
        // Get the last known content we wrote
        const trackedContent = this.trackDownStreamUpdate[pathWithoutPrefix]
        
        // Only emit change if:
        // 1. We don't have tracked content (external change), OR
        // 2. The new content differs from what we last wrote
        if (!trackedContent || trackedContent !== newContent) {
          // If we had tracked content but it's different, it means external change
          // Update our tracking to the new content to avoid false positives
          if (trackedContent && trackedContent !== newContent) {
            this.trackDownStreamUpdate[pathWithoutPrefix] = newContent
          }
          
          const dirname = path.dirname(pathWithoutPrefix)
          if (this.expandedPaths.includes(dirname) || this.expandedPaths.includes(pathWithoutPrefix)) {
            this.dataBatcher.write('change', eventName, pathWithoutPrefix)
          }
        }
      } catch (e) {
        console.log('error reading file during change event', e)
        // Still emit the change event even if we can't read the file
        try {
          const dirname = path.dirname(pathWithoutPrefix)
          if (this.expandedPaths.includes(dirname) || this.expandedPaths.includes(pathWithoutPrefix)) {
            this.dataBatcher.write('change', eventName, pathWithoutPrefix)
          }
        } catch (e2) {
          console.log('error emitting change', e2)
        }
      }
    } else {
      try {
        const dirname = path.dirname(pathWithoutPrefix)
        if (this.expandedPaths.includes(dirname) || this.expandedPaths.includes(pathWithoutPrefix)) {
          //console.log('emitting', eventName, pathWithoutPrefix, this.expandedPaths)
          //this.emit('change', eventName, pathWithoutPrefix)
          this.dataBatcher.write('change', eventName, pathWithoutPrefix)
        }
      } catch (e) {
        console.log('error emitting change', e)
      }
    }
  }

  async closeWatch(): Promise<void> {
    // Cancel all pending writes
    for (const timeout of this.writeTimeouts.values()) {
      clearTimeout(timeout)
    }
    this.writeTimeouts.clear()
    this.writeQueue.clear()
    
    for (const watcher in this.watchers) {
      this.watchers[watcher].close()
    }
    // Clear tracking data when closing watchers
    this.trackDownStreamUpdate = {}
  }

  private async cleanupTempFiles(): Promise<void> {
    if (!this.workingDir) return
    
    try {
      const files = await fs.readdir(this.workingDir)
      const tempFiles = files.filter(file => file.endsWith('.tmp'))
      
      for (const tempFile of tempFiles) {
        try {
          await fs.unlink(path.join(this.workingDir, tempFile))
          console.log(`Cleaned up temp file: ${tempFile}`)
        } catch (e) {
          // Ignore errors when cleaning temp files
        }
      }
    } catch (e) {
      // Ignore errors when listing directory
    }
  }

  async convertRecentFolders(): Promise<void> {
    const config = await this.call('electronconfig' as any, 'readConfig')
    if(config.recentFolders) {

      const remaps = config.recentFolders.map((f: any) => {
        // if type is string
        if(typeof f ==='string') {
          return {
            path: f,
            timestamp: new Date().getTime(),
          }
        }else{
          return f
        }
      })

      config.recentFolders = remaps
      await writeConfig(config)
    }
  }

  async updateRecentFolders(path: string): Promise<void> {
    await this.convertRecentFolders()
    const config = await this.call('electronconfig' as any, 'readConfig')
    config.recentFolders = config.recentFolders || []
    config.recentFolders = config.recentFolders.filter((p: string) => p !== path)
    const timestamp = new Date().getTime()
    config.recentFolders.push({
      path,
      timestamp,
    })
    config.recentFolders = deplucateFolderList(config.recentFolders)
    writeConfig(config)
  }

  async updateOpenedFolders(path: string): Promise<void> {
    const config = await this.call('electronconfig' as any, 'readConfig')
    config.openedFolders = config.openedFolders || []
    config.openedFolders = config.openedFolders.filter((p: string) => p !== path)
    config.openedFolders.push(path)
    writeConfig(config)
  }

  async removeFromOpenedFolders(path: string): Promise<void> {
    const config = await this.call('electronconfig' as any, 'readConfig')
    config.openedFolders = config.openedFolders || []
    config.openedFolders = config.openedFolders.filter((p: string) => p !== path)
    writeConfig(config)
  }

  async getRecentFolders(): Promise<string[]> {
    await this.convertRecentFolders()
    const config = await this.call('electronconfig' as any, 'readConfig')
    let folders: string[] = []
    folders = (config.recentFolders || []).map((f: recentFolder) => convertPathToPosix(f.path)).sort((a: recentFolder, b: recentFolder) => a.timestamp - b.timestamp).slice(-15).reverse()
    return folders
  }

  async removeRecentFolder(path: string): Promise<void> {
    await this.convertRecentFolders()
    const config = await this.call('electronconfig' as any, 'readConfig')
    config.recentFolders = config.recentFolders || []
    config.recentFolders = config.recentFolders.filter((p: recentFolder) => p.path !== path)
    writeConfig(config)
  }

  async selectFolder(path?: string, title?: string, button?: string): Promise<string> {
    let dirs: string[] | undefined
    if (!path) {
      dirs = dialog.showOpenDialogSync(this.window, {
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        title: title || 'Select or create a folder',
        buttonLabel: button || 'Select folder',
      })
    }
    path = dirs && dirs.length && dirs[0] ? dirs[0] : path
    if (!path) return ''
    return path
  }

  async openFolder(path?: string): Promise<void> {
    let dirs: string[] | undefined
    if (!path) {
      dirs = dialog.showOpenDialogSync(this.window, {
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        title: 'Open folder',
      })
    }
    path = dirs && dirs.length && dirs[0] ? dirs[0] : path
    if (!path) return

    await this.updateRecentFolders(path)
    await this.updateOpenedFolders(path)
    this.openWindow(path)
  }

  async openFolderInSameWindow(path?: string): Promise<void> {
    let dirs: string[] | undefined
    if (!path) {
      dirs = dialog.showOpenDialogSync(this.window, {
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        title: 'Open folder',
      })
    }
    path = dirs && dirs.length && dirs[0] ? dirs[0] : path
    if (!path) return
    this.workingDir = convertPathToPosix(path)
    await this.updateRecentFolders(path)
    await this.updateOpenedFolders(path)
    this.window.setTitle(this.workingDir)
    this.watch()
    this.emit('workingDirChanged', path)
  }

  async setWorkingDir(path: string): Promise<void> {
    console.log('setWorkingDir', path)
    
    // Clean up any temp files from previous working directory
    await this.cleanupTempFiles()
    
    this.workingDir = convertPathToPosix(path)
    await this.updateRecentFolders(path)
    await this.updateOpenedFolders(path)
    this.window.setTitle(getBaseName(this.workingDir))
    this.watch()
    this.emit('workingDirChanged', path)
    return
  }

  async revealInExplorer(action: customAction, isAbsolutePath: boolean = false): Promise<void> {
    let path = isAbsolutePath? action.path[0] : this.fixPath(action.path[0])
    shell.showItemInFolder(convertPathToLocalFileSystem(path))
  }

  async openInVSCode(action: customAction): Promise<void> {
    shell.openExternal(`vscode://file/${this.fixPath(action.path[0])}`)
  }

  fixPath(path: string): string {
    if (this.workingDir === '') {
      throw new Error('workingDir is not set')
    }
    if (path) {
      if (path.startsWith('/')) {
        path = path.slice(1)
      }


    }
    path = this.workingDir + (!this.workingDir.endsWith('/') ? '/' : '') + path
    return path
  }

  openWindow(path: string): void {
    createWindow(path)
  }
}

import os from 'os'
export class FSPluginClientE2E extends FSPluginClient {
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }

  async selectFolder(dir?: string, title?: string, button?: string): Promise<string> {
    if (!dir) {
      // create random directory on os homedir
      const randomdir = path.join(os.homedir(), 'remix-tests' + Date.now().toString())
      await fs.mkdir(randomdir)
      return randomdir
    }
    if (!dir) return ''
    return dir
  }

  async openFolder(dir?: string): Promise<void> {
    dir = await this.selectFolder(dir)

    await this.updateRecentFolders(dir)
    await this.updateOpenedFolders(dir)
    if (!dir) return
    
    this.openWindow(dir)
  }

  async openFolderInSameWindow(dir?: string): Promise<void> {
    dir = await this.selectFolder(dir)
    if (!dir) return
    this.workingDir = convertPathToPosix(dir)
    await this.updateRecentFolders(dir)
    await this.updateOpenedFolders(dir)
    this.window.setTitle(this.workingDir)
    this.watch()
    this.emit('workingDirChanged', dir)
  }

}
