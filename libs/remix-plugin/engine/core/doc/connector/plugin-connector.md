# Develop & Publish a Plugin Connector

## Install
```bash
npm install @remixproject/engine@next
```

## Create your connector
Create a file `index.ts`

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

## Build

```
npx tsc index --declaration
```

## Package.json
```json
{
  "name": "plugin-connector-socket.io",
  "main": "index.js",
  "types": "index.d.ts",
  "peerDependencies": {
    "@remixproject/engine": "next",
    "socket.io-client": "^2.3.0"
  }
}
```


## Publish
```
npm publish
```

----

# Use a Plugin Connector
Here is how to use your plugin connector in an engine :

## Install
```
npm install @remixproject/engine@next plugin-connector-socket.io socket.io-client
```

## Create a client
```typescript
import { PluginManager, Engine, Plugin } from '@remixproject/engine'
import { SocketIOPlugin } from 'plugin-connector-socket.io'

const manager = new PluginManager()
const engine = new Engine()
const plugin = new SocketIOPlugin({ name: 'socket', url: 'http://localhost:3000' })

// Register plugins
engine.register([manager, plugin])

// Activate plugins
manager.activatePlugin('socket')
```