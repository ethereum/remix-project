pragma solidity ^0.5.0;
import "remix_tests.sol";
import "./simple_storage.sol";

contract MyTest2 {
  SimpleStorage storage foo;
  uint storage i = 0;

  function beforeAll() public {
    foo = new SimpleStorage();
  }

  function beforeEach() public {
    if (i == 1) {
      foo.set(200);
    }
    i += 1;
  }

  function initialValueShouldBe100() public view returns (bool) {
    return Assert.equal(foo.get(), 100, "initial value is not correct");
  }

  function initialValueShouldBe200() public view returns (bool) {
    return Assert.equal(foo.get(), 200, "initial value is not correct");
  }

}
