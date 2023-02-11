# Engine Web
The web engine provides a connector for Iframe & Websocket.
`npm install @remixproject/engine-web`

## Iframe
The iframe connector is used to load & connect a plugin inside an iframe.
Iframe based plugin are webview using an `index.html` as entry point & need to use `@remixproject/plugin-iframe`.

```typescript
const myPlugin = new IframePlugin({
  name: 'my-plugin',
  url: 'https://my-plugin-path.com',
  methods: ['getData']
})
engine.register(myPlugin);
// This will create the iframe with src="https://my-plugin-path.com"
await manager.activatePlugin('my-plugin');
const data = manager.call('my-plugin', 'getData');
```

> Communication between the plugin & the engine uses the `window.postMessage()` API.

## Websocket
The websocket connector wraps the native [Websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) object from the Web API.
Websocket based plugin are usually server with a Websocket connection open. Any library can be used, remixproject provide a wrapper around the `ws` library : `@remixproject/plugin-ws`.

```typescript
const myPlugin = new WebsocketOptions({
  name: 'my-plugin',
  url: 'https://my-server.com',
  methods: ['getData']
}, {
  reconnectDelay: 5000 // Time in ms to wait to reconnect after a disconnection 
});
engine.register(myPlugin);
// This will open a connection with the server. The server must be running first.
await manager.activatePlugin('my-plugin');
const data = manager.call('my-plugin', 'getData');
```

