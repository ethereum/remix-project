# Udapp

- Name in Remix: `udapp`
- kind: `udapp`

The udapp exposes an interface for interacting with the account and transaction.

|Type     |Name                 |Description
|---------|---------------------|--
|_event_  |`newTransaction`     |Triggered when a new transaction has been sent.
|_method_ |`sendTransaction`    |Send a transaction **only for testing networks**.
|_method_ |`getAccounts`        |Get an array with the accounts exposed.
|_method_ |`createVMAccount`    |Add an account if using the VM provider. 

## Examples

### Events
`newTransaction`: Triggered when a new transaction has been sent.
```typescript
client.udapp.on('newTransaction', (tx: RemixTx) => {
  // Do something
})
// OR
client.on('udapp', 'newTransaction', (tx: RemixTx) => {
  // Do something
})
```

### Methods
`sendTransaction`: Send a transaction **only for testing networks**.
```typescript
const transaction: RemixTx = {
  gasLimit: '0x2710',
  from: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  to: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c'
  data: '0x...',
  value: '0x00',
  useCall: false
}
const receipt = await client.udapp.sendTransaction(transaction)
// OR
const receipt = await client.call('udapp', 'sendTransaction', transaction)
```

`getAccounts`: Get an array with the accounts exposed.
```typescript
const accounts = await client.udapp.getAccounts()
// OR
const accounts = await client.call('udapp', 'getAccounts')
```

`createVMAccount`: Add an account if using the VM provider. 
```typescript
const privateKey = "71975fbf7fe448e004ac7ae54cad0a383c3906055a75468714156a07385e96ce"
const balance = "0x56BC75E2D63100000"
const address = await client.udapp.createVMAccount({ privateKey, balance })
// OR
const address = await client.call('udapp', 'createVMAccount', { privateKey, balance })
```

## Types
`RemixTx`: A modified version of the transaction for Remix.
`RemixTxReceipt`: A modified version of the transaction receipt for Remix.


> Type Definitions can be found [here](../src/lib/udapp/type.ts)