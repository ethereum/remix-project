# Network

- Name in Remix: `network`
- kind: `network`

The network exposes methods and events about : 
- The provider: `web3`, `vm`, `injected`.
- The Ethereum Network: `mainnet`, `ropsten`, `rinkeby`, `kovan`, `Custom`


|Type     |Name                 |Description
|---------|---------------------|--
|_event_  |`providerChanged`    |Triggered when the provider changes.
|_method_ |`getNetworkProvider` |Get the current provider.
|_method_ |`getEndpoint`        |Get the URL of the provider if `web3`.
|_method_ |`detectNetwork`      |Get the current network used.
|_method_ |`addNetwork`         |Add a custom network.
|_method_ |`removeNetwork`      |Remove a custom network.

## Examples

### Events
`providerChanged`: Triggered when the provider changes.
```typescript
client.solidity.on('providerChanged', (provider: NetworkProvider) => {
  // Do something
})
// OR
client.on('fileManager', 'currentFileChanged', (provider: NetworkProvider) => {
  // Do something
})
```

### Methods
`getNetworkProvider`: Get the current provider.
```typescript
const provider = await client.network.getNetworkProvider()
// OR
const provider = await client.call('network', 'getNetworkProvider')
```

`getEndpoint`: Get the URL of the provider if `web3`.
```typescript
const endpoint = await client.network.getEndpoint()
// OR
const endpoint = await client.call('network', 'getEndpoint')
```

`detectNetwork`: Get the current network being used.
```typescript
const network = await client.network.detectNetwork()
// OR
const network = await client.call('network', 'detectNetwork')
```

`addNetwork`: Add a custom network.
```typescript
await client.network.addNetwork({ name: 'local', url: 'http://localhost:8586' })
// OR
await client.call('network', 'addNetwork', { name: 'local', url: 'http://localhost:8586' })
```

`removeNetwork`: Remove a custom network.
```typescript
await client.network.removeNetwork({ name: 'local', url: 'http://localhost:8586' })
// OR
await client.call('network', 'removeNetwork', 'local')
```

## Types
`NetworkProvider`: A string literal : `vm`, `injected` or `web3`.
`Network`: A simple object with the `name` and `id` of the network.
`CustomNetwork`: A simple object with a `name` and `url`.

> Type Definitions can be found [here](../src/lib/network/type.ts)