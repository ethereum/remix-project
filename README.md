# Remix

[![Join the chat at https://gitter.im/ethereum/remix](https://badges.gitter.im/ethereum/remix.svg)](https://gitter.im/ethereum/remix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI](https://circleci.com/gh/ethereum/remix/tree/master.svg?style=svg)](https://circleci.com/gh/ethereum/remix/tree/master)
[![Documentation Status](https://readthedocs.org/projects/docs/badge/?version=latest)](https://remix-ide.readthedocs.io/en/latest/index.html)


**Remix** is a suite of tools that helps smart contract development, compilation, testing & deployment. These tools also works as a core of native plugins of Remix IDE.

**Remix IDE** is an IDE for Solidity dApp developers, powered by Remix. The Remix IDE repository is available **[here](https://github.com/ethereum/remix-ide)**, and an online version is available at https://remix.ethereum.org.

For more, check out the [Remix IDE documentation](https://remix-ide.readthedocs.io/en/latest/index.html).

## Remix Modules

Remix is built out of several different modules. Here is the brief description.

+ [`remix-analyzer`](remix-analyzer/README.md): Perform static analysis on Solidity smart contracts to check security vulnerabilities and bad development practices
+ [`remix-astwalker`](remix-tests/README.md): Parse solidity AST (Abstract Syntax Tree)
+ [`remix-debug`](remix-debug/README.md): Debug Ethereum transactions. It provides several controls that allow stepping over the trace and seeing the current state of a selected step.
+ [`remix-solidity`](remix-solidity/README.md): Load a Solidity compiler from provided URL and compile the contract using loaded compiler and return the compilation details
+ [`remix-lib`](remix-lib/README.md): Common place for libraries being used across multiple modules
+ [`remix-tests`](remix-tests/README.md): Unit test Solidity smart contracts. It works as a plugin & as CLI both
+ [`remix-url-resolver`](remix-url-resolver/README.md): Provide helpers for resolving the content from external URL ( including github, swarm, ipfs etc.).
+ [`remixd`](https://github.com/ethereum/remixd/tree/master): Allow accessing local filesystem from Remix IDE by running a daemon

Each module generally has their own npm package and test suite, as well as basic documentation in their respective `README`s. Usage of modules as plugin is well documented **[here](https://remix-ide.readthedocs.io/en/latest/index.html)**.

## Contributing

Everyone is very welcome to contribute on the codebase of Remix. Please reach us in [Gitter](https://gitter.im/ethereum/remix) in case of any query/feedback/suggestion.

For more information on the contributing procedure, see [CONTRIBUTING.md](CONTRIBUTING.md).


