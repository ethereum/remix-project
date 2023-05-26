import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'

export class CircomPluginClient extends PluginClient {
    private connected: boolean
    public internalEvents: EventManager

    constructor() {
        super()
        createClient(this)
        this.internalEvents = new EventManager()
        this.methods = ["sendAsync", "init", "deactivate"]
        this.onload()
    }

    init (): void {
        console.log('initializing circom plugin...')
    }

    onActivation(): void {
        this.subscribeToEvents()
    }

    activateRemixDeamon (): void {
        this.call('manager', 'activatePlugin', 'remixd')
    }

    subscribeToEvents (): void {
        this.on('filePanel', 'setWorkspace', (workspace: { name: string, isLocalhost: boolean }) => {
            if (this.connected !== workspace.isLocalhost) {
                this.connected = workspace.isLocalhost
                this.internalEvents.emit('connectionChanged', this.connected)
            }
        })
    }
}
