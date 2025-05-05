# EIP 7702

This project present one of the update shipped on the Pectra hardfork which occured in May 2025.

### Basics

Originally it exists 2 differents of accounts:
- Externally Owned Account (EOA): it requires a private key and can initiate transactions.
- Smart Contract Account. It represents code deployed in the blockchain.

These two concepts are separated: e.g until now EOAs doesn't have code associated to them.
This update allows an EOA to host code and to directly run code.

For more information please see [this page](https://eip7702.io)

### How to

This section explains how to run this project. We are going to assign a piece of code to an EOA:

- Open and Comple the file `EmptyAccount.sol`.
- From the `Run and Deploy` module switch the `Remix VM (pectra)` provider.
- Deploy the contract above (this will be deployed to the in-browser blockchain)
- Copy the address of the contract to the clipboard.
- Click on `Delegation Authorization`
- In the Modal dialog, paste the contract address and validate.
- Check in the terminal that the operation is successful.
- Take a look at the list of deployed contracts, you will see a new instance that call the current account. This account now also execute code!

## What's next

This project also contains the file `Simple7702Account.sol`,
this import a standard implementation of an 7702 account.
You can compile this contract and [open the implementation file](https://github.com/eth-infinitism/account-abstraction/blob/v0.8.0/contracts/accounts/Simple7702Account.sol), you will see how is practically used this feature. Specifically with the function `execute` and `executeBatch`



