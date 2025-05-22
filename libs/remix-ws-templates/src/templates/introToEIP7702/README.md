# EIP 7702

This Workspace template presents EIP-7701, one of the updates that shipped with the Pectra upgrade (May 2025).

### Basics

In the Ethereum blockchain there are two different types of accounts:
- Externally Owned Account (EOA): which require a private key and can initiate transactions
- Smart Contract Account: which represents code deployed on the blockchain

Until now EOAs could not have code associated with them.
But with the Pectra upgrade, EOAs can now host and can directly run code.

### Demo of a batched transaction

This demo will show an example of a batched (not botched) transaction. Before batching, sending a token required two transactions: one to allow the transfer and another to send the token.  With batching, these function calls can be done in a single transaction.

Assign a piece of code to an EOA:

- Compile `MyToken.sol`, `Example7702.sol`, and `Spender.sol` using Solidity version 0.8.28.
- In Deploy & Run's **CONTRACT** select box, choose **Simple7702Account** and deploy it to the Remix VM (Prague) network.
- Copy the deployed contract's address.
- Click the **Authorize Delegation** button and paste the contract's address into the modal.
- In Deploy and Run, check the new deployed contract. It has the same address as the EOA that was assigned to SIMPLE7702ACCOUNT.

Setting up the data for the batch:
- Run the script `run-eip7702.ts`.   
- In the terminal, copy the logged data from console.log(executeBatch).
- Back in Deploy & Run, find the DELEGATED SIMPLE7702ACCOUNT and open it up to see its functions.
- In the **executeBatch** function, paste the data and then run the transaction.

Executing the batched transaction:
- Go to the the deployed token's **balanceOf** function. 
- Input the first and then the second account to check that each address' token balance has been updated.
- The is possible because of the 7702 connection between the contract and the first EOA address.




