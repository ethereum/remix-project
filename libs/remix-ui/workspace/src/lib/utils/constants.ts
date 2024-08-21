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

