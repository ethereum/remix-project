pragma solidity >= 0.5.0 < 0.8.0;
import "./../contract/simple_storage.sol";

contract StorageResolveTest {
  SimpleStorage foo;

  function beforeAll() public {
    foo = new SimpleStorage();
  }

  function initialValueShouldBe100() public returns (bool) {
    return Assert.equal(foo.get(), 100, "initial value is not correct");
  }
  
  //Test imported contract functions
  function checkIfEven() public returns (bool) {
    return Assert.equal(foo.check(10), 'EVEN', "value is odd");
  }

  function checkIfOdd() public returns (bool) {
    return Assert.equal(foo.check(11), 'ODD', "value is even");
  }

}
