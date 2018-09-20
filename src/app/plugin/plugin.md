plugin api

# current APIs:

## 1) notifications

### app (key: app)
 
 - unfocus `[]`
 - focus `[]`

### compiler (key: compiler)

 - compilationFinished `[success (bool), data (obj), source (obj)]`
 - compilationData `[compilationResult]`
 
### transaction listener (key: txlistener)

 - newTransaction `tx (obj)`

## 2) interactions

### app

 - getExecutionContextProvider `@return {String} provider (injected | web3 | vm)`
 - getProviderEndpoint `@return {String} url`
 - updateTitle `@param {String} title`
 - detectNetWork `@return {Object} {name, id}`
 
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
 - getFilesFromPath `@param {Array} [path]`
 - getCurrentFile `@return {String} path`
 - getFile `@param {String} path`
 - setFile `@param {String} path, @param {String} content`
 - highlight `@param {Object} lineColumnPos {start: {line, column}, end: {line, column}}, @param {String} path, @param {String} hexColor`
 - discardHighlight
 
