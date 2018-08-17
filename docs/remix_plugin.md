Remix Plugin API
================

This section provides informations about developing plugin for Remix.

Introduction
------------

A plugin is basically a front end interface loaded through an iframe. Plugins have access to remix main features through an API.
This API consist of `notification` and `request` messages built over iframe messages (https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
plugin resources (html, js, img, ...) needs to have their own hosting, either using normal web or using decentralized infrastructure like Swarm and IPFS.

A plugin declaration is a JSON value which contains the properties `url` and `title`.

```
{
    "title": "<plugin name>",
    "url": "<plugin url>"
}
``` 


Loading / Registering a plugin in Remix IDE can be done:

 - Creating a PR which add a new entry: https://github.com/ethereum/remix-ide/blob/master/src/app/plugin/plugins.js , the plugin can then be loaded directly from remix IDE with a single click.
 - In the settings tab, paste a plugin declaration in the plugin section and hit load.
 - Load Remix IDE with the following url parameters: `pluginurl` and `plugintitle`

Using the API with iframe post message
--------------------------------------

A message (either received by the plugin or sent to it) is defined as follow:

```
    {
      action: <request, response or notification>,
      key: '<key>',
      type: '<type>',
      value: [<value1>, <value2>, ...],
      id: <call id> <used to track response>
    }
```

example:

```
    window.parent.postMessage(JSON.stringify({
        action: 'request',
        key: 'config',
        type: 'setConfig',
        value: [document.getElementById('filename').value, document.getElementById('valuetosend').value],
        id: 34
    }), '*')
```

There are 2 ways for interacting with the API, listening on notification and sending request

```
    function receiveMessage (event) {
        if (event.data.action === 'notification') {
            ...
        }
        if (event.data.action === 'response') {
            < listen on the response of the request app / updateTitle >
            < contain event.data.error if any >
            ...
        }
    }
    window.addEventListener('message', receiveMessage, false)
    
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'app',
      type: 'updateTitle',
      value: ['changed title ' + k++],
      id: 39
    }), '*')
```

from a response point of view, The `error` property is `undefined` if no error happened. In case of error (due to permission, system error, API error, etc...), `error` contains a string describing the error

see [Remix Plugin API usage](./remix_plugin_api.html) for a list of available key / value describing the API.

Using the API with remix extension NPM package
----------------------------------------------

The `remix-plugin` NPM package can be used to abstract the iframe layer:

```
    var extension = require('remix-plugin')
    
    extension.listen('<key>', '<type>', function () {})
    extension.call('<key>', '<type>', '<array of parameters>', function (error, result) {})
    
    // examples
    extension.listen('compiler', 'compilationFinished', function () {})
    extension.call('app', 'detectNetWork', [], function (error, result) {})
    extension.call('config', 'setConfig', ['<filename>', '<content>'], function (error, result) {})
```   

`error` is either null or a string, `result` is an array.
