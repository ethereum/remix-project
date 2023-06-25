import { Engine, PluginManager } from '@remixproject/engine';
import { ipcMain } from 'electron';
import { FSPlugin } from './plugins/fsPlugin';
import { app } from 'electron';
import { XtermPlugin } from './plugins/xtermPlugin';
import git from 'isomorphic-git'
import { IsoGitPlugin } from './plugins/isoGitPlugin';
import { ConfigPlugin } from './plugins/configPlugin';
import { TemplatesPlugin } from './plugins/templates';

const engine = new Engine()
const appManager = new PluginManager()
const fsPlugin = new FSPlugin()
const xtermPlugin = new XtermPlugin()
const isoGitPlugin = new IsoGitPlugin()
const configPlugin = new ConfigPlugin()
const templatesPlugin = new TemplatesPlugin()
engine.register(appManager)
engine.register(fsPlugin)
engine.register(xtermPlugin)
engine.register(isoGitPlugin)
engine.register(configPlugin)
engine.register(templatesPlugin)

appManager.activatePlugin('electronconfig')
appManager.activatePlugin('fs')


ipcMain.handle('manager:activatePlugin', async (event, plugin) => {
  console.log('manager:activatePlugin', plugin, event.sender.id)
  return await appManager.call(plugin, 'createClient', event.sender.id)
})

ipcMain.on('fs:openFolder', async (event) => {
  console.log('fs:openFolder', event)
  fsPlugin.openFolder(event)
})

ipcMain.on('template:open', async (event) => {
  console.log('template:open', event)
  templatesPlugin.openTemplate(event)
})

ipcMain.on('git:startclone', async (event) => {
  console.log('git:startclone', event)
  isoGitPlugin.startClone(event)
})



ipcMain.handle('getWebContentsID', (event, message) => {
  return event.sender.id
})


app.on('before-quit', async (event) => {
  //event.preventDefault()
  console.log('before-quit')
  await appManager.call('fs', 'removeCloseListener')
  await appManager.call('fs', 'closeWatch')
  //app.quit()
})
