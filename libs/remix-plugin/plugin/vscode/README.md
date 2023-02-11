# Plugin vscode
This library provides connectors to run plugin in a vscode environment. Use this connector if you have a web based plugin that needs to run inside vscode.

**Except if you want your plugin to ONLY work on vscode, prefer [@remixproject/plugin-webview](../webview/readme.md)**

```
npm install @remixproject/plugin-vscode
```

## Webview
Similar to `@remixproject/plugin-iframe`, the webview connector will connect to an engine running inside vscode.

If you do not expose any API you can create an instance like this :
```html
<script>
  const client = createClient(ws)
  client.onload(async () => {
    const data = client.call('filemanager', 'readFile', 'ballot.sol')
  })
</script>
```

If you need to expose an API to other plugin you need to extends the class: 
```html
<script>
  class MyPlugin extends PluginClient {
    methods = ['hello']
    hello() {
      console.log('Hello World')
    }
  }
  const client = createClient(ws)
  client.onload(async () => {
    const data = client.call('filemanager', 'readFile', 'ballot.sol')
  })
</script>
```