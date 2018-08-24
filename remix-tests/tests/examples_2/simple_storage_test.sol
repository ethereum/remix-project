pragma solidity ^0.4.7;
import "./simple_storage.sol";

contract MyTest {
  SimpleStorage foo;
  uint i = 0;

  function beforeEach() {
    foo = new SimpleStorage();
    if (i == 1) {
      foo.set(200);
    }
    i += 1;
  }

  function initialValueShouldBe100() public constant returns (bool) {
    //return Assert.equal(foo.get(), 100, "initial value is not correct");
    return foo.get() == 100;
  }

  function initialValueShouldBe200() public constant returns (bool) {
    //return Assert.equal(foo.get(), 200, "initial value is not correct");
    return foo.get() == 200;
  }

}
