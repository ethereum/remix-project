# Plugin Webview

This library provides connectors to connect a plugin to an engine that can load webview or iframes.
```
npm install @remixproject/plugin-webview
```

If you do not expose any API you can create an instance like this :
```typescript
import { createClient } from '@remixproject/plugin-webview'

const client = createClient()
client.onload(async () => {
  const data = client.call('filemanager', 'readFile', 'ballot.sol')
})
```

If you need to expose an API to other plugin you need to extends the class: 
```typescript
import { createClient } from '@remixproject/plugin-webview'
import { PluginClient } from '@remixproject/plugin'

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