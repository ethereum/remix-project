pragma solidity ^0.4.7;
import "./tests.sol";
import "./simple_string.sol";

contract MyTest {
  SimpleString foo;

  function beforeAll() {
    foo = new SimpleString();
  }

  function initialValueShouldBeHello() public constant returns (bool) {
    return Assert.equal(foo.get(), "Hello", "initial value is not correct");
  }
}
