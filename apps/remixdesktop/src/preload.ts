
import { Message } from '@remixproject/plugin-utils'
import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts')

/* preload script needs statically defined API for each plugin */

const exposedPLugins = ['fs', 'git', 'xterm', 'isogit', 'electronconfig']

console.log('preload.ts', process)
let webContentsId: number | undefined
/*
// get the window id from the process arguments
const windowIdFromArgs = process.argv.find(arg => arg.startsWith('--window-id='))
if (windowIdFromArgs) {
  [, windowId] = windowIdFromArgs.split('=')
  console.log('windowId', windowId, )
}
*/
ipcRenderer.invoke('getWebContentsID').then((id: number) => {
  webContentsId = id
  console.log('getWebContentsID', webContentsId)
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
        console.log('send', message, `${name}:on:${webContentsId}`)
        ipcRenderer.send(`${name}:on:${webContentsId}`, message)
      }
    }
  })
})