## Remix-Tests
`remix-tests` is a tool to test Solidity smart contracts. It works underneath Remix IDE plugin "Solidity Unit Testing" which is used to write and run test cases for a contract. Tests are written in Solidity itself. `remix-tests` can be used as CLI and a library too.

### Installation
As a dependency inside file:

`npm install --save remix-tests`

As a dev dependency:

`npm install --save-dev remix-tests`

As a global NPM module to use as CLI:

`npm -g install remix-tests`

### Test structure
remix-tests provides and injects a built-in assert library for testing purpose.

#### Assert library

| Available functions  | Supported types |
| ------------- | ------------- |
| `Assert.ok()`  | `bool`  |
| `Assert.equal()`  | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.notEqual()` | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.greaterThan()` | `uint`, `int` |
| `Assert.lesserThan()` | `uint`, `int` |

#### Available special functions:
Apart from above, library provides some special functions as:

* `beforeEach()` - runs before each test
* `beforeAll()` - runs before all tests
* `afterEach()` - runs after each test
* `afterAll()` - runs after all tests


#### Use a different sender `msg.sender`

It is quite common that a contract need to be tested in different situation.
Especially being able to set before hand the sender account (`msg.sender`) used for a specific tests suite enable quite a lot a new test use cases.
please checkout this [test contract](https://github.com/ethereum/remix/blob/master/remix-tests/tests/various_sender/sender_test.sol) for an example.
Note that `TestsAccounts` is filled with all the accounts available in `web3.eth.accounts()`.

### How to use

#### Command Line

* To run all files inside `examples` directory
```
$ remix-tests examples/
``` 
* To run single test file named `simple_storage_test.sol` inside `examples` directory
```
$ remix-tests examples/simple_storage_test.sol
```
**NOTE:** remix-tests will assume that name of tests file ends with `"_test.sol"`. e.g `simple_storage_test.sol`


**Example:**
Consider for a simple storage contract named `simple_storage.sol`:

```Javascript
pragma solidity >=0.4.22 <0.7.0;

contract SimpleStorage {
  uint public storedData;

  constructor() public {
    storedData = 100;
  }

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint retVal) {
    return storedData;
  }
}
```

test file `simple_storage_test.sol` can be as:


```Javascript
pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol"; // injected by remix-tests
import "./simple_storage.sol";

contract MyTest {
  SimpleStorage foo;

  function beforeEach() public {
    foo = new SimpleStorage();
  }

  function initialValueShouldBe100() public returns (bool) {
    return Assert.equal(foo.get(), 100, "initial value is not correct");
  }

  function valueIsSet200() public returns (bool) {
    foo.set(200);
    return Assert.equal(foo.get(), 200, "value is not 200");
  }

  function valueIsNotSet200() public returns (bool) {
    return Assert.notEqual(foo.get(), 200, "value is 200");
  }
}
```

Running `simple_storage_test.sol` file will output as:

```
	◼  MyTest
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
	✓  Initial value should be100
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
	✓  Value is set200
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
[19:15:02] payload method is  eth_gasPrice
[19:15:02] payload method is  eth_sendTransaction
[19:15:02] payload method is  eth_getTransactionReceipt
	✓  Value is not set200
```

:point_right: remix-test can also be used for continuous integration testing. See example [Su Squares contract](https://github.com/su-squares/ethereum-contract/tree/e542f37d4f8f6c7b07d90a6554424268384a4186) and [Travis build](https://travis-ci.org/su-squares/ethereum-contract/builds/446186067) 

///// TODO

#### Library

Importing the library:
```Javascript
const RemixTests = require('remix-tests');
```

Running a single test object:
```Javascript
remixTests.runTest(testName, testObj, testCallback, resultsCallback)
```
**Params:**
* `testName` - `string` name of the test
* `testObj` -  web3.js 1.0 contract instance of the test
* `testCallback(object)` -  called each time there is a test event. 3 possible type of objects:
* `{ type: 'contract', value: '<TestName>', filename: '<test_filename.sol>' }`
* `{ type: 'testPass', value: '<name of testing function>', time: <time taken>, context: '<TestName>'}`
* `{ type: 'testFailure', value: '<name of testing function>', time: <time taken>, context: '<TestName>', errMsg: '<message in the Assert>' }`

`resultsCallback(object)`
* `passingNum` - number of passing tests
* `failureNum` - number of failing tests
* `timePassed` - time it took for all the tests to run (in seconds)


Running a set of tests given the sourcecode:
```Javascript
remixTests.runTestSources(contractSources, testCallback, resultCallback, finalCallback, importFileCb);
```
params:
`contractSources` - `object` -> `filename => { content: source }`
`testCallback(object)` - called each time there is a test event. 3 possible type of objects:
* `{ type: 'contract', value: '<TestName>', filename: '<test_filename.sol>' }`
* `{ type: 'testPass', value: '<name of testing function>', time: <time taken>, context: '<TestName>'}`
* `{ type: 'testFailure', value: '<name of testing function>', time: <time taken>, context: '<TestName>', errMsg: '<message in the Assert>' }`

`resultCallback(err, object)`
* `passingNum` - number of passing tests
* `failureNum` - number of failing tests
* `timePassed` - time it took for all the tests to run (in seconds)

`finalCallback(err)` - called when all tests finish running.
`importCb(url, cb)`

## Contribute

Please feel free! Open an issue or a pull request. Please conform to [`standard`](https://standardjs.com/) for code styles, and make sure that you add any relevant tests.

## License

[MIT](LICENSE.md) © 2018 Remix Team
