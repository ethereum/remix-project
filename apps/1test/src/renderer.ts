
import { Engine, Plugin, PluginManager } from '@remixproject/engine';
import { fsPlugin } from './remix/fsPlugin';
import { gitPlugin } from './remix/gitPlugin';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { xtermPlugin } from './remix/xtermPlugin';

class MyAppManager extends PluginManager {
  onActivation(): void {
    this.on('fs', 'loaded', async () => {
      console.log('fs loaded')
    })
    /*
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
      //const log = await this.call('git', 'log', '/Volumes/bunsen/code/rmproject2/remix-project/')
      //console.log('log', log)
    })
    */
    this.on('xterm', 'loaded', async () => {
      console.log('xterm loaded')
      /*
      const term = new Terminal();
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(document.getElementById('terminal'));
      fitAddon.fit();


      const pid = await this.call('xterm', 'createTerminal')
      console.log('pid', pid)
      this.on('xterm', 'data', (data: string, pid: number) => {
        console.log('data', data)
        term.write(data)
      }
      )

      term.onData((data) => {
        console.log('term.onData', data)
        this.call('xterm', 'keystroke', data, pid)
      }
      );
      */
    })
  }
}


const engine = new Engine()
const appManager = new MyAppManager()
export const fs = new fsPlugin()
const git = new gitPlugin()
export const xterm = new xtermPlugin()

export class filePanelPlugin extends Plugin {
  constructor() {
    super({
      displayName: 'filePanel',
      name: 'filePanel',
    })
  }
}

export const filePanel = new filePanelPlugin()

engine.register(appManager)
engine.register(fs)
engine.register(git)
engine.register(xterm)
engine.register(filePanel)

appManager.activatePlugin('fs')
appManager.activatePlugin('git')
appManager.activatePlugin('xterm')
appManager.activatePlugin('filePanel')


setTimeout(async () => {
  const files = await appManager.call('fs', 'readdir', './src')
  console.log('files', files)
}, 1000)



import './app'
import { ElectronPlugin } from './remix/lib/electronPlugin';

