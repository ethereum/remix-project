import { Engine, PluginManager, Plugin } from '@remixproject/engine';
import { ipcMain, ipcRenderer } from 'electron';
import { FSPlugin } from './fsPlugin';
import { GitPlugin } from './gitPlugin';

const engine = new Engine()
const appManager = new PluginManager()
const fsPlugin = new FSPlugin()
const gitPlugin = new GitPlugin()
engine.register(appManager)
engine.register(fsPlugin)
engine.register(gitPlugin)

ipcMain.handle('engine:activatePlugin', async (event, arg) => {
  console.log('engine:activatePlugin', arg)
  if(await appManager.isActive(arg)){
    return true
  }
  return await appManager.activatePlugin(arg)
})
