## External Plugins

The superpower of the Engine is the ability to interact safely with external plugins.

Currently the Engine supports 2 communication channels:
- Iframe
- Websocket

The interface of these plugins is exacly the same as the other plugins. 

### Iframe

For the `IframePlugin` we need to specify the `location` where the plugin will be displayed, and the `url` which will be used as the source of the iframe.

> The Engine can fetch the content of plugin hosted on IPFS or any other server accessible through HTTPS

```typescript
const ethdoc = new IframePlugin({
  name: 'ethdoc',
  location: 'sidePanel',
  url: 'ipfs://QmQmK435v4io3cp6N9aWQHYmgLxpUejjC1RmZCbqL7MJaM'
})
```

### Websocket

For the `WebsocketPlugin` you just need to specify the `url` as there is no UI to display.

> This plugin is very useful for connecting to a local server like remixD, and an external API

```typescript
const remixd = new WebsocketPlugin({
  name: 'remixd',
  url: 'wss://localhost:8000'
})
```

In the future, we'll implement more communication connection like REST, GraphQL, JSON RPC, gRPC, ...