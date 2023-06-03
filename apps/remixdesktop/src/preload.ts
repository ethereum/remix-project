// electron preload script
// write contextbridge to window


import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts')

/* preload script needs statically defined API for each plugin */

const exposedPLugins = ['fs', 'git', 'xterm']

contextBridge.exposeInMainWorld('electronAPI', {
  activatePlugin: (name: string) => {
    return ipcRenderer.invoke('manager:activatePlugin', name)
  },
  
  plugins: exposedPLugins.map(name => {
    return {
      name,
      on: (cb:any) => ipcRenderer.on(`${name}:send`, cb),
      send: (message: Partial<Message>) => ipcRenderer.send(`${name}:on`, message)
    }
  })
})