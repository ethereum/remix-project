# EIP 7702

This Workspace template presents one of the updates that shipped with the Pectra upgrade - occuring in May 2025.

### Basics

In the Ethereum blockchain there are two different types of accounts:
- Externally Owned Account (EOA): which require a private key and could initiate transactions.
- Smart Contract Account: which represents code deployed in the blockchain.

These two concepts are separated. Until now EOAs could not have code associated to them.
But with the Pectra upgrade, EOAs can now host and directly run code.

For more information please see [this page](https://eip7702.io)

### Demo of a batched transaction

In this demo, we'll deploy a contract and assign it to an EOA. Then we'll run a script that will deploy a token and another contract. The script will also prepare the data to batch a transaction so that it will contain the approval for the transfer and as well as the transfer.

This section explains how to run this project. Let's first assign a piece of code to an EOA:

    -   Compile MyToken.sol, Example7702.sol, and Spender.sol using Solidity version 0.8.28.
    -   In Deploy & Run, in the CONTRACT select box, choose Simple7702Account and deploy it to the Remix VM (Prague) network.
    -   Copy the deployed contract's address.
    -   Click the Authorize Delegation button and paste the contract's address into the modal.
    -   In Deploy and Run, check the new "deployed". It has the same address as the EOA that was assigned to SIMPLE7702ACCOUNT.
    -   Run the script `run-eip7702.ts`.   
    -   In the terminal, copy the logged data from console.log(executeBatch)
    -   Back in Deploy & Run, find the DELEGATED SIMPLE7702ACCOUNT and open it up to see its functions.
    -   In the executeBatch function , paste the data and then run the transaction.
    -   Go to the the deployed token's balanceOf function. Input the first and then the second account to check that each address' balance has been updated.
    -   This is possible because of the 7702 connection between the contract and the first EOA address.



