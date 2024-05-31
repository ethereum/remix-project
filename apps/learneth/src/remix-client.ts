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

  startTutorial(name: any, branch: any, id: any): void {
    console.log('start tutorial', name, branch, id)
    void router.navigate('/home')
    loadRepo({
      name,
      branch,
      id,
    })
  }

  addRepository(name: any, branch: any) {
    console.log('add repo', name, branch)
    void router.navigate('/home')
    loadRepo({
      name,
      branch,
    })
  }
}

