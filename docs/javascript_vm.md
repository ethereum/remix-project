Using the JavaScript VM
========================

There are 3 type of environments Remix can be plugged to:
`Javascript VM`, `Injected provider`, or `Web3 provider`. (for details see [Running transactions](http://remix.readthedocs.io/en/latest/run_tab.html))

Both `Web3 provider` and `Injected provider` require the use of an
external tool.

The external tool for `Web3 provider` is an Ethereum node the tools for
`Injected provider` are Mist or Metamask.

The `JavaScript VM` mode is convenient because each execution runs in
your browser. Thus reloading the page will restart Remix with an empty
state.

So for performance purposes, it might also be better to use an external
node.

Selecting the VM mode
---------------------

Make sure the VM mode is selected. All accounts displayed in `Accounts`
should have 100 ether.

Sample contract
---------------

``` {.sourceCode .none}
pragma solidity ^0.4.16;

contract testContract {

    uint value;
    function testContract(uint _p) {
        value = _p;
    }

    function setP(uint _n) payable {
        value = _n;
    }

    function setNP(uint _n) {
        value = _n;
    }

    function get () constant returns (uint) {
        return value;
    }
}
```

This contract is very basic. The goal is to quickly start to create and
to interact with a sample contract.

Deploying an instance
---------------------

The `Compile tab` displays information related to the current contract
(note that there can be more than one) (see ../compile\_tab).

Moving on, in the `Run tab` select, `JavaScript VM` to specify that you
are going to deploy an instance of the contract in the `JavaScript VM`
state.

![image](images/remix_quickstart_javascriptvm_creation.png)

The constructor of `testContract` needs a parameter (of type `uint`).
Give any value and click on `Create`.

The transaction which deploys the instance of `testContract` is created.

In a "normal" blockchain, it can take several seconds to execute. This
is the time for the transaction to be mined. However, because we are
using the `JavaScript VM`, our execution is immediate.

The terminal will inform you about the transaction. You can see details
there and start debugging.

The newly created instance is displayed in the `run tab`.

![image](images/remix_quickstart_javascriptvm_creationTransaction.png)

Interacting with an instance
----------------------------

This new instance contains 3 actions which corresponds to the 3
functions (`setP`, `setPN`, `get`). Clicking on `SetP` or `SetPN` will
create a new transaction.

Note that `SetP` is `payable` (red action) : it is possible to send
value (Ether) to the contract.

`SetPN` is not payable (light red action) : it is not possible to send
value (Ether) to the contract.

Clicking on `get` will not execute a transaction (blue action). It is
not necessary to do so because `get` does not modify the state (variable
`value`) of this instance.

As `get` is `constant` you can see the return value just below the
action.

![image](images/remix_quickstart_javascriptvm_callinginstance.png)
