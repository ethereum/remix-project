# embark-remix
An Embark plugin that allows Remix to connect to a local DApp via [`remixd`](https://github.com/ethereum/remixd). This plugin serves a local copy of Remix IDE from the machine running the plugin or alternatively allows connection from the public [Remix IDE](https://remix.ethereum.org). The URL of the Remix IDE can be specified in the Embark plugin options, specified below.

## Options
To configure options for the `embark-remix` plugin, modify the `plugins` property of `embark.json` in the DApp.

### How to use default options
To pass no options to the plugin and use the defaults, simply use an empty object:
```
"plugins": {
  "embark-remix": {}
}
```
This will provide the default options to the plugin (shown below).

### Available options
The available options for this plugin are below. Default options are shown below. This is equivalent to passing an empty object `{}`.
```
"plugins": {
  "embark-remix": {
    "readOnly": false,
    "remixIde": {
      "protocol": "http",
      "host": "localhost",
      "port": 8088
    }
  }
}
```


`readOnly` does not let Remix update the contents on the local filesystem. 
 - Default: `false`

`remixIde` specifies the URL that the Remix IDE will be served from. If this is a `localhost` URL, the plugin creates a server that is responsible for listening on this URL. 
 - Default: `(see above)`

If it is preferred to connect to the public Remix IDE at https://remix.ethereum.org, set the `remixIde` config to:
```
"remixIde": {
  "protocol": "https",
  "host": "remix.ethereum.org",
  "port": false
}
```