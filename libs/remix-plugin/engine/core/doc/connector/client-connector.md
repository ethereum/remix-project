# Develop & Publish a Client Connector

## Install
```bash
npm install @remixproject/plugin@next
```

## Create your connector
Create a file `index.ts`

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

## Build

```
npx tsc index --declaration
```

## Package.json
```json
{
  "name": "client-connector-socket.io",
  "main": "index.js",
  "types": "index.d.ts",
  "dependencies": {
    "@remixproject/plugin": "next"
  },
  "peerDependencies": {
    "socket.io": "^2.3.0"
  }
}
```

Some notes here : 
- We use `dependancies` for `@remixproject/plugin` as this is the base code for your connector.
- We use `peerDependencies` for the library we wrap (here `socket.io`), as we want to let the user choose his version of it.

## Publish
```
npm publish
```

----

# Use a Client Connector
Here is how to use your client connector in a plugin :

## Install
```
npm install client-connector-socket.io socket.io
```

## Create a client
This example is an implementation of the [Server documentation from socket.io](https://socket.io/docs/server-api/).
```typescript
const { createSocketIOClient } = require('client-connector-socket.io')
const http = require('http').createServer();
const io = require('socket.io')(http);

io.on('connection', async (socket) => {
  const client = createSocketIOClient(socket)
  await client.onload()
  const code = await client.call('fileManager', 'read', 'Ballot.sol')
});

http.listen(3000);
```