pragma solidity ^0.4.7;
import "./simple_string.sol";

contract StringTest {
  SimpleString foo;

  function beforeAll() {
    foo = new SimpleString();
  }

  function initialValueShouldBeHello() public view returns (bool) {
    return Assert.equal(foo.get(), "Hello world!", "initial value is not correct");
  }

  function valueShouldNotBeHelloWorld() public viewview returns (bool) {
    return Assert.notEqual(foo.get(), "Hello wordl!", "initial value is not correct");
  }

  function valueShouldBeHelloWorld() public view returns (bool) {
    return Assert.equal(foo.get(), "Hello wordl!", "initial value is not correct");
  }
}
