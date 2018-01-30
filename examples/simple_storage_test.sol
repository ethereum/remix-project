pragma solidity ^0.4.7;
import "./tests.sol";
import "./simple_storage.sol";

contract MyTest {
  SimpleStorage foo;

  function beforeAll() {
    foo = new SimpleStorage();
  }

  function initialValueShouldBe100() public constant returns (bool) {
    return Assert.equal(foo.get(), 100, "initial value is not correct");
  }

  function initialValueShouldBe200() public constant returns (bool) {
    return Assert.equal(foo.get(), 200, "initial value is not correct");
  }

}

