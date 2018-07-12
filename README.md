# REMIX

[![Join the chat at https://gitter.im/ethereum/remix](https://badges.gitter.im/ethereum/remix.svg)](https://gitter.im/ethereum/remix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Ethereum IDE and tools for the web

## REMIX WEBSITE:

Remix is avalaible at http://ethereum.github.io/remix. 
You can use it either inside Mist or by connecting to geth or eth.
Note that connecting to Geth does not work through https. 

You'll have to run your own node using the following parameters:

Using Geth:

    geth --rpc --rpcapi 'web3,eth,debug' --rpcport 8545 --rpccorsdomain '*'
    
Using Eth:

    eth -j --rpccorsdomain '*'

geth will run the rpc server on http://localhost:8545, remix uses by default this url.

Remix will use this instance of Geth to retrieve the transaction and the associated trace.
This instance should **only** be used for debugging purposes. Never use features that could have an impact on your keys (do not unlock any keys, do not use this instance together with the wallet, do not activate the admin web3 API).

## INSTALLATION:

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later

Install eth or geth, npm and node.js (see https://docs.npmjs.com/getting-started/installing-node), then do:

    git clone https://github.com/ethereum/remix
    cd remix
    npm install && npm run build && npm run start_node

open remix/index.html in your browser.

## REMIX First Step:

Once remix is connected to a node, you will be able to debug transactions.
There's two way of doing that:
 - using a block number and a transaction index.
 - using a transaction hash.

When loading the transaction succeed, the hash, from and to field will show up. 
Then the vm trace is loaded.

The debugger itself contains several controls that allow stepping over the trace and seeing the current state of a selected step.

#### Slider and Stepping action:

The slider allows to move quickly from a state to another.
Stepping actions are:
- Step Into Back
- Step Over Back
- Step Over Forward
- Step Into Forward
- Jump Next Call (this will select the next state that refers to a context changes - CALL, CALLCODE, DELEGATECALL, CREATE)

#### State Viewer:
 
The upper right panel contains basic informations about the current step:
- VMTraceStep: the index in the trace of the current step.
- Step
- Add memory
- Gas: gas used by this step
- Remaining gas: gas left
- Loaded address: the current code loaded, refers to the executing code.

The other 6 panels describe the current selected state:
 - Instructions list: list of all the instruction that defines the current executing code.
 - Stack
 - Storage Changes
 - Memory
 - Call Data$
 - Call Stack

## CODING STYLE:

Remix uses npm coding style: https://docs.npmjs.com/misc/coding-style
Please be sure your code is compliant with this coding standard before sending PR.
There's on the above page a bunch of links that propose integration with developer tools (Emacs, Atom, ...).
You can also run 'npm run test' to check your local repository against the coding style.
