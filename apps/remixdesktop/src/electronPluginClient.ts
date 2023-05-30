import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'

export class ElectronPluginConnector implements ClientConnector {

    /** Send a message to the engine */
    send(message: Partial<Message>) {
        window.postMessage(message, '*')
    }

    /** Listen to message from the engine */
    on(cb: (message: Partial<Message>) => void) {
        
    }
}

export const createClient = <
    P extends Api,
    App extends ApiMap = Readonly<IRemixApi>
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
    const c = client as any
    connectClient(new ElectronPluginConnector(), c)
    applyApi(c)
    return c
}