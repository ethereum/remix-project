import { ElectronPlugin } from '@remixproject/engine-electron'

const profile = {
  displayName: 'remixAI',
  name: 'remixAI',
  description: 'Remix embraces AI. This plugin provides an AI copilot for web3',
  maintainedBy: 'remix',
  author: 'STetsing',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
}

export class remixAIPlugin extends ElectronPlugin {
  constructor() {
    console.log('remixAIPlugin')
    super(profile)
  }

  onActivation(): void {
    this.on('remixAI', 'enabled', () => {console.log('someone enable the remixAI desktop plugin')} )
  }
}