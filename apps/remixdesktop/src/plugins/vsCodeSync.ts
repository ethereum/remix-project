import { ElectronBasePlugin, ElectronBasePluginClient } from '@remixproject/plugin-electron'

import { Profile } from '@remixproject/plugin-utils'
import EventEmitter from 'events'
import { OpenWorkspaceMessage, logToVsCode, startVsCodeServer, VSCodeEvents, WorkspaceAndOpenedFilesMessage } from '../lib/VsCodeServer'
import { createWindow } from '../main'
import { convertPathToPosix, getRelativePath, isFocusedFileOpen } from '../utils/fs'

const profile: Profile = {
  displayName: 'VSCodeSync',
  name: 'VSCodeSync',
  description: 'VSCodeSync',
}

const eventEmitter = new EventEmitter()

export class VsCodeSyncPlugin extends ElectronBasePlugin {
  clients: VsCodeSyncClient[] = []
  constructor() {
    super(profile, clientProfile, VsCodeSyncClient)
    this.methods = [...super.methods]
    startVsCodeServer(eventEmitter)
    eventEmitter.on(VSCodeEvents.CONNECTED, () => {
      console.log('VSCode connected')
    })

    eventEmitter.on(VSCodeEvents.OPEN_WORKSPACE, (message: OpenWorkspaceMessage) => {
      console.log('Workspace opened:', message.payload)
      this.openWindow(message.payload.workspaceFolders[0])
    })

    eventEmitter.on(VSCodeEvents.WORKSPACE_AND_OPENED_FILES, async (message: WorkspaceAndOpenedFilesMessage) => {
      console.log('Workspace and files:', message.payload)
      await this.syncOpenedFiles(message.payload.openedFiles, message.payload.workspaceFolders, message.payload.focusedFile)
    })
  }

  async syncOpenedFiles(openedFiles: string[], workspaceFolders: string[], focusedFile: string | null) {
    for (const client of this.clients) {
      await client.syncOpenedFiles(openedFiles, workspaceFolders, focusedFile)
    }
  }

  openWindow(path: string): void {
    createWindow(path)
  }

  async onActivation() {
    console.log('VSCodeSync Activated')
  }
}

const clientProfile: Profile = {
  name: 'VSCodeSync',
  displayName: 'VSCodeSync',
  description: 'VSCodeSync',
  methods: [],
}

class VsCodeSyncClient extends ElectronBasePluginClient {
  workingDir: string = ''
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(async () => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })
      this.workingDir = await this.call('fs' as any, 'getWorkingDir')
      console.log('workingDir in VSCODE client', this.workingDir)
      this.on('codeParser' as any, 'errors', (data) => {
        console.log('VSCODE client Compilation finished data:', data)
        for (const error of data) {
          console.log('VSCODE client Compilation error:', error)
          logToVsCode({ type: 'error', message: error.message })
        }
        /*
        if (data.errors || data.error) {
          console.log('VSCODE client Compilation error:', data.errors || data.error)
          if (data.error) {
            if (data.error.formattedMessage) {
              console.log('VSCODE client Compilation error message:', data.error.formattedMessage)
              logToVsCode({ type: 'error', message: data.error.formattedMessage })
            }
          }else{
            for (const error of data.errors) {
              if (error.formattedMessage) {
                console.log('VSCODE client Compilation error message:', error.formattedMessage)
                logToVsCode({ type: 'error', message: error.formattedMessage })
              }
            }
          }
        }else{
          console.log('VSCODE client Compilation success')
        }
      })
      */
      })
    })
  }

  async syncOpenedFiles(openedFiles: string[], workspaceFolders: string[], focusedFile: string | null) {
    console.log(
      'VSCODE client Opened files:',
      openedFiles.map((path) => convertPathToPosix(path))
    )
    console.log(
      'VSCODE client Workspace folders:',
      workspaceFolders.map((path) => convertPathToPosix(path))
    )
    console.log('VSCODE client Focused file:', convertPathToPosix(focusedFile))
    console.log('VSCODE client Working dir:', this.workingDir)
    if (workspaceFolders.map((path) => convertPathToPosix(path)).find((path) => path === this.workingDir)) {
      console.log('VSCODE client Working dir is in workspace folders')
      const ALLOWED_EXTENSIONS = ['.sol', '.txt', '.js', '.ts', '.vy', '.json', '.yml']
      const relativeOpenedFile = convertPathToPosix(getRelativePath(focusedFile, this.workingDir, ALLOWED_EXTENSIONS))
      console.log('VSCODE client Focused file without workspace folder:', relativeOpenedFile)
      if (relativeOpenedFile) {
        const openedFiles = await this.call('fileManager' as any, 'getOpenedFiles')
        console.log('VSCODE client Opened files relative:', openedFiles)
        let currentFile = null
        try {
          currentFile = await this.call('fileManager', 'getCurrentFile')
        } catch (e) {}
        console.log('VSCODE client Current file:', currentFile, ' Focused file:', relativeOpenedFile)
        // Check if the focused file is open
        const isOpen = isFocusedFileOpen(relativeOpenedFile, openedFiles)
        const currentFileIsFocused = currentFile === relativeOpenedFile

        if (currentFileIsFocused) {
          console.log(`The focused file "${relativeOpenedFile}" is already open.`)
        } else {
          console.log(`The focused file "${relativeOpenedFile}" is not open.`)
          await this.call('fileManager', 'open', relativeOpenedFile)
        }
      }
    }
  }

  async onActivation(): Promise<void> {
    console.log('VSCodeSync Client Activated')
  }
}
