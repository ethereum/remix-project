pragma solidity >= 0.5.0 < 0.8.0;

contract IntegerTest {

  // GREATER THAN [>] tests
  function _2_shouldBeGreaterThan_1() public returns (bool) {
    return Assert.greaterThan(uint(2), uint(1), "2 is greater than 1");
  }

  function _0_shouldBeGreaterThan_neg_1() public returns (bool) {
    return Assert.greaterThan(uint(0), int(-1), "0 is greater than -1");
  }

  function _neg_1_shouldNotBeGreaterThan_1() public returns (bool) {
    return Assert.greaterThan(int(-1), uint(1), "-1 is not greater than 1");
  }

  function _1_shouldBeGreaterThan_neg_1() public returns (bool) {
    return Assert.greaterThan(uint(1), int(-1), "1 is greater than -1");
  }

  // LESSER THAN [<] tests
  function _1_shouldBeLesserThan_2() public returns (bool) {
    return Assert.lesserThan(uint(1), uint(2), "1 is lesser than 2");
  }

  function _neg_1_shouldBeLesserThan_0() public returns (bool) {
    return Assert.lesserThan(int(-1), uint(0), "-1 is lesser than 0");
  }

  function _neg_2_shouldBeLesserThan_neg_1() public returns (bool) {
    return Assert.lesserThan(int(-2), int(-1), "-2 is lesser than -1");
  }

  function _0_shouldNotBeLesserThan_neg_1() public returns (bool) {
    return Assert.lesserThan(uint(0), int(-1), "0 is not lesser than -1");
  }
}
