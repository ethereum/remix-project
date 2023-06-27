import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { parse_circuit_browser } from 'apps/circuit-compiler/pkg/circom'
import EventManager from 'events'

export class CircomPluginClient extends PluginClient {
    private connected: boolean
    public internalEvents: EventManager

    constructor() {
        super()
        createClient(this)
        this.internalEvents = new EventManager()
        this.methods = ["init", "compile"]
        this.onload()
    }

    init (): void {
        console.log('initializing circom plugin...')
    }

    async compile (path: string) {
        console.log('compiling circuit ' + path)
        const fileContent = await this.call('fileManager', 'readFile', path)

        console.log('file content: ' + fileContent)
        const compilationResult = parse_circuit_browser(fileContent, 0)

        console.log('compilation result: ' + compilationResult)
    }
}
