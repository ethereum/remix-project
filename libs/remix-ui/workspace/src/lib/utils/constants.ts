import { TemplateType } from '../types'
export const ROOT_PATH = '/'

export const TEMPLATE_NAMES = {
  'remixDefault': 'Basic',
  'blank': 'Blank',
  'ozerc20': 'OpenZeppelin ERC20',
  'ozerc721': 'OpenZeppelin ERC721',
  'ozerc1155': 'OpenZeppelin ERC1155',
  'zeroxErc20': '0xProject ERC20',
  'gnosisSafeMultisig': 'Gnosis Safe',
  'playground': 'Playground',
  'semaphore': 'Semaphore',
  'hashchecker': 'Hash Checker',
  'rln': 'Rate-Limiting Nullifier',
  'breakthroughLabsUniswapv4Hooks': 'Breakthrough-Labs Uniswapv4Hooks',
  'uniswapV4Template': 'Uniswap v4 Template',
  'uniswapV4HookBookMultiSigSwapHook': 'Uniswap V4 HookBook MultiSigSwapHook',
}

export const TEMPLATE_METADATA: Record<string, TemplateType> = {
  'breakthroughLabsUniswapv4Hooks': {
    type: 'git',
    url: 'https://github.com/Breakthrough-Labs/Uniswapv4Hooks',
    branch: 'foundry_pure'
  },
  'uniswapV4Template': {
    type: 'git',
    url: 'https://github.com/Breakthrough-Labs/v4-template',
    branch: 'main'
  },
  'uniswapV4HookBookMultiSigSwapHook': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openPattern',
    params: ['Uniswap-V4-HookBook-MultiSigSwapHook', true]
  },
  'token-sale': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['token-sale']
  },
  'simple-nft-sale': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['simple-nft-sale']
  },
  'Azuki-ERC721A-NFT-Sale-basic': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['Azuki-ERC721A-NFT-Sale-basic']
  },
  'Azuki-ERC721A-ERC721A': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['Azuki-ERC721A-ERC721A']
  },
  'token-staking-with-infinite-rewards': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['token-staking-with-infinite-rewards']
  },
  'nft-staking-with-infinite-rewards': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['nft-staking-with-infinite-rewards']
  },
  'basic-dao': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['basic-dao']
  },
  'soulbound-nft': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['soulbound-nft']
  },
  'multi-collection-nft-with-burnable-nfts-and-pausable-transfers': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['multi-collection-nft-with-burnable-nfts-and-pausable-transfers']
  },
  'OpenSea-Seaport': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['OpenSea-Seaport']
  },
  'Ethereum-Name-Service': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Ethereum-Name-Service']
  },
  'Umbra-Cash': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Umbra-Cash']
  },
  'Aave-V3': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Aave-V3']
  },
  'ChainLink': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['ChainLink']
  }
}

export type TemplateOption = {
  mintable?: boolean
  burnable?: boolean
  pausable?: boolean
  upgradeable?: 'uups' | 'transparent'
}

export type Template = {
  value: string
  displayName: string
  opts?: TemplateOption
}

export type TemplateGroup = {
  name: string
  items: Array<Template>
}

