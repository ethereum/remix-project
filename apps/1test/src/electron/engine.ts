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
//appManager.activatePlugin('fs')

ipcMain.on('engine:activatePlugin', (event, arg) => {
  console.log('engine:activatePlugin', arg)
  appManager.activatePlugin(arg)
})
