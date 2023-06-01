
import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts')

contextBridge.exposeInMainWorld('api', {
  activatePlugin: (name: string) => {
    return ipcRenderer.invoke('engine:activatePlugin', name)
  },
  receiveFromFS: (cb:any) => ipcRenderer.on('fs:send', cb),
  sendToFS:  (message: Partial<Message>) => ipcRenderer.send('fs:on', message),
  receiveFromGit: (cb:any) => ipcRenderer.on('git:send', cb),
  sendToGit: (message: Partial<Message>) => ipcRenderer.send('git:on', message)
})