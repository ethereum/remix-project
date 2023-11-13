<p align="center">
    <h1 align="center">
        Semaphore contracts
    </h1>
    <p align="center">Semaphore contracts to manage groups and broadcast anonymous signals.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/contracts">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/contracts?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/contracts">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/contracts.svg?style=flat-square" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

To learn more about contracts visit [semaphore.pse.dev](https://semaphore.pse.dev/docs/technical-reference/contracts).

---

## 🛠 Install

### npm or yarn

Install the `@semaphore-protocol/contracts` package with npm:

```bash
npm i @semaphore-protocol/contracts
```

or yarn:

```bash
yarn add @semaphore-protocol/contracts
```

## 📜 Usage

### Compile contracts

Compile the smart contracts with [Hardhat](https://hardhat.org/):

```bash
yarn compile
```

### Testing

Run [Mocha](https://mochajs.org/) to test the contracts:

```bash
yarn test
```

You can also generate a test coverage report:

```bash
yarn test:coverage
```

Or a test gas report:

```bash
yarn test:report-gas
```

### Deploy contracts

Deploy the `Semaphore.sol` contract without any parameter:

```bash
yarn deploy:semaphore
```

or deploy it by providing the addresses of the contracts/libraries on which it depends:

```bash
yarn deploy:semaphore --semaphoreVerifier <address>
```

> **Note**  
> Run `yarn deploy:semaphore --help` to see the complete list.

If you want to deploy your contract in a specific network you can set up the `DEFAULT_NETWORK` variable in your `.env` file with the name of one of our supported networks (hardhat, localhost, goerli, arbitrum). Or you can specify it as an option:

```bash
yarn deploy:semaphore --network goerli
yarn deploy:semaphore --network sepolia
yarn deploy:semaphore --network mumbai
yarn deploy:semaphore --network optimism-goerli
yarn deploy:semaphore --network arbitrum
```

If you want to deploy contracts on Goerli or Arbitrum, remember to provide a valid private key and an Infura API in your `.env` file.
