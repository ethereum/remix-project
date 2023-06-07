import { Engine, PluginManager } from '@remixproject/engine';
import { BrowserWindow, ipcMain } from 'electron';
import { FSPlugin } from './fsPlugin';
import { GitPlugin } from './gitPlugin';
import { app } from 'electron';
import { XtermPlugin } from './xtermPlugin';


const engine = new Engine()
const appManager = new PluginManager()
const fsPlugin = new FSPlugin()
const gitPlugin = new GitPlugin()
const xtermPlugin = new XtermPlugin()

engine.register(appManager)
engine.register(fsPlugin)
engine.register(gitPlugin)
engine.register(xtermPlugin) 

appManager.activatePlugin('fs')
appManager.activatePlugin('git')
appManager.activatePlugin('xterm')

ipcMain.handle('manager:activatePlugin', async (event, plugin) => {
  console.log('manager:activatePlugin', plugin, event.sender.id)
  return await appManager.call(plugin, 'createClient', event.sender.id)
})

ipcMain.handle('getWebContentsID', (event, message) => {
  return event.sender.id
})


app.on('before-quit', async () => {
  console.log('before-quit')
  await appManager.call('fs', 'closeWatch')
  app.quit()
})

