export const loadTypes = async (monaco) => {
    // @ts-ignore
    const ethersAbi = await import('raw-loader!@ethersproject/abi/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAbi.default, `file:///node_modules/@types/@ethersproject/abi/index.d.ts`)

    // @ts-ignore
    const ethersAbstract = await import('raw-loader!@ethersproject/abstract-provider/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAbstract.default, `file:///node_modules/@types/@ethersproject/abstract-provider/index.d.ts`)

    // @ts-ignore
    const ethersSigner = await import('raw-loader!@ethersproject/abstract-signer/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSigner.default, `file:///node_modules/@types/@ethersproject/abstract-signer/index.d.ts`)

    // @ts-ignore
    const ethersAddress = await import('raw-loader!@ethersproject/address/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAddress.default, `file:///node_modules/@types/@ethersproject/address/index.d.ts`)

    // @ts-ignore
    const ethersBase64 = await import('raw-loader!@ethersproject/base64/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBase64.default, `file:///node_modules/@types/@ethersproject/base64/index.d.ts`)

    // @ts-ignore
    const ethersBasex = await import('raw-loader!@ethersproject/basex/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBasex.default, `file:///node_modules/@types/@ethersproject/basex/index.d.ts`)

    // @ts-ignore
    const ethersBignumber = await import('raw-loader!@ethersproject/bignumber/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBignumber.default, `file:///node_modules/@types/@ethersproject/bignumber/index.d.ts`)

    // @ts-ignore
    const ethersBytes = await import('raw-loader!@ethersproject/bytes/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBytes.default, `file:///node_modules/@types/@ethersproject/bytes/index.d.ts`)

    // @ts-ignore
    const ethersConstants = await import('raw-loader!@ethersproject/constants/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersConstants.default, `file:///node_modules/@types/@ethersproject/constants/index.d.ts`)

    // @ts-ignore
    const ethersContracts = await import('raw-loader!@ethersproject/contracts/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersContracts.default, `file:///node_modules/@types/@ethersproject/contracts/index.d.ts`)

    // @ts-ignore
    const ethersHash = await import('raw-loader!@ethersproject/hash/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersHash.default, `file:///node_modules/@types/@ethersproject/lib/index.d.ts`)

    // @ts-ignore
    const ethersHdnode = await import('raw-loader!@ethersproject/hdnode/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersHdnode.default, `file:///node_modules/@types/@ethersproject/hdnode/index.d.ts`)

    // @ts-ignore
    const ethersJsonWallets = await import('raw-loader!@ethersproject/json-wallets/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersJsonWallets.default, `file:///node_modules/@types/@ethersproject/json-wallets/index.d.ts`)

    // @ts-ignore
    const ethersKeccak256 = await import('raw-loader!@ethersproject/keccak256/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersKeccak256.default, `file:///node_modules/@types/@ethersproject/keccak256/index.d.ts`)

    // @ts-ignore
    const ethersLogger = await import('raw-loader!@ethersproject/logger/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersLogger.default, `file:///node_modules/@types/@ethersproject/logger/index.d.ts`)

    // @ts-ignore
    const ethersNetworks = await import('raw-loader!@ethersproject/networks/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersNetworks.default, `file:///node_modules/@types/@ethersproject/networks/index.d.ts`)

    // @ts-ignore
    const ethersPbkdf2 = await import('raw-loader!@ethersproject/pbkdf2/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersPbkdf2.default, `file:///node_modules/@types/@ethersproject/pbkdf2/index.d.ts`)

    // @ts-ignore
    const ethersProperties = await import('raw-loader!@ethersproject/properties/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersProperties.default, `file:///node_modules/@types/@ethersproject/properties/index.d.ts`)

    // @ts-ignore
    const ethersProviders = await import('raw-loader!@ethersproject/providers/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersProviders.default, `file:///node_modules/@types/@ethersproject/providers/index.d.ts`)

    // @ts-ignore
    const ethersRandom = await import('raw-loader!@ethersproject/random/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersRandom.default, `file:///node_modules/@types/@ethersproject/random/index.d.ts`)

    // @ts-ignore
    const ethersRlp = await import('raw-loader!@ethersproject/rlp/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersRlp.default, `file:///node_modules/@types/@ethersproject/rlp/index.d.ts`)

    // @ts-ignore
    const ethersSha2 = await import('raw-loader!@ethersproject/sha2/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSha2.default, `file:///node_modules/@types/@ethersproject/sha2/index.d.ts`)

    // @ts-ignore
    const ethersSingningkey = await import('raw-loader!@ethersproject/signing-key/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSingningkey.default, `file:///node_modules/@types/@ethersproject/signing-key/index.d.ts`)

    // @ts-ignore
    const ethersSolidity = await import('raw-loader!@ethersproject/solidity/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSolidity.default, `file:///node_modules/@types/@ethersproject/solidity/index.d.ts`)

    // @ts-ignore
    const ethersStrings = await import('raw-loader!@ethersproject/strings/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersStrings.default, `file:///node_modules/@types/@ethersproject/strings/index.d.ts`)

    // @ts-ignore
    const ethersTransactions = await import('raw-loader!@ethersproject/transactions/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersTransactions.default, `file:///node_modules/@types/@ethersproject/transactions/index.d.ts`)

    // @ts-ignore
    const ethersUnits = await import('raw-loader!@ethersproject/units/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersUnits.default, `file:///node_modules/@types/@ethersproject/units/index.d.ts`)

    // @ts-ignore
    const ethersWallet = await import('raw-loader!@ethersproject/wallet/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWallet.default, `file:///node_modules/@types/@ethersproject/wallet/index.d.ts`)

    // @ts-ignore
    const ethersWeb = await import('raw-loader!@ethersproject/web/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWeb.default, `file:///node_modules/@types/@ethersproject/web/index.d.ts`)

    // @ts-ignore
    const ethersWordlists = await import('raw-loader!@ethersproject/wordlists/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWordlists.default, `file:///node_modules/@types/@ethersproject/wordlists/index.d.ts`)

    // @ts-ignore
    const ethers = await import('raw-loader!ethers/lib/ethers.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethers.default, `file:///node_modules/@types/ethers/ethers.d.ts`)

    // @ts-ignore
    const indexEthers = await import('raw-loader!ethers/lib/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexEthers.default, `file:///node_modules/@types/ethers/index.d.ts`)

    console.log('loaded monaco types')
}