import { TemplateType } from './types'
export const ROOT_PATH = '/'
export const solTestYml = `
name: Running Solidity Unit Tests
on: [push]

jobs:
  run_sol_contracts_job:
    runs-on: ubuntu-latest
    name: A job to run solidity unit tests on github actions CI
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Environment Setup
      uses: actions/setup-node@v3
      with:
        node-version: 20.0.0
    - name: Run SUT Action
      uses: EthereumRemix/sol-test@v1.1
      with:
        test-path: 'tests'
        compiler-version: '0.8.15'
//      evm-version: 'paris'
//      optimize: true
//      optimizer-runs: 200
//      node-url: 'https://mainnet.infura.io/v3/08b2a484451e4635a28b3d8234f24332'
//      block-number: 'latest'
//      hard-fork: 'merge'

`
export const tsSolTestYml = `
name: Running Mocha Chai Solidity Unit Tests
on: [push]

jobs:
  run_sample_test_job:
    runs-on: ubuntu-latest
    name: A job to run mocha and chai tests for solidity on github actions CI
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Environment Setup
      uses: actions/setup-node@v3
      with:
        node-version: 20.0.0
    - name: Run Mocha Chai Unit Test Action
      uses: EthereumRemix/ts-sol-test@v1.3.1
      with:
        test-path: 'tests'
        contract-path: 'contracts'
        compiler-version: '0.8.7'
//      evm-version: 'paris'
//      optimize: true
//      optimizer-runs: 200
//      node-url: 'https://mainnet.infura.io/v3/08b2a484451e4635a28b3d8234f24332'
//      block-number: 'latest'
//      hard-fork: 'merge'
`
export const slitherYml = `
name: Slither Analysis
on: [push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm install
    - uses: crytic/slither-action@v0.2.0
      with:
        target: 'contracts'
        slither-args: '--solc-remaps "@openzeppelin/contracts=./node_modules/@openzeppelin/contracts hardhat=./node_modules/hardhat"'
        fail-on: 'low'
        solc-version: '0.8.2'
`

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

