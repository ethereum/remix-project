
import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts', new Date().toLocaleTimeString())

/* preload script needs statically defined API for each plugin */

const exposedPLugins = ['fs', 'git', 'xterm', 'isogit', 'electronconfig', 'electronTemplates', 'ripgrep', 'compilerloader']
//const exposedPLugins = ['fs', 'git', 'xterm', 'isogit', 'electronconfig', 'electronTemplates', 'ripgrep', 'compilerloader', 'remixAI']

let webContentsId: number | undefined

ipcRenderer.invoke('getWebContentsID').then((id: number) => {
  webContentsId = id
})

contextBridge.exposeInMainWorld('electronAPI', {
  activatePlugin: (name: string) => {
    return ipcRenderer.invoke('manager:activatePlugin', name)
  },

  getWindowId: () => ipcRenderer.invoke('getWindowID'),

  plugins: exposedPLugins.map(name => {
    return {
      name,
      on: (cb:any) => ipcRenderer.on(`${name}:send`, cb),
      send: (message: Partial<Message>) => {
        ipcRenderer.send(`${name}:on:${webContentsId}`, message)
      }
    }
  })
})