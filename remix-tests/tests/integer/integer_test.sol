pragma solidity ^0.4.24;

contract IntegerTest {
  function _2_shouldBeGreaterThan_1() public constant returns (bool) {
    return Assert.greaterThan(uint(2), uint(1), "2 is not greater than 1");
  }

  function _2_shouldBeGreaterThan_neg_1() public constant returns (bool) {
    return Assert.greaterThan(uint(2), int(-1), "2 is not greater than -1");
  }

  function _neg_1_shouldNotBeGreaterThan_2() public constant returns (bool) {
    return Assert.greaterThan(int(-1), uint(2), "-1 is not greater than 2");
  }
}
