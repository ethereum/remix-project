import { Engine, PluginManager } from '@remixproject/engine';
import { ipcMain } from 'electron';
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

ipcMain.handle('manager:activatePlugin', async (event, arg) => {
  console.log('manager:activatePlugin', arg)
  if(await appManager.isActive(arg)){
    return true
  }
  return await appManager.activatePlugin(arg)
})

app.on('before-quit', async () => {
  await appManager.call('fs', 'closeWatch')
  app.quit()
})