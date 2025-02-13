pragma solidity >= 0.5.0 < 0.9.0;
import "./simple_string.sol";

contract StringTest {
  SimpleString foo;

  function beforeAll() public {
    foo = new SimpleString();
  }

  function initialValueShouldBeHelloWorld() public returns (bool) {
    return Assert.equal(foo.get(), "Hello world!", "initial value is not correct");
  }

  function valueShouldNotBeHelloWorld() public returns (bool) {
    return Assert.notEqual(foo.get(), "Hello world!", "value should not be hello world");
  }
}
