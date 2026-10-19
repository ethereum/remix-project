# Arkiv Network Scripts

[Arkiv](https://arkiv.network/) is a Web3 database protocol that combines blockchain guarantees with database convenience. It lets you store queryable, tamper-evident, wallet-owned data on-chain — with built-in expiration so you only pay for data you actually need.

## What these scripts do

| File | Purpose |
|---|---|
| `scripts/arkiv/arkiv.ts` | Exports `saveToArkiv(message)` — creates an entity on the Arkiv Tiramisu testnet and reads it back |
| `scripts/arkiv/run.ts` | Calls `saveToArkiv('Hello, Arkiv!')` using the currently selected account |

### Step by step

1. Reads the selected account from the Remix environment (`udappEnv → getSelectedAccount`).
2. Creates a **wallet client** (for writes) using the injected `web3Provider` and the Tiramisu testnet chain.
3. Creates a **public client** (for reads) using a public HTTP RPC.
4. Calls `walletClient.createEntity()` to write a `text/plain` entity to Arkiv, tagged with `{ type: 'greeting' }` and set to expire in 1 hour.
5. Logs the returned `entityKey` and transaction hash.
6. Calls `publicClient.getEntity(entityKey)` to read the entity back and prints its text content.

## Prerequisites

- Connect MetaMask (or any injected wallet) to the **Tiramisu testnet** in Remix.
- Make sure your account has testnet funds — use the faucet at [Arkiv Hub](https://arkiv.network/).

## Running

Open `scripts/arkiv/run.ts` in the Remix editor and click the **Run** button (▶).

## Key concepts

- **Entity** — the core data unit in Arkiv. It holds a typed payload, optional indexed attributes, and an expiration time.
- **ExpirationTime** — controls how long data lives on-chain before it is automatically pruned.
- **Tiramisu** — the current Arkiv testnet chain (imported from `@arkiv-network/sdk/chains`).
- **entityKey** — a unique identifier returned on creation, used to retrieve or manage the entity later.

## SDK reference

```ts
import { createWalletClient, createPublicClient, ExpirationTime } from '@arkiv-network/sdk';
import { stringToPayload } from '@arkiv-network/sdk/utils';
import { tiramisu } from '@arkiv-network/sdk/chains';
```

Full SDK docs: https://arkiv.network/
