Solidity Static Analysis
========================

Static code analysis is a process to debug the code by examining it and without actually executing the code. 

`Solidity Static Analysis` plugin performs static analysis on Solidity smart contracts once they are compiled. It helps to check security vulnerabilities and bad development practices. This plugin comes with `Solidity` environment of Remix IDE. It can also be activated individually from `Plugin Manager`.

How to use
------------

If you select this plugin, you will see a number of modules listed along with checkboxes, one `Auto run` checkbox and a `Run` button.

![](images/a-static-analysis.png)

By default, all modules are selected for analysis and a new analysis is performed at each compilation.

One can select/deselect the modules under which contract should be analyzed and can run the analysis again for last compiled contract by clicking on `Run`.

If you don't want to run analysis each time you compile a contract, just uncheck the checkbox near to `Auto run`.

Analysis Modules
-----------------
Currently, with Remix IDE v0.10.1, there are 21 analysis modules listed under 4 categories. Categories are: `Security`, `Gas & Economy`, `ERC` & `Miscellaneous`.

Here is the list of modules under each category along with the example code which should be avoided or used carefully while development:

### Category: Security
-   **Transaction origin: 'tx.origin' is used**

`tx.origin` is useful only in very exceptional cases. If you use it for authentication, you usually want to replace it by "msg.sender", because otherwise any contract you call can act on your behalf.

_Example:_
```
require(tx.origin == owner);
```

-   **Check effects: Potential reentrancy bugs**

Potential Violation of Checks-Effects-Interaction pattern can lead to re-entrancy vulnerability.

_Example:_
```
// sending ether first
msg.sender.transfer(amount);

// updating state afterwards
balances[msg.sender] -= amount;
```

-   **Inline assembly: Inline assembly used**

Use of inline assembly is advised only in rare cases.

_Example:_
```
assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(_addr)
}
```
-   **Block timestamp: Semantics maybe unclear**

`now` does not mean current time. `now` is an alias for `block.timestamp`. `block.timestamp` can be influenced by miners to a certain degree, be careful.

_Example:_
```
// using now for date comparison
if(startDate > now)
    isStarted = true;

// using block.timestamp
uint c = block.timestamp;
```
-   **Low level calls: Semantics maybe unclear**

Use of low level `call`, `callcode` or `delegatecall` should be avoided whenever possible. `send` does not throw an exception when not successful, make sure you deal with the failure case accordingly. Use `transfer` whenever failure of the ether transfer should rollback the whole transaction.

_Example:_
```
x.call('something');
x.send(1 wei);
```
-   **Blockhash usage: Semantics maybe unclear**

`blockhash` is used to access the last 256 block hashes. A miner computes the block hash by "summing up" the information in the current block mined. By summing up the information in a clever way a miner can try to influence the outcome of a transaction in the current block.

_Example:_
```
bytes32 b = blockhash(100);
```
-   **Selfdestruct: Beware of caller contracts**

`selfdestruct` can block calling contracts unexpectedly. Be especially careful if this contract is planned to be used by other contracts (i.e. library contracts, interactions). Selfdestruction of the callee contract can leave callers in an inoperable state.

_Example:_
```
selfdestruct(address(0x123abc..));
```

### Category: Gas & Economy
-   Gas costs: Warns if the gas requirements of the functions
    are too high
-   This on local calls: Invocation of local functions via
    this

### Category: ERC

### Category: Miscellaneous
-   Constant functions: Checks for potentially constant
    functions
-   Similar variable names: Checks if variable names are too
    similar
