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
    - name: Run SUT Action
      uses: EthereumRemix/sol-test@v1
      with:
        test-path: 'tests'
        compiler-version: '0.8.15'
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
    - name: Run Mocha Chai Unit Test Action
      uses: EthereumRemix/ts-sol-test@v1.2
      with:
        test-path: 'tests'
        contract-path: 'contracts'
        compiler-version: '0.8.7'
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
