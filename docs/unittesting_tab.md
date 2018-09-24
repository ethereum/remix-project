Unit Testing
============

The unit testing tab allows to run unit testing.

![image](images/remix_unittest.png)

Generate test File
------------------

This create a new solidity file in the current folder suffixed with `_test`.
This file contains the minimun you need for running unit testing.

Run Tests
---------

This execute tests. The execution is run in a separate environment and the result is displayed below.

| Available functions  | Supported types |
| ------------- | ------------- |
| `Assert.ok()`  | `bool`  |
| `Assert.equal()`  | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.notEqual()` | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.greaterThan()` | `uint`, `int` |
| `Assert.lesserThan()` | `uint`, `int` |

Continuous integration
----------------------

remix-tests is also a CLI, it can be used in a continuous integration environement which support node.js.
Please find more information in the [remix-test repository](https://github.com/ethereum/remix/tree/master/remix-tests)
