/// <reference lib="webworker" />
import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'


export class WebworkerConnector implements ClientConnector {

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    postMessage(message)
  }

  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void) {
    addEventListener('message', ({ data }) => cb(data))
  }
}

/**
 * Connect a Websocket plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createClient = <
  P extends Api,
  App extends ApiMap = Readonly<IRemixApi>
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(new WebworkerConnector(), c)
  applyApi(c)
  return c
}
