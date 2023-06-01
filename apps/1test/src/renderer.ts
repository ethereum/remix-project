
import { Engine, PluginManager } from '@remixproject/engine';
import { fsPlugin } from './remix/fsPlugin';
import { gitPlugin } from './remix/gitPlugin';


class MyAppManager extends PluginManager {
  onActivation(): void {
    this.on('fs', 'loaded', async () => {
      const files =  await this.call('fs', 'readdir', './')
      console.log('files', files)
      let exists =  await this.call('fs', 'exists', '/Volumes/bunsen/code/rmproject2/remix-project/')
      console.log('exists', exists)
      exists =  await this.call('fs', 'exists', './notexists')
      console.log('exists', exists)
      // stat test
      const stat = await this.call('fs', 'stat', '/Volumes/bunsen/code/rmproject2/remix-project/')
      console.log('stat', stat)
      // read file test
      const content = await this.call('fs', 'readFile', './src/index.html')
      console.log('content', content)

      await this.call('fs', 'watch', '/Volumes/bunsen/code/rmproject2/remix-project/')

      this.on('fs', 'change', (path: string, stats: any) => {
        console.log('change', path, stats)
      })
    })

    this.on('git', 'loaded', async () => {
      const log = await this.call('git', 'log', '/Volumes/bunsen/code/rmproject2/remix-project/')
      console.log('log', log)
    })
  }
}


const engine = new Engine()
const appManager = new MyAppManager()
const fs = new fsPlugin()
const git = new gitPlugin()
engine.register(appManager)
engine.register(fs)
engine.register(git)
appManager.activatePlugin('fs')
appManager.activatePlugin('git')


setTimeout(async () => {
  const files = await appManager.call('fs', 'readdir', './src')
  console.log('files', files)
}, 1000)

