import { Engine, PluginManager } from '@remixproject/engine';
import { ipcMain } from 'electron';
import { FSPlugin } from './plugins/fsPlugin';
import { GitPlugin } from './plugins/gitPlugin';
import { app } from 'electron';
import { XtermPlugin } from './plugins/xtermPlugin';
import git from 'isomorphic-git'
import { IsoGitPlugin } from './plugins/isoGitPlugin';

const engine = new Engine()
const appManager = new PluginManager()
const fsPlugin = new FSPlugin()
const gitPlugin = new GitPlugin()
const xtermPlugin = new XtermPlugin()
const isoGitPlugin = new IsoGitPlugin()
engine.register(appManager)
engine.register(fsPlugin)
engine.register(gitPlugin)
engine.register(xtermPlugin)
engine.register(isoGitPlugin)

appManager.activatePlugin('fs')

ipcMain.handle('manager:activatePlugin', async (event, plugin) => {
  console.log('manager:activatePlugin', plugin, event.sender.id)
  return await appManager.call(plugin, 'createClient', event.sender.id)
})

ipcMain.on('fs:openFolder', async (event) => {
  console.log('fs:openFolder', event)
  fsPlugin.openFolder(event)
})

ipcMain.handle('getWebContentsID', (event, message) => {
  return event.sender.id
})

app.on('before-quit', async () => {
  await appManager.call('fs', 'closeWatch')
  app.quit()
})
