Unit Testing
============

Click the
![double check](images/a-user-testing-icon.png)
 icon to get to the "Solidity Unit Testing" plugin. If you don't see this icon, go to the plugin manager (by click the ![plug](images/a-plug.png) icon) and load up the unit testing plugin.

![](images/a-unit-testing-from-pm.png)

![](images/a-unit-testing-feature.png)

Generating Test File
------------------
Click the button "Generate test file" to create a new solidity file in the current folder.
This create a new solidity file suffixed with `_test`.
This file contains the minimum you need for running unit testing.

Running Tests
------------------

Click the button "Run tests" to executes all tests whose box has been checked below (by default all). The execution is run in a separate environment and the result is displayed below.

![](images/a-unit-testing-run-result.png)

Here is a list of functions and their supported types that you can use to write your testcases:

```eval_rst
+ -----------------------+--------------------------------------------------------+
| Available functions    | Supported types                                        |
+========================+========================================================+
| `Assert.ok()`          | `bool`                                                 |
+------------------------+--------------------------------------------------------+
| `Assert.equal()`       | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
+------------------------+--------------------------------------------------------+
| `Assert.notEqual()`    | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
+------------------------+--------------------------------------------------------+
| `Assert.greaterThan()` | `uint`, `int`                                          |
+------------------------+--------------------------------------------------------+
| `Assert.lesserThan()`  | `uint`, `int`                                          |
+------------------------+--------------------------------------------------------+
```

Click [here](https://github.com/ethereum/remix/blob/master/remix-tests/tests/examples_4/SafeMath_test.sol) for a test file example

Continuous integration
----------------------

remix-tests is also a CLI, it can be used in a continuous integration environement which support node.js.
Please find more information in the [remix-test repository](https://github.com/ethereum/remix/tree/master/remix-tests)

See also: example [Su Squares contract](https://github.com/su-squares/ethereum-contract/tree/e542f37d4f8f6c7b07d90a6554424268384a4186) and [Travis build](https://travis-ci.org/su-squares/ethereum-contract/builds/446186067) that uses remix-tests for continuous integration testing.
