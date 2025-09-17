import { ElectronBasePlugin, ElectronBasePluginClient } from '@remixproject/plugin-electron'
import fs from 'fs/promises'
import { Profile } from '@remixproject/plugin-utils'
import chokidar from 'chokidar'
import { dialog, shell } from 'electron'
import { createWindow, isE2E, isPackaged } from '../main'
import { writeConfig } from '../utils/config'
import path from 'path'
import { customAction } from '@remixproject/plugin-api'
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
    super(profile, clientProfile, isE2E ? FSPluginClientE2E : FSPluginClient)
    this.methods = [...super.methods, 'closeWatch', 'removeCloseListener']
  }

  async onActivation(): Promise<void> {
    const config = await this.call('electronconfig', 'readConfig')
    const openedFolders = (config && config.openedFolders) || []
    const recentFolders: recentFolder[] = (config && config.recentFolders) || []
    this.call('electronconfig', 'writeConfig', {
      ...config,
      recentFolders: deplucateFolderList(recentFolders),
      openedFolders: openedFolders
    })
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
        this.call('electronconfig', 'writeConfig', { recentFolders: deplucateFolderList(newFolders) })
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
  methods: ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'lstat', 'exists', 'currentPath', 'getWorkingDir', 'watch', 'closeWatch', 'setWorkingDir', 'openFolder', 'openFolderInSameWindow', 'getRecentFolders', 'removeRecentFolder', 'openWindow', 'selectFolder', 'revealInExplorer', 'openInVSCode', 'getWatcherStats', 'refreshDirectory', 'resetWatchers', 'resetNotificationLimits', 'currentPath'],
}

class FSPluginClient extends ElectronBasePluginClient {
  watchers: Record<string, chokidar.FSWatcher> = {}
  workingDir: string = ''
  trackDownStreamUpdate: Record<string, string> = {}
  expandedPaths: string[] = ['.']
  dataBatcher: PluginEventDataBatcher
  private writeQueue: Map<string, { content: string, options: any, timestamp: number }> = new Map()
  private writeTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private watcherLimitReached: boolean = false
  private maxWatchers: number = this.getPlatformWatcherLimit() // Platform-specific limit
  // Guard flags for safe auto-resets
  private isResettingWatchers: boolean = false
  private lastWatcherResetAt: number = 0
  private static WATCHER_RESET_COOLDOWN_MS = 5000
  // Rate-limit cooldown logs
  private lastCooldownLogAt: number = 0
  private lastCooldownReason: string | null = null
  // Rate-limit system suggestion alerts (show detailed suggestions only once per session)
  private systemSuggestionsShown: Set<string> = new Set()

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)

    // Set up global error handlers for watcher issues
    this.setupErrorHandlers()

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

  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections from watchers
    const originalListeners = process.listeners('unhandledRejection')
    process.removeAllListeners('unhandledRejection')

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      if (reason && (reason.code === 'ENOSPC' || reason.message?.includes('ENOSPC'))) {
        //console.error('File watcher error: System limit reached -', reason.message)
        this.watcherLimitReached = true
        // Automatically reduce watchers when system limit is reached
        this.maybeResetWatchers('ENOSPC (unhandledRejection)')

        const suggestions = [
          'Increase system watch limit: sudo sysctl fs.inotify.max_user_watches=524288',
          'Add to /etc/sysctl.conf for permanent fix: fs.inotify.max_user_watches=524288',
          'Consider restarting the application to reset watchers'
        ]
        
        this.emit('watcherLimitReached', {
          path: 'system',
          isRootWatcher: false,
          suggestions
        })

        // Show detailed system suggestions only once per session
        if (!this.systemSuggestionsShown.has('ENOSPC_unhandledRejection')) {
          this.systemSuggestionsShown.add('ENOSPC_unhandledRejection')
          this.call('notification' as any, 'alert', {
            title: 'File Watcher System Limit Reached',
            id: 'watcherLimitEnospcUnhandled',
            message: `The system has run out of file watchers. To fix this permanently on Linux:

• Temporary fix: sudo sysctl fs.inotify.max_user_watches=524288
• Permanent fix: Add "fs.inotify.max_user_watches=524288" to /etc/sysctl.conf

Watchers have been automatically reduced for now.`
          })
        } else {
          // Just a simple toast for subsequent occurrences
          this.call('notification' as any, 'toast', 
            'File watcher limit reached. Watchers automatically reduced.'
          )
        }
        return // Don't let it crash the app
      }

      // Re-emit to original handlers for other types of unhandled rejections
      originalListeners.forEach(listener => {
        if (typeof listener === 'function') {
          listener(reason, promise)
        }
      })
    })
  }

  // Reset watchers with cooldown & reentrancy guard
  private async maybeResetWatchers(reason: string): Promise<void> {
    const now = Date.now()
    if (this.isResettingWatchers) {
      //console.warn(`Watcher reset already in progress, skipping (${reason})`)
      return
    }
    if (now - this.lastWatcherResetAt < FSPluginClient.WATCHER_RESET_COOLDOWN_MS) {
      // Log this warning at most once per cooldown window, or if the reason changes
      const withinCooldownLogWindow = (now - this.lastCooldownLogAt) < FSPluginClient.WATCHER_RESET_COOLDOWN_MS
      if (!withinCooldownLogWindow || this.lastCooldownReason !== reason) {
        const msUntilNext = Math.max(0, FSPluginClient.WATCHER_RESET_COOLDOWN_MS - (now - this.lastWatcherResetAt))
        console.warn(`Watcher reset throttled (cooldown). Next attempt in ~${msUntilNext}ms. Reason: ${reason}`)
        this.lastCooldownLogAt = now
        this.lastCooldownReason = reason
      }
      return
    }
    if (this.maxWatchers <= 5) {
      console.warn(`Watcher reset skipped; already at minimum limit. Reason: ${reason}`)
      return
    }
    try {
      this.isResettingWatchers = true
      this.lastWatcherResetAt = now
      console.log(`Auto-reducing watchers (reason: ${reason}) from ${this.maxWatchers} to ${Math.max(5, Math.floor(this.maxWatchers / 2))}`)
      await this.resetWatchers()
    } catch (e) {
      console.error('Error during watcher auto-reset:', e)
    } finally {
      this.isResettingWatchers = false
    }
  }


  private getPlatformWatcherLimit(): number {
    // 1) Explicit override via env
    const env = process.env.REMIX_MAX_WATCHERS
    if (env && !Number.isNaN(Number(env))) {
      const v = Math.max(5, Math.floor(Number(env)))
      console.info(`[fs] Using env REMIX_MAX_WATCHERS=${v}`)
      return v
    }

    const os = require('os')
    const platform = os.platform()

    // 2) Platform defaults + Linux dynamic probe
    if (platform === 'linux') {
      try {
        // Read inotify limits to derive a safe budget for our app
        const fsSync = require('fs')
        const maxWatchesStr = fsSync.readFileSync('/proc/sys/fs/inotify/max_user_watches', 'utf8').trim()
        const maxWatches = Number(maxWatchesStr) || 8192

        // Keep our budget small relative to system-wide limit (2% capped to 300)
        const derived = Math.floor(Math.min(300, Math.max(50, maxWatches * 0.02)))
        console.info(`[fs] Linux inotify max_user_watches=${maxWatches}, using budget=${derived}`)
        return derived
      } catch {
        // Fallback when /proc is unavailable
        console.info('[fs] Linux inotify limits not readable, using conservative default=75')
        return 75
      }
    }

    if (platform === 'darwin') {
      // FSEvents is efficient; 1000 is safe for our shallow watchers
      return 1000
    }

    if (platform === 'win32') {
      // Windows API is also generous; 800 is a balanced default
      return 800
    }

    // Unknown platform: use moderate default
    return 200
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
    this.writeQueue.set(path, { content, options, timestamp: Date.now() })

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
      if (this.events && this.events.eventNames().includes('[filePanel] expandPathChanged')) {
        this.off('filePanel' as any, 'expandPathChanged')
      }
      this.on('filePanel' as any, 'expandPathChanged', async (paths: string[]) => {
        this.expandedPaths = ['.', ...paths] // add root
        //console.log(Object.keys(this.watchers))
        paths = paths.map((path) => this.fixPath(path))

        // Try to add new watchers with graceful failure handling
        for (const path of paths) {
          if (!Object.keys(this.watchers).includes(path)) {
            const currentWatcherCount = Object.keys(this.watchers).length
            console.log(`📊 WATCHERS: ${currentWatcherCount}/${this.maxWatchers}, adding: ${path}`)

            // Check if we're approaching the watcher limit
            if (currentWatcherCount >= this.maxWatchers) {
              const os = require('os')
              const platform = os.platform()
              console.warn(`🚫 WATCHER LIMIT: ${currentWatcherCount}/${this.maxWatchers} on ${platform}. Skipping: ${path}`)
              this.watcherLimitReached = true

              let suggestions = ['Consider collapsing some folders to reduce active watchers']
              if (platform === 'linux') {
                suggestions.push('Linux has stricter file watcher limits - consider increasing system limits if needed')
              }

              this.emit('watcherLimitReached', {
                path,
                isRootWatcher: false,
                suggestions
              })
              
              // Show preventive limit notification only once per session
              if (!this.systemSuggestionsShown.has('preventive_limit')) {
                this.systemSuggestionsShown.add('preventive_limit')
                this.call('notification' as any, 'toast', 
                  `Watcher limit reached (${currentWatcherCount}/${this.maxWatchers}). Consider collapsing folders to avoid system limits.`
                )
              }
              continue
            }

            try {
              console.log(`➕ ADDING WATCHER: ${path}`)
              this.watchers[path] = await this.watcherInit(path)
              console.log(`✅ WATCHER ADDED: ${path} (${Object.keys(this.watchers).length}/${this.maxWatchers})`)
            } catch (error: any) {
              console.log(`❌ WATCHER FAILED: ${path} - ${error.message}`)
              this.handleWatcherError(error, path)
            }
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

      // Initialize root watcher with error handling
      try {
        this.watchers[this.workingDir] = await this.watcherInit(this.workingDir) // root
        //console.log('added root watcher', this.workingDir)
      } catch (error: any) {
        this.handleWatcherError(error, this.workingDir, true)
      }
    } catch (e) {
      console.log('error watching', e)
    }
  }

  private async watcherInit(path: string): Promise<chokidar.FSWatcher> {
    return new Promise((resolve, reject) => {
      try {
        const watcher = chokidar
          .watch(path, {
            ignorePermissionErrors: true,
            ignoreInitial: true,
            ignored: [
              '**/.git/index.lock', // this file is created and unlinked all the time when git is running on Windows
            ],
            depth: 0,
          })
          .on('ready', () => {
            // Watcher is ready - resolve the promise
            resolve(watcher)
          })
          .on('all', async (eventName, path, stats) => {
            try {
              this.watcherExec(eventName, convertPathToPosix(path))
            } catch (error) {
              console.error('Error in watcherExec:', error)
            }
          })
          .on('error', (error) => {
            console.error('Watcher error:', error)
            try {
              watcher.close()
            } catch (closeError) {
              console.error('Error closing watcher:', closeError)
            }
            delete this.watchers[path]
            this.handleWatcherError(error, path)
            reject(error)
          })

        // Set a timeout to reject if watcher doesn't become ready
        let watcherReady = false
        watcher.on('ready', () => { watcherReady = true })

        setTimeout(() => {
          if (!watcherReady) {
            const timeoutError = new Error(`Watcher initialization timeout for path: ${path}`)
            try {
              watcher.close()
            } catch (e) {
              console.error('Error closing timed-out watcher:', e)
            }
            reject(timeoutError)
          }
        }, 5000) // 5 second timeout

      } catch (error) {
        console.error('Error creating watcher:', error)
        reject(error)
      }
    })
  }

  private handleWatcherError(error: any, path: string, isRootWatcher: boolean = false): void {
    console.error(`Watcher error for ${path}:`, error.message)
    const os = require('os')
    const platform = os.platform()

    if (error.message.includes('ENOSPC') || error.message.includes('watch ENOSPC')) {
      this.watcherLimitReached = true

      // Platform-specific suggestions
      let suggestions: string[] = []
      if (platform === 'linux') {
        suggestions = [
          'Increase system watch limit: sudo sysctl fs.inotify.max_user_watches=524288',
          'Add to /etc/sysctl.conf for permanent fix: fs.inotify.max_user_watches=524288',
          'Alternatively, try collapsing some folders in the file explorer to reduce watchers'
        ]
      } else {
        suggestions = [
          'Try collapsing some folders in the file explorer to reduce watchers',
          'Consider restarting the application if the issue persists'
        ]
      }

      console.error(`File system watcher limit reached on ${platform}`)
      this.emit('watcherLimitReached', { path, isRootWatcher, suggestions })
      
      // Show detailed suggestions only once per session for chokidar ENOSPC
      if (!this.systemSuggestionsShown.has('ENOSPC_chokidar') && platform === 'linux') {
        this.systemSuggestionsShown.add('ENOSPC_chokidar')
        this.call('notification' as any, 'alert', {
          title: 'File Watcher System Limit Reached',
          id: 'watcherLimitEnospcChokidar',
          message: `Linux inotify limit reached while watching files.

To increase the limit:
• Temporary: sudo sysctl fs.inotify.max_user_watches=524288
• Permanent: Add "fs.inotify.max_user_watches=524288" to /etc/sysctl.conf

Alternatively, try collapsing folders to reduce active watchers.`
        })
      } else {
        // Simple toast for subsequent occurrences or non-Linux platforms
        const shortMsg = platform === 'linux' 
          ? 'File watcher limit reached (see console for solution)'
          : 'File watcher limit reached. Try collapsing folders.'
        this.call('notification' as any, 'toast', shortMsg)
      }
      
      // Proactively reduce watchers on chokidar ENOSPC events as well
      this.maybeResetWatchers('ENOSPC (chokidar error)')

    } else if (error.message.includes('EMFILE') || error.message.includes('too many open files')) {
      this.watcherLimitReached = true

      let suggestions: string[] = []
      if (platform === 'linux' || platform === 'darwin') {
        suggestions = [
          'Increase file descriptor limit: ulimit -n 8192',
          platform === 'linux' ? 'Add to ~/.bashrc for permanent fix: ulimit -n 8192' : 'Add to ~/.bash_profile for permanent fix: ulimit -n 8192'
        ]
      } else {
        suggestions = ['Try restarting the application to free up file handles']
      }

      console.error(`Too many open files on ${platform}`)
      this.emit('watcherLimitReached', { path, isRootWatcher, suggestions })
      
      // Show detailed EMFILE suggestions only once per session
      if (!this.systemSuggestionsShown.has('EMFILE') && (platform === 'linux' || platform === 'darwin')) {
        this.systemSuggestionsShown.add('EMFILE')
        this.call('notification' as any, 'alert', {
          title: 'Too Many Open Files',
          id: 'watcherLimitEmfile',
          message: `The system file descriptor limit has been reached.

To increase the limit:
• Temporary: ulimit -n 8192
• Permanent (${platform === 'linux' ? 'Linux' : 'macOS'}): Add "ulimit -n 8192" to ~/.${platform === 'linux' ? 'bashrc' : 'bash_profile'}

Watchers have been automatically reduced.`
        })
      } else {
        // Simple toast for subsequent occurrences
        const shortMsg = platform === 'linux' || platform === 'darwin'
          ? 'Too many open files (see console for solution)'
          : 'Too many open files. Consider restarting.'
        this.call('notification' as any, 'toast', shortMsg)
      }
      
      // EMFILE can also be mitigated by reducing watchers
      this.maybeResetWatchers('EMFILE (chokidar error)')

    } else if (error.message.includes('EPERM') || error.message.includes('permission denied')) {
      console.error(`Permission denied for watching ${path}`)
      this.emit('watcherPermissionError', { path, isRootWatcher })
      
      // Notify user about permission issues
      this.call('notification' as any, 'toast', 
        `Permission denied watching ${path}. Check folder permissions.`
      )
    } else {
      // Generic watcher error
      this.emit('watcherError', { error: error.message, path, isRootWatcher })
    }

    // If this is the root watcher and it fails, we have bigger problems
    if (isRootWatcher) {
      console.error('Critical: Root watcher failed. File watching will be severely limited.')
    }
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
      try {
        this.watchers[watcher].close()
      } catch (error) {
        console.log('Error closing watcher:', error)
      }
    }
    this.watchers = {}
    // Clear tracking data when closing watchers
    this.trackDownStreamUpdate = {}
  }

  async getWatcherStats(): Promise<{ activeWatchers: number, watchedPaths: string[], systemInfo: any, limitReached: boolean, maxWatchers: number }> {
    const activeWatchers = Object.keys(this.watchers).length
    const watchedPaths = Object.keys(this.watchers)

    // Get platform-specific system info
    let systemInfo: any = {}
    try {
      const os = require('os')
      const platform = os.platform()

      if (platform === 'linux') {
        const fs = require('fs')
        try {
          const maxWatches = await fs.promises.readFile('/proc/sys/fs/inotify/max_user_watches', 'utf8')
          const maxInstances = await fs.promises.readFile('/proc/sys/fs/inotify/max_user_instances', 'utf8')
          systemInfo = {
            maxUserWatches: parseInt(maxWatches.trim()),
            maxUserInstances: parseInt(maxInstances.trim()),
            platform: 'linux',
            watcherAPI: 'inotify',
            notes: 'Linux has strict watcher limits that can be adjusted'
          }
        } catch (e) {
          systemInfo = {
            platform: 'linux',
            watcherAPI: 'inotify',
            error: 'Could not read inotify limits',
            notes: 'Linux has strict watcher limits - check /proc/sys/fs/inotify/ for current limits'
          }
        }
      } else if (platform === 'darwin') {
        systemInfo = {
          platform: 'darwin',
          watcherAPI: 'FSEvents',
          notes: 'macOS FSEvents API is efficient with generous limits'
        }
      } else if (platform === 'win32') {
        systemInfo = {
          platform: 'win32',
          watcherAPI: 'ReadDirectoryChangesW',
          notes: 'Windows API has reasonable limits for most use cases'
        }
      } else {
        systemInfo = {
          platform: platform,
          watcherAPI: 'unknown',
          notes: 'Unknown platform - using conservative limits'
        }
      }
    } catch (e) {
      systemInfo = { error: 'Could not determine system info' }
    }

    return {
      activeWatchers,
      watchedPaths,
      systemInfo,
      limitReached: this.watcherLimitReached,
      maxWatchers: this.maxWatchers
    }
  }

  async refreshDirectory(path?: string): Promise<void> {
    // Manual directory refresh when watchers are unavailable
    if (!path) path = '.'
    const fullPath = this.fixPath(path)

    try {
      // Emit a synthetic 'addDir' event to trigger UI refresh
      this.emit('change', 'refreshDir', path)
    } catch (error) {
      console.log('Error refreshing directory:', error)
    }
  }

  async resetWatchers(): Promise<void> {
    const oldLimit = this.maxWatchers
    const oldWatcherCount = Object.keys(this.watchers).length

    console.log(`🔄 WATCHER RESET: Was ${oldWatcherCount}/${oldLimit} watchers`)
    console.log('Resetting all watchers due to system limits...')

    // Close all existing watchers
    await this.closeWatch()

    // Reset the limit flag
    this.watcherLimitReached = false

    // Reduce the max watchers even further
    this.maxWatchers = Math.max(5, Math.floor(this.maxWatchers / 2))

    console.log(`✅ WATCHER REDUCTION: ${oldLimit} → ${this.maxWatchers} (reduced by ${oldLimit - this.maxWatchers})`)

    // Restart watching with reduced limits
    try {
      await this.watch()
      const newWatcherCount = Object.keys(this.watchers).length
      console.log(`🆕 NEW WATCHER STATE: ${newWatcherCount}/${this.maxWatchers} active`)
    } catch (error) {
      console.error('Error restarting watchers after reset:', error)
    }
  }

  async resetNotificationLimits(): Promise<void> {
    this.systemSuggestionsShown.clear()
    console.log('🔔 Notification limits reset - detailed suggestions will be shown again')
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
    if (config.recentFolders) {

      const remaps = config.recentFolders.map((f: any) => {
        // if type is string
        if (typeof f === 'string') {
          return {
            path: f,
            timestamp: new Date().getTime(),
          }
        } else {
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
    let path: string

    // Handle missing or empty path array
    if (!action.path || action.path.length === 0 || !action.path[0] || action.path[0] === '') {
      path = this.workingDir || process.cwd()
    } else if (isAbsolutePath) {
      path = action.path[0]
    } else {
      path = this.fixPath(action.path[0])
    }

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
