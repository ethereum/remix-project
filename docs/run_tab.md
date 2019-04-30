Running & Depolying transactions
================================

The Run tab is an important section of Remix. It allows you to send
transactions to the current environment.

![image](images/remix_runtab.png)

Run Setup
---------

The following settings allow you to directly influence the transaction
execution:

Environment:

-   `JavaScript VM`: All the transactions will be executed in
    a sandbox blockchain in the browser. This means nothing
    will be persisted and a page reload will restart a new
    blockchain from scratch, the old one will not be saved.

-   `Injected Provider`: Remix will connect to an injected
    web3 provider. `Mist` and `Metamask` are example of
    providers that inject web3, thus can be used with this
    option.

-   `Web3 Provider`: Remix will connect to a remote node. You
    will need to provide the URL address to the selected
    provider: geth, parity or any Ethereum client.

-   Account: the list of accounts associated with the current
     environment (and their associated balances).

-   Gas Limit: the maximum amount of gas that can be set for all the
     transactions created in Remix.

-   Value: the amount of value for the next created transaction (this
     value is always reset to 0 after each transaction execution).

 ![image](images/remix_runtab_example.png)

Initiate Instance
-----------------

This section contains the list of compiled contracts and 2 actions:

-   `At Address` assumes the given address is an instance of the
    selected contract. It is then possible to interact with an already
    deployed contract. There's no check at this point, so be careful
    when using this feature, and be sure you trust the contract at that
    address.

-   `Create` send a transaction that deploys the selected contract. When
    the transaction is mined, the newly created instance will be added
    (this might take several seconds). Note that if the `constructor`
    has parameters, you need to specify them.

Pending Instances
-----------------

Validating a transaction take several seconds. During this time, the GUI
shows it in a pending mode. When transaction is mined the number of
pending transactions is updated and the transaction is added to the log
(see ../terminal)

Using the ABI
------------

Using `Deploy` or `At Address` is a classic use case of Remix. It is
possible though to interact with a contract by using its ABI. The ABI is
a JSON array which describe its interface.

To interact with a contract using the ABI, create a new file in Remix
with extension `*.abi` and copy the ABI content to it. Then in the input
next to `At Address`, put the Address of the contract you want to
interact with. Click on `At Address`, a new "connection" with the
contract will popup below.

Using the Recorder
------------------

The Recorder allows to save a bunch of transactions in a JSON file and
rerun them later either in the same environment or in another.

Saving to JSON allows to easily check the transaction list, tweak input
parameters, change linked library, etc...

We can find many use cases for the recorder, for instance:
:   -   After having coded and tested contracts in a constrained
        environment (like the JavaScript VM), it could be interesting to
        redeploy them easily in a more persisted environment (like a
        Geth node) in order to check whether everything behaves normally
        in a classic environment.
    -   Deploying contract does often require more than creating one
        transaction.
    -   Working in a dev environment does often require to setup the
        state in a first place.

![image](images/remix_recorder.png)

Saving a record ends up with the creation of this type of content (see
below):

In that specific record, 3 transactions are executed:

The first corresponds to the deployment of the lib `testLib`.

The second corresponds to the deployment of the contract `test`, the
first parameter of the constructor is set to 11. That contract depends
on a library. The linkage is done using the property `linkReferences`.
In that case we use the addres of the previously created library :
`created{1512830014773}`. the number is the id (timestamp) of the
transaction that leads to the creation of the library.

The third parameter corresponds to the call to the function `set` of the
contract `test` (the property to is set to: `created{1512830015080}`) .
Input parameters are `1` and
`0xca35b7d915458ef540ade6068dfe2f44e8fa733c`

all these transactions are created using the value of the accounts
`account{0}`.

``` {.sourceCode .none}
{
"accounts": {
    "account{0}": "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
},
"linkReferences": {
    "testLib": "created{1512830014773}"
},
"transactions": [
    {
    "timestamp": 1512830014773,
    "record": {
        "value": "0",
        "parameters": [],
        "abi": "0xbc36789e7a1e281436464229828f817d6612f7b477d66591ff96a9e064bcc98a",
        "contractName": "testLib",
        "bytecode": "60606040523415600e57600080fd5b60968061001c6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636d4ce63c146044575b600080fd5b604a6060565b6040518082815260200191505060405180910390f35b6000610d809050905600a165627a7a7230582022d123b15248b8176151f8d45c2dc132063bcc9bb8d5cd652aea7efae362c8050029",
        "linkReferences": {},
        "type": "constructor",
        "from": "account{0}"
    }
    },
    {
    "timestamp": 1512830015080,
    "record": {
        "value": "100",
        "parameters": [
        11
        ],
        "abi": "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec",
        "contractName": "test",
        "bytecode": "60606040526040516020806102b183398101604052808051906020019091905050806000819055505061027a806100376000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632f30c6f61461006757806338cc48311461009e57806362738998146100f357806387cc10e11461011c575b600080fd5b61009c600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610145565b005b34156100a957600080fd5b6100b1610191565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100fe57600080fd5b6101066101bb565b6040518082815260200191505060405180910390f35b341561012757600080fd5b61012f6101c4565b6040518082815260200191505060405180910390f35b8160008190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008054905090565b600073__browser/ballot.sol:testLib____________636d4ce63c6000604051602001526040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040160206040518083038186803b151561022e57600080fd5b6102c65a03f4151561023f57600080fd5b505050604051805190509050905600a165627a7a72305820e0b2510bb2890a0334bfe5613d96db3e72442e63b514cdeaee8fc2c6bbd19d3a0029",
        "linkReferences": {
        "browser/ballot.sol": {
            "testLib": [
            {
                "length": 20,
                "start": 511
            }
            ]
        }
        },
        "name": "",
        "type": "constructor",
        "from": "account{0}"
    }
    },
    {
    "timestamp": 1512830034180,
    "record": {
        "value": "1000000000000000000",
        "parameters": [
        1,
        "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
        ],
        "to": "created{1512830015080}",
        "abi": "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec",
        "name": "set",
        "type": "function",
        "from": "account{0}"
    }
    }
],
"abis": {
    "0xbc36789e7a1e281436464229828f817d6612f7b477d66591ff96a9e064bcc98a": [
    {
        "constant": true,
        "inputs": [],
        "name": "get",
        "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
    ],
    "0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec": [
    {
        "constant": true,
        "inputs": [],
        "name": "getInt",
        "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getFromLib",
        "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getAddress",
        "outputs": [
        {
            "name": "",
            "type": "address"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
        {
            "name": "_t",
            "type": "uint256"
        },
        {
            "name": "_add",
            "type": "address"
        }
        ],
        "name": "set",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
        {
            "name": "_r",
            "type": "uint256"
        }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "constructor"
    }
    ]
}
}
```
