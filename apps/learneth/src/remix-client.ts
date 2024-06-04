import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { loadRepo } from './actions'
import { router } from './App'
import EventManager from 'events'

export class RemixClient extends PluginClient {
  public internalEvents: EventManager
  constructor() {
    super()
    this.internalEvents = new EventManager()
    createClient(this)
    this.onload()
  }

  onActivation(): void {
    this.internalEvents.emit('learneth_activated')
  }

  async startTutorial(name: any, branch: any, id: any): Promise<void> {
    void router.navigate('/home')
    await loadRepo({
      name,
      branch,
      id,
    })
  }

  async addRepository(name: any, branch: any) {
    console.log('add repo', name, branch)
    void router.navigate('/home')
    await loadRepo({
      name,
      branch,
    })
  }
}

