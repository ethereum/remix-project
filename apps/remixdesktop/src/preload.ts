
import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts')

contextBridge.exposeInMainWorld('api', {
  activatePlugin: (name: string) => {
    console.log('activatePlugin', name)
    ipcRenderer.send('manager:activatePlugin', name)
  }
})