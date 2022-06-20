import { remixTypes } from './remix-plugin-types'

export const loadTypes = async (monaco) => {
    // ethers.js

    // @ts-ignore
    const ethersAbi = await import('raw-loader!@ethersproject/abi/lib/index.d.ts')
    ethersAbi.default = ethersAbi.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAbi.default, `file:///node_modules/@types/@ethersproject_abi/index.d.ts`)

    // @ts-ignore
    const ethersAbstract = await import('raw-loader!@ethersproject/abstract-provider/lib/index.d.ts')
    ethersAbstract.default = ethersAbstract.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAbstract.default, `file:///node_modules/@types/@ethersproject_abstract-provider/index.d.ts`)

    // @ts-ignore
    const ethersSigner = await import('raw-loader!@ethersproject/abstract-signer/lib/index.d.ts')
    ethersSigner.default = ethersSigner.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSigner.default, `file:///node_modules/@types/@ethersproject_abstract-signer/index.d.ts`)

    // @ts-ignore
    const ethersAddress = await import('raw-loader!@ethersproject/address/lib/index.d.ts')
    ethersAddress.default = ethersAddress.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersAddress.default, `file:///node_modules/@types/@ethersproject_address/index.d.ts`)

    // @ts-ignore
    const ethersBase64 = await import('raw-loader!@ethersproject/base64/lib/index.d.ts')
    ethersBase64.default = ethersBase64.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBase64.default, `file:///node_modules/@types/@ethersproject_base64/index.d.ts`)

    // @ts-ignore
    const ethersBasex = await import('raw-loader!@ethersproject/basex/lib/index.d.ts')
    ethersBasex.default = ethersBasex.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBasex.default, `file:///node_modules/@types/@ethersproject_basex/index.d.ts`)

    // @ts-ignore
    const ethersBignumber = await import('raw-loader!@ethersproject/bignumber/lib/index.d.ts')
    ethersBignumber.default = ethersBignumber.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBignumber.default, `file:///node_modules/@types/@ethersproject_bignumber/index.d.ts`)

    // @ts-ignore
    const ethersBytes = await import('raw-loader!@ethersproject/bytes/lib/index.d.ts')
    ethersBytes.default = ethersBytes.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersBytes.default, `file:///node_modules/@types/@ethersproject_bytes/index.d.ts`)

    // @ts-ignore
    const ethersConstants = await import('raw-loader!@ethersproject/constants/lib/index.d.ts')
    ethersConstants.default = ethersConstants.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersConstants.default, `file:///node_modules/@types/@ethersproject_constants/index.d.ts`)

    // @ts-ignore
    const ethersContracts = await import('raw-loader!@ethersproject/contracts/lib/index.d.ts')
    ethersContracts.default = ethersContracts.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersContracts.default, `file:///node_modules/@types/@ethersproject_contracts/index.d.ts`)

    // @ts-ignore
    const ethersHash = await import('raw-loader!@ethersproject/hash/lib/index.d.ts')
    ethersHash.default = ethersHash.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersHash.default, `file:///node_modules/@types/@ethersproject_hash/index.d.ts`)

    // @ts-ignore
    const ethersHdnode = await import('raw-loader!@ethersproject/hdnode/lib/index.d.ts')
    ethersHdnode.default = ethersHdnode.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersHdnode.default, `file:///node_modules/@types/@ethersproject_hdnode/index.d.ts`)

    // @ts-ignore
    const ethersJsonWallets = await import('raw-loader!@ethersproject/json-wallets/lib/index.d.ts')
    ethersJsonWallets.default = ethersJsonWallets.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersJsonWallets.default, `file:///node_modules/@types/@ethersproject_json-wallets/index.d.ts`)

    // @ts-ignore
    const ethersKeccak256 = await import('raw-loader!@ethersproject/keccak256/lib/index.d.ts')
    ethersKeccak256.default = ethersKeccak256.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersKeccak256.default, `file:///node_modules/@types/@ethersproject_keccak256/index.d.ts`)

    // @ts-ignore
    const ethersLogger = await import('raw-loader!@ethersproject/logger/lib/index.d.ts')
    ethersLogger.default = ethersLogger.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersLogger.default, `file:///node_modules/@types/@ethersproject_logger/index.d.ts`)

    // @ts-ignore
    const ethersNetworks = await import('raw-loader!@ethersproject/networks/lib/index.d.ts')
    ethersNetworks.default = ethersNetworks.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersNetworks.default, `file:///node_modules/@types/@ethersproject_networks/index.d.ts`)

    // @ts-ignore
    const ethersPbkdf2 = await import('raw-loader!@ethersproject/pbkdf2/lib/index.d.ts')
    ethersPbkdf2.default = ethersPbkdf2.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersPbkdf2.default, `file:///node_modules/@types/@ethersproject_pbkdf2/index.d.ts`)

    // @ts-ignore
    const ethersProperties = await import('raw-loader!@ethersproject/properties/lib/index.d.ts')
    ethersProperties.default = ethersProperties.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersProperties.default, `file:///node_modules/@types/@ethersproject_properties/index.d.ts`)

    // @ts-ignore
    const ethersProviders = await import('raw-loader!@ethersproject/providers/lib/index.d.ts')
    ethersProviders.default = ethersProviders.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersProviders.default, `file:///node_modules/@types/@ethersproject_providers/index.d.ts`)

    // @ts-ignore
    const ethersRandom = await import('raw-loader!@ethersproject/random/lib/index.d.ts')
    ethersRandom.default = ethersRandom.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersRandom.default, `file:///node_modules/@types/@ethersproject_random/index.d.ts`)

    // @ts-ignore
    const ethersRlp = await import('raw-loader!@ethersproject/rlp/lib/index.d.ts')
    ethersRlp.default = ethersRlp.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersRlp.default, `file:///node_modules/@types/@ethersproject_rlp/index.d.ts`)

    // @ts-ignore
    const ethersSha2 = await import('raw-loader!@ethersproject/sha2/lib/index.d.ts')
    ethersSha2.default = ethersSha2.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSha2.default, `file:///node_modules/@types/@ethersproject_sha2/index.d.ts`)

    // @ts-ignore
    const ethersSingningkey = await import('raw-loader!@ethersproject/signing-key/lib/index.d.ts')
    ethersSingningkey.default = ethersSingningkey.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSingningkey.default, `file:///node_modules/@types/@ethersproject_signing-key/index.d.ts`)

    // @ts-ignore
    const ethersSolidity = await import('raw-loader!@ethersproject/solidity/lib/index.d.ts')
    ethersSolidity.default = ethersSolidity.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersSolidity.default, `file:///node_modules/@types/@ethersproject_solidity/index.d.ts`)

    // @ts-ignore
    const ethersStrings = await import('raw-loader!@ethersproject/strings/lib/index.d.ts')
    ethersStrings.default = ethersStrings.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersStrings.default, `file:///node_modules/@types/@ethersproject_strings/index.d.ts`)

    // @ts-ignore
    const ethersTransactions = await import('raw-loader!@ethersproject/transactions/lib/index.d.ts')
    ethersTransactions.default = ethersTransactions.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersTransactions.default, `file:///node_modules/@types/@ethersproject_transactions/index.d.ts`)

    // @ts-ignore
    const ethersUnits = await import('raw-loader!@ethersproject/units/lib/index.d.ts')
    ethersUnits.default = ethersUnits.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersUnits.default, `file:///node_modules/@types/@ethersproject_units/index.d.ts`)

    // @ts-ignore
    const ethersWallet = await import('raw-loader!@ethersproject/wallet/lib/index.d.ts')
    ethersWallet.default = ethersWallet.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWallet.default, `file:///node_modules/@types/@ethersproject_wallet/index.d.ts`)

    // @ts-ignore
    const ethersWeb = await import('raw-loader!@ethersproject/web/lib/index.d.ts')
    ethersWeb.default = ethersWeb.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWeb.default, `file:///node_modules/@types/@ethersproject_web/index.d.ts`)

    // @ts-ignore
    const ethersWordlists = await import('raw-loader!@ethersproject/wordlists/lib/index.d.ts')
    ethersWordlists.default = ethersWordlists.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethersWordlists.default, `file:///node_modules/@types/@ethersproject_wordlists/index.d.ts`)

    // @ts-ignore
    const versionEthers = await import('raw-loader!ethers/lib/_version.d.ts')
    versionEthers.default = versionEthers.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(versionEthers.default, `file:///node_modules/@types/_version-ethers-lib/index.d.ts`)

    // @ts-ignore
    const utilEthers = await import('raw-loader!ethers/lib/utils.d.ts')
    utilEthers.default = utilEthers.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(utilEthers.default, `file:///node_modules/@types/utils-ethers-lib/index.d.ts`)

    // @ts-ignore
    const ethers = await import('raw-loader!ethers/lib/ethers.d.ts')
    ethers.default = ethers.default.replace(/.\/utils/g, 'utils-ethers-lib')
    ethers.default = ethers.default.replace(/.\/_version/g, '_version-ethers-lib')
    ethers.default = ethers.default.replace(/.\/ethers/g, 'ethers-lib')
    ethers.default = ethers.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(ethers.default, `file:///node_modules/@types/ethers-lib/index.d.ts`)

    // @ts-ignore
    const indexEthers = await import('raw-loader!ethers/lib/index.d.ts')
    indexEthers.default = indexEthers.default.replace(/.\/ethers/g, 'ethers-lib')
    indexEthers.default = indexEthers.default.replace(/@ethersproject\//g, '@ethersproject_')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexEthers.default, `file:///node_modules/@types/ethers/index.d.ts`)

    // Web3

    // @ts-ignore
    const indexWeb3 = await import('raw-loader!web3/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3.default, `file:///node_modules/@types/web3/index.d.ts`)

    // @ts-ignore
    const indexWeb3Bzz = await import('raw-loader!web3-bzz/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Bzz.default, `file:///node_modules/@types/web3-bzz/index.d.ts`)

    // @ts-ignore
    const indexWeb3Core = await import('raw-loader!web3-core/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Core.default, `file:///node_modules/@types/web3-core/index.d.ts`)

    // @ts-ignore
    const indexWeb3Eth = await import('raw-loader!web3-eth/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Eth.default, `file:///node_modules/@types/web3-eth/index.d.ts`)

    // @ts-ignore
    const indexWeb3Personal = await import('raw-loader!web3-eth-personal/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Personal.default, `file:///node_modules/@types/web3-eth-personal/index.d.ts`)

    // @ts-ignore
    const indexWeb3Contract = await import('raw-loader!web3-eth-contract/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Contract.default, `file:///node_modules/@types/web3-eth-contract/index.d.ts`)

    // @ts-ignore
    const indexWeb3Net = await import('raw-loader!web3-net/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Net.default, `file:///node_modules/@types/web3-net/index.d.ts`)

    // @ts-ignore
    const indexWeb3Shh = await import('raw-loader!web3-shh/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Shh.default, `file:///node_modules/@types/web3-shh/index.d.ts`)

    // @ts-ignore
    const indexWeb3Util = await import('raw-loader!web3-utils/types/index.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexWeb3Util.default, `file:///node_modules/@types/web3-utils/index.d.ts`)
    // remix
    const indexRemixApi = remixTypes + `\n
    declare global {
        const remix: PluginClient;
        const web3Provider;
    }
    `
    monaco.languages.typescript.typescriptDefaults.addExtraLib(indexRemixApi)
    console.log('loaded monaco types')
}