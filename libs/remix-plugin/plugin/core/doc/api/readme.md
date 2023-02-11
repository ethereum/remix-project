## Client API

### Loaded
`PluginClient` listen on a first handshake from the IDE before beeing able to communicate back. For that you need to wait for the Promise / callback `onload` to be called.

```javascript
client.onload(() => /* Do something */)
client.onload().then(_ => /* Do Something now */)
await client.onload()
```

### Events
To listen to an event you need to provide the name of the plugin you're listening on, and the name of the event :
```javascript
client.on(/* pluginName */, /* eventName */, ...arguments)
```

For exemple if you want to listen to Solidity compilation :
```javascript
client.on('solidity', 'compilationFinished', (target, source, version, data) => {
    /* Do Something on Compilation */
  }
)
```

⚠️ Be sure that your plugin is loaded before listening on an event.

> See all available event [below](#api).

### Call
You can call some methods exposed by the IDE with with the method `call`. You need to provide the name of the plugin, the name of the method, and the arguments of the methods :
```javascript
await client.call(/* pluginName */, /* methodName */, ...arguments)
```
> Note: `call` is alway Promise

For example if you want to upsert the current file :
```typescript
async function upsertCurrentFile(content: string) {
  const path = await client.call('fileManager', 'getCurrentFile')
  await client.call('fileManager', 'setFile', path, content)
}
```

⚠️ Be sure that your plugin is loaded before making any call.

### Emit
Your plugin can emit events that other plugins can listen on.
```javascript
client.emit(/* eventName */, ...arguments)
```

Let's say your plugin build deploys a Readme for your contract on IPFS :
```javascript
async function deployReadme(content) {
  const [ result ] = await ipfs.files.add(content);
  client.emit('readmeDeployed', result.hash)
}
```

> Note: Be sure that your plugin is loaded before making any call.

### Expose methods
Your plugin can also exposed methods to other plugins. For that you need to extends the `PluginClient` class, and override the `methods` property : 
```typescript
class MyPlugin extends PluginClient {
  methods: ['sayHello'];

  sayHello(name: string) {
    return `Hello ${name} !`;
  }
}
const client = buildIframeClient(new MyPlugin())
```
> When extending the `PluginClient` you need to connect your client to the iframe with `buildIframeClient`.

You can find an exemple [here](https://github.com/pldespaigne/remix-3box-plugin).
