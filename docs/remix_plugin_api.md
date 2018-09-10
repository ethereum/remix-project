Remix Plugin API usage
======================

This section list all the available key and value pair which define this API:

## 1) notifications

### app (key: app)
 
 - unfocus `[]`
 - focus `[]`

### compiler (key: compiler)

 - compilationFinished `[success (bool), data (obj), source (obj)]`
 - compilationData `[compilationResult (obj)]`
 
### transaction listener (key: txlistener)

 - newTransaction `[tx (obj)]`

### addendum
 
`newTransaction` is broadcasted to all loaded plugins.
`compilationFinished` is sent to the plugin that currently has the focus.
`focus / unfocus` is sent to the plugin which currently has the focus or is unfocused.
`compilationData` is sent always just upon the `focus` event and gives the last compilation result.

## 2) requests

### app

 - getExecutionContextProvider `@return {String} provider (injected | web3 | vm)`
 - getProviderEndpoint `@return {String} provider endpoint url if web3, returns an error if injected or javascript VM`
 - updateTitle `@param {String} title`
 
### config

 - setConfig `@param {String} path, @param {String} content`
 - getConfig `@param {String} path`
 - removeConfig `@param {String} path`

### compiler
 - getCompilationResult `@return {Object} compilation result`

### udapp (only VM)
 - runTx `@param {Object} tx`
 - getAccounts `@return {Array} acccounts`
 - createVMAccount `@param {String} privateKey, @param {String} balance (hex)`

### editor
 - getCurrentFile `@return {String} current file path displayed in the editor`
 - getFile `@param {String} path`
 - setFile `@param {String} path, @param {String} content`
 - highlight `@param {Object} lineColumnPos, @param {String} filePath, @param {String} hexColor`
 
 
 


