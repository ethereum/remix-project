# EIP 7702

This Workspace Template present one of the updates shipped with the Pectra upgrade which occurred in May 2025.

### Basics

In the Ethereum blockchain there are two different types of accounts:
- Externally Owned Account (EOA): which require a private key and could initiate transactions.
- Smart Contract Account: which represents code deployed in the blockchain.

These two concepts are separated: e.g until now EOAs doesn't have code associated to them.
But with the Pectra upgrade, EOA can now host code and can directly run code.

For more information please see [this page](https://eip7702.io)

### How to

This section explains how to run this project. We are going to assign a piece of code to an EOA:

    -   Verify solidity version 0.8.28 is selected.
    -   Compile MyToken.sol, Example7702.sol, Spender.sol.
    -   Deploy Example7702.sol.
    -   Use delegation on the contract above.
    -   Run the script `run-eip7702.ts`.   
    -   Copy the logged input data.
    -   Find the `executeBatch`, copy the data and run the transaction.
    -   Check that balance of the first and second account has been updated.



