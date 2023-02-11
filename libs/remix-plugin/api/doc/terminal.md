# File System

- Name in Remix: `terminal`

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_method_ |`log`                  |Log text to the terminal

## Examples

### Methods
`log`: Get the name of the current file selected.
```typescript
await client.terminal.log({ type: 'info', value: 'I am a string' })
// OR
await client.call('terminal',{ type: 'info', value: 'I am a string' })
```


> Type Definitions can be found [here](../src/lib/terminal/api.ts)
