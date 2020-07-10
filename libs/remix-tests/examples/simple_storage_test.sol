pragma solidity ^0.5.0;
import "./simple_storage.sol";

contract MyTest {
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

  function initialValueShouldBe100() public {
    Assert.equal(foo.get(), 100, "initial value is not correct");
  }

  function initialValueShouldBe200() public {
    Assert.equal(foo.get(), 200, "initial value is not correct");
  }

}
