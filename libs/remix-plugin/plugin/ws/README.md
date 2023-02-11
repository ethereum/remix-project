# Plugin ws
This library is a connector that connects a node server to using the `ws` library to the engine.

If you do not expose any API you can create an instance like this :
```typescript
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  const client = createClient(ws)
})
```

If you need to expose an API to other plugin you need to extends the class: 
```typescript
class MyPlugin extends PluginClient {
 methods = ['hello']
 hello() {
  console.log('Hello World')
 }
}
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
 const client = createClient(ws, new MyPlugin())
})
```