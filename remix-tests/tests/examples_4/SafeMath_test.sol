pragma solidity ^0.4.24;
import "./remix_tests.sol";
import "./SafeMath.sol";
import "./SafeMathProxy.sol";

contract SafeMathTest {
  SafeMathProxy safemathproxy;

  function beforeAll() {
    safemathproxy = new SafeMathProxy();
  }

  function unsafeMultiplicationShouldOverflow() public constant returns (bool) {
    uint256 a = 4;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(
      a * b,
      2 ** 256 - 4,
      "unsafe multiplication did not overflow"
    );
  }

  function safeMultiplicationShouldRevert() public constant returns (bool) {
    uint256 a = 4;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(
      address(safemathproxy).call.gas(40000).value(0)("mulProxy",[a, b]),
      false,
      "safe multiplication did not revert"
    );
  }

  function safeDivisionByZeroShouldRevert() public constant returns (bool) {
    uint256 a = 4;
    uint256 b = 0;
    return Assert.equal(
      address(safemathproxy).call.gas(40000).value(0)("divProxy", [a, b]),
      false,
      "safe division did not revert"
    );
  }

  function unsafeSubtractShouldUnderflow() public constant returns (bool) {
    uint256 a = 0;
    uint256 b = a - 1;
    return Assert.equal(
      b,
      2 ** 256 - 1,
      "unsafe subtraction did not underflow"
    );
  }

  function safeSubtractShouldRevert() public constant returns (bool) {
    return Assert.equal(
      address(safemathproxy).call.gas(40000).value(0)("subProxy", [0, 1]),
      false,
      "safe subtract should revert"
    );
  }

  function unsafeAdditionShouldOverflow() public constant returns (bool) {
    uint256 a = 1;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(a + b, 0, "unsafe addition did not overflow");
  }

  function safeAdditionShouldRevert() public constant returns (bool) {
    uint256 a = 1;
    uint256 b = 2 ** 256 - 1;
    return Assert.equal(
      address(safemathproxy).call.gas(40000).value(0)("addProxy", [a, b]),
      false,
      "safe addition should revert"
    );
  }

  function safeModulusShouldRevert() public constant returns (bool) {
    uint256 a = 1;
    uint256 b = 0;
    return Assert.equal(
      address(safemathproxy).call.gas(40000).value(0)("modProxy", [a, b]),
      false,
      "safe modulus did not revert"
    );
  }
}
