# Hello World in the Remix IDE

This document outlines how to create a simple smart contract utilziing the online Remix IDE. Throughout this documnet you'll learn how to create a smart contract on the Ethereum blockchain that returns "Hello World" when called.

# Navigate to Remix

To get started, navigate to the online version of the Remix IDE by clicking [here](https://remix.ethereum.org/).

# Remix at First Glance

Below is a picture of what you should see when first tabbing into the Remix IDE.

![](https://i.imgur.com/FJfTYq5.png)

# New Contract

To create a new contract, select "Create File" under the artifacts directory and create a `.sol` file extension. For the purposes of this demo we will name our file `hellWorld.sol`

![](https://i.imgur.com/Qz63Ywi.png)

# The Code

Now it's time to code our smart contract. First we must identify what version of Solidity we are to use, navigate to the latest version of Solidity by click [here](https://github.com/ethereum/solidity/releases). For the purposes of this demo we will be using Solidity version `0.7.5`.

First, specify the version of Solidity the contract will use.

![](https://i.imgur.com/D4oQ1Kb.png)

Now follow the below example for the bulk of the code.

![](https://i.imgur.com/QFcHYuz.png)

# Time to Compile

Each smart contract must be correctly compiled before it can then be deployed to the blockchain. On the left-handside within the side-navigation bar select "Solidity Compiler" and click `Compile hellWorld.sol`.

![](https://i.imgur.com/483xoIp.png)

# Time to Deploy

Now that the smart contract has been compiled correctly, we can deploy it to the blockchain. On the left-handside within the side-navigation bar select "Deploy & run transactions" and click `Deploy`.

![](https://i.imgur.com/EEf8pmg.png)

# Contract Deployed

To ensure the smart contract was correctly deployed, while on the same tab as above view `Deployed Contracts` and your contract should be listed.

![](https://i.imgur.com/AqA97Ko.png)

# Output

Still utilizing the same tab as above, under `Deployed Contracts` select your deployed contract and click `helloWorld` this will call the `helloWorld` function within your `helloWorld.sol` smart contract.

To view the results select the dropdown provided after clicking `helloWorld`

![](https://i.imgur.com/0rQpmqY.png)

