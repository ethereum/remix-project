# Content Import

- Name in Remix: `contentImport`
- kind: `contentImport`

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_method_ |`resolve`              |Resolve a file from github, ipfs, swarm, http or https
|_method_ |`resolveAndSave`       |Resolve a file from github, ipfs, swarm, http or https and save it in the file explorer
## Examples

### Methods
`resolve`: Resolve a file from github, ipfs, swarm, http or https
```typescript
const link = "https://github.com/GrandSchtroumpf/solidity-school/blob/master/std-0/1_HelloWorld/HelloWorld.sol"

const { content } = await client.call('contentImport', 'resolve', link)
// OR
const { content } = await client.contentImport.resolve(link)
```

`resolveAndSave`: Resolve and save a file from github, ipfs, swarm, http or https
```typescript
const link = "https://github.com/GrandSchtroumpf/solidity-school/blob/master/std-0/1_HelloWorld/HelloWorld.sol"
const targetPath = 'HelloWorld.sol' # optional

const { content } = await client.call('contentImport', 'resolveAndSave', link, targetPath)
// OR
const { content } = await client.contentImport.resolveAndSave(link, targetPath)
```

## Types
`ContentImport`: An object that describes the returned file
```typescript
export interface ContentImport {
  content: string
  cleanUrl: string
  type: 'github' | 'http' | 'https' | 'swarm' | 'ipfs'
  url: string
}
```

> Type Definitions can be found [here](../src/lib/content-import/type.ts)