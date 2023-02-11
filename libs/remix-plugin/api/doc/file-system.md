# File System

- Name in Remix: `fileManager`
- kind: `fs`


|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`currentFileChanged`   |Triggered when the user opens another file.
|_event_  |`fileSaved`            |Triggered when a file is saved.
|_event_  |`fileAdded`            |Triggered when a file is added.
|_event_  |`fileRemoved`          |Triggered when a file is removed.
|_event_  |`fileRenamed`          |Triggered when a file is removed.
|_event_  |`fileClosed`           |Triggered when a file is closed.
|_event_  |`noFileSelected`       |Triggered when no file is selected.
|_method_ |`getCurrentFile`       |Get the name of the current file selected.
|_method_ |`open`                 |Open the content of the file in the context (eg: Editor).
|_method_ |`writeFile`            |Set the content of a specific file.
|_method_ |`readFile`             |Return the content of a specific file.
|_method_ |`rename`               |Change the path of a file.
|_method_ |`copyFile`             |Upsert a file with the content of the source file.
|_method_ |`mkdir`                |Create a directory.
|_method_ |`readdir`              |Get the list of files in the directory.

## Examples

### Events
`currentFileChanged`: Triggered when a file changes.
```typescript
client.solidity.on('currentFileChanged', (fileName: string) => {
  // Do something
})
// OR
client.on('fileManager', 'currentFileChanged', (fileName: string) => {
  // Do something
})
```

### Methods
`getCurrentFile`: Get the name of the current file selected.
```typescript
const fileName = await client.fileManager.getCurrentFile()
// OR
const fileName = await client.call('fileManager', 'getCurrentFile')
```


`open`:Open the content of the file in the context (eg: Editor).
```typescript
await client.fileManager.open('browser/ballot.sol')
// OR
await client.call('fileManager', 'open', 'browser/ballot.sol')
```

`readFile`: Get the content of a file.
```typescript
const ballot = await client.fileManager.getFile('browser/ballot.sol')
// OR
const ballot = await client.call('fileManager', 'readFile', 'browser/ballot.sol')
```

`writeFile`: Set the content of a file.
```typescript
await client.fileManager.writeFile('browser/ballot.sol', 'pragma ....')
// OR
await client.call('fileManager', 'writeFile', 'browser/ballot.sol', 'pragma ....')
```

`rename`: Change the path of a file.
```typescript
await client.fileManager.rename('browser/ballot.sol', 'browser/ERC20.sol')
// OR
await client.call('fileManager', 'rename', 'browser/ballot.sol', 'browser/ERC20.sol')
```

`copyFile`: Insert a file with the content of the source file.
```typescript
await client.fileManager.copyFile('browser/ballot.sol', 'browser/NewBallot.sol')
// OR
await client.call('fileManager', 'copyFile', 'browser/ballot.sol', 'browser/NewBallot.sol')
```

`mkdir`: Create a directory.
```typescript
await client.fileManager.mkdir('browser/ERC')
// OR
await client.call('fileManager', 'mkdir', 'browser/ERC')
```

`readdir`: Create a directory.
```typescript
const files = await client.fileManager.readdir('browser/ERC')
// OR
const files = await client.call('fileManager', 'readdir', 'browser/ERC')
```


> Type Definitions can be found [here](../src/lib/file-system/type.ts)