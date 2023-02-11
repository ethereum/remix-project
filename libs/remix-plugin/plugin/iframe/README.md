# Plugin frame

**Except if you want your plugin to ONLY work on the web, prefer [@remixproject/plugin-webview](../webview)**

This library provides connectors to connect a plugin to an engine running in a web environment.
```
npm install @remixproject/plugin-iframe
```

If you do not expose any API you can create an instance like this :
```typescript
import { createClient } from '@remixproject/plugin-iframe'

const client = createClient()
client.onload(async () => {
  const data = client.call('filemanager', 'readFile', 'ballot.sol')
})
```

If you need to expose an API to other plugin you need to extends the class: 
```typescript
import { createClient } from '@remixproject/plugin-iframe'
import { PluginClient } from '@rexmixproject/plugin'

class MyPlugin extends PluginClient {
  methods = ['hello']
  hello() {
    console.log('Hello World')
  }
}
const client = createClient()
client.onload(async () => {
  const data = client.call('filemanager', 'readFile', 'ballot.sol')
})
```
