# Plugin Webworker

This library provides connectors to connect a plugin to an engine that can load webworkers.
```
npm install @remixproject/plugin-webworker
```

If you do not expose any API you can create an instance like this :
```typescript
import { createClient } from '@remixproject/plugin-webworker'

const client = createClient()
client.onload(async () => {
  const data = client.call('filemanager', 'readFile', 'ballot.sol')
})
```

If you need to expose an API to other plugin you need to extends the class: 
```typescript
import { createClient } from '@remixproject/plugin-webworker'
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