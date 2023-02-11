# Connector
The engine exposes the **connector** to manage communications with plugins that are not running in the engine's main process.

The choice of connectors depends upon the platform that the engine is operating on.

For example an engine running on the web can have connectors with : 
- Iframes
- Webworkers
- ...

On the other hand an engine running in a node environment will have : 
- Child Process
- Worker Threads
- ...

## Create a Connector
A connector is a simple wrapper on both sides of a communication layer. 
It should implement : 
- `ClientConnector`: Connector used by the plugin (client).
- `PluginConnector`: Connector used by the engine.

> From a user point of view, the plugin is the "client" even if it's running in a server.

Let's create a connector for [socket.io](https://socket.io/) where : 
- `ClientConnector`: Plugin code that runs the server.
- `PluginConnector`: Engine recipient that runs in a browser

### ClientConnector
The **connector**'s connection on the plugin side implements the `ClientConnector` interface: 

```typescript
export interface ClientConnector {
  /** Send a message to the engine */
  send(message: Partial<Message>): void
  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void): void
}
```

```typescript
import { ClientConnector, createConnectorClient, PluginClient, Message } from '@remixproject/plugin'

export class SocketIOConnector implements ClientConnector {

  constructor(private socket) {}
  send(message: Partial<Message>) {
    this.socket.emit('message', message)
  }
  on(cb: (message: Partial<Message>) => void) {
    this.socket.on('message', (msg) => cb(msg))
  }
}

// A simple wrapper function for the plugin developer
export function createSocketIOClient(socket, client?: PluginClient) {
  const connector = new SocketIOConnector(socket)
  return createConnectorClient(connector, client)
}
```

Checkout how to [publish your client connector on npm](client-connector.md). 

### PluginConnector
The `PluginConnector` is an abstract class to be extended: 

```typescript
import { PluginConnector, Profile, ExternalProfile, Message } from '@remixproject/engine'
import io from 'socket.io-client';

export class SocketIOPlugin extends PluginConnector {
  socket: SocketIOClient.Socket

  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  protected connect(url: string): void {
    this.socket = io(url)
    this.socket.on('connect', () => {
      this.socket.on('message', (msg: Message) => this.getMessage(msg))
    })
  }

  protected disconnect(): void {
    this.socket.close()
  }

  protected send(message: Partial<Message>): void {
    this.socket.send(message)
  }

}
```

Let's take a look : 
- `connect` will be called when the plugin is activated.
- `disconnect` will be called when the plugin is deactivated.
- `send` will be called when another plugin calls the plugin's methods (on the server).
- `getMessage` should be called whenever a message arrives.

Checkout how to [publish your plugin connector on npm](plugin-connector.md).