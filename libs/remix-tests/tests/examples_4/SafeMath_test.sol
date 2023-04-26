pragma solidity >=0.4.22 <0.8.0;
import "remix_tests.sol";
import "./SafeMath.sol";
import "./SafeMathProxy.sol";

contract SafeMathTest {
  SafeMathProxy safemathproxy;

  function beforeAll() public {
    safemathproxy = new SafeMathProxy();
  }

  function unsafeMultiplicationShouldOverflow() public returns (bool) {
    uint256 a = 4;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(
      a * b,
      2 ** 256 - 4,
      "unsafe multiplication did not overflow"
    );
  }

  function safeMultiplicationShouldRevert() public returns (bool) {
    uint256 a = 4;
    uint256 b = 2 ** 256 - 1;
    (bool success, bytes memory data) = address(safemathproxy).call{gas:40000, value:0}(abi.encode("mulProxy, [a, b]"));
    return Assert.equal(
      success,
      false,
      "safe multiplication did not revert"
    );
  }

  function safeDivisionByZeroShouldRevert() public returns (bool) {
    uint256 a = 4;
    uint256 b = 0;
    (bool success, bytes memory data) = address(safemathproxy).call{gas:40000, value:0}(abi.encode("divProxy, [a, b]"));
    return Assert.equal(
      success,
      false,
      "safe division did not revert"
    );
  }

  function unsafeSubtractShouldUnderflow() public returns (bool) {
    uint256 a = 0;
    uint256 b = a - 1;
    return Assert.equal(
      b,
      2 ** 256 - 1,
      "unsafe subtraction did not underflow"
    );
  }

  function safeSubtractShouldRevert() public returns (bool) {
    (bool success, bytes memory data) = address(safemathproxy).call{gas:40000, value:0}(abi.encode("subProxy, [0, 1]"));
    return Assert.equal(
      success,
      false,
      "safe subtract should revert"
    );
  }

  function safeSubtractShouldRevertUsingTryCatch() public returns (bool) {
    try safemathproxy.subProxy(0, 1) returns ( uint256 res) {
        Assert.ok(false, "Should revert");
    } catch (bytes memory /*lowLevelData*/) { 
        Assert.ok(true, "safe subtract should revert");         
    }  
  }

  function safeSubtractShouldNotRevert() public returns (bool) {
    try safemathproxy.subProxy(3, 2) returns ( uint256 res) {
        Assert.equal(res, 1, "should be equal to 1");
    } catch (bytes memory /*lowLevelData*/) { 
        Assert.ok(false, "safe subtract should not revert");
    }  
  } 

  function unsafeAdditionShouldOverflow() public returns (bool) {
    uint256 a = 1;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(a + b, 0, "unsafe addition did not overflow");
  }

  function safeAdditionShouldRevert() public returns (bool) {
    uint256 a = 1;
    uint256 b = 2 ** 256 - 1;
    (bool success, bytes memory data) = address(safemathproxy).call{gas:40000, value:0}(abi.encode("addProxy, [a, b]"));
    return Assert.equal(
      success,
      false,
      "safe addition should revert"
    );
  }

  function safeModulusShouldRevert() public returns (bool) {
    uint256 a = 1;
    uint256 b = 0;
    (bool success, bytes memory data) = address(safemathproxy).call{gas:40000, value:0}(abi.encode("modProxy, [a, b]"));
    return Assert.equal(
      success,
      false,
      "safe modulus did not revert"
    );
  }
}
