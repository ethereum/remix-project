
import { Engine, PluginManager, Plugin, PluginConnector } from '@remixproject/engine';
import { Profile } from '@remixproject/plugin-utils';
import { fsPlugin } from './remix/lib/fsPlugin';
import { gitPlugin } from './remix/lib/gitPlugin';



const engine = new Engine()
const appManager = new PluginManager()
const fs = new fsPlugin()
const git = new gitPlugin()
engine.register(appManager)
engine.register(fs)
engine.register(git)
//appManager.activatePlugin('fs')
appManager.activatePlugin('git')

setTimeout(async () => {
  //const files =  await appManager.call('fs', 'readdir', './')
  //console.log('files', files)
  const log = await appManager.call('git', 'log', './')
  console.log('log', log)
}, 5000)

