pragma solidity ^0.5.0;
import "./simple_storage.sol";

contract MyTest {
  SimpleStorage foo;
  uint i = 0;

  function beforeEach() public {
    foo = new SimpleStorage();
    if (i == 1) {
      foo.set(200);
    }
    i += 1;
  }

  function initialValueShouldBe100() public view returns (bool) {
    //return Assert.equal(foo.get(), 100, "initial value is not correct");
    return foo.get() == 100;
  }

  function initialValueShouldBe200() public view returns (bool) {
    //return Assert.equal(foo.get(), 200, "initial value is not correct");
    return foo.get() == 200;
  }

}
