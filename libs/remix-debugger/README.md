# `remix-debugger`
# (Remix debugger has been deprecated and is not maintained anymore - the `remix-debug` module can be used to build your own debugger)
 
The Remix Debugger is a webapp to debug the Ethereum VM and transactions.

+ [Installation](#installation)
+ [Development](#development)
+ [First steps](#firststeps)
+ [Tests](#tests)

## Installation

Make sure Node is [installed on your setup](https://docs.npmjs.com/getting-started/installing-node), and that a [local `geth`/`eth` node is running](../README.md#how-to-use).

```bash
git clone https://github.com/ethereum/remix
cd remix/remix-debugger
npm install
```

This will build the debugger. Start it by opening `index.html` in your browser.

## Development

Run `npm run start_dev` to start a local webserver, accessible at `http://127.0.0.1:8080`. Your browser will reload when files are updated.

## <a name="firststeps"></a>First steps

Once Remix is connected to a node, you will be able to debug transactions.

You can do that:
 - using a block number and a transaction index.
 - using a transaction hash.

After loading the transaction succeeded, the hash, from and to field will show up. The VM trace is then loaded.

The debugger itself contains several controls that allow stepping over the trace and seing the current state of a selected step:

#### Slider and Stepping action

The slider allows to move quickly from a state to another.

Stepping actions are:
- Step Into Back
- Step Over Back
- Step Over Forward
- Step Into Forward
- Jump Next Call: this will select the next state that refers to a context changes - CALL, CALLCODE, DELEGATECALL, CREATE.

#### State Viewer

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

## Tests

* To run unit tests, run `npm test`.

* For local headless browser tests:
  * To install `selenium`: `npm run selenium-install`
  * Every time you want to run local browser tests, run: `npm run test-browser`
