import { Engine, PluginManager, Plugin } from '@remixproject/engine';
import { ipcMain, ipcRenderer } from 'electron';
import { fsPlugin } from './fsPlugin';

const engine = new Engine()
const appManager = new PluginManager()
const plugin = new fsPlugin()
engine.register(appManager)
engine.register(plugin)
//appManager.activatePlugin('fs')

ipcMain.on('engine:activatePlugin', (event, arg) => {
  appManager.activatePlugin(arg)
})
