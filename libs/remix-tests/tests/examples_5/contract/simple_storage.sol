pragma solidity >= 0.5.0 < 0.8.0;

import "../../examples_4/SafeMath.sol";
import "../lib/EvenOdd.sol";

contract SimpleStorage is EvenOdd{
  using SafeMath for uint256;
  uint public storedData;

  constructor() public {
    storedData = 100;
  }

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint retVal) {
    return storedData;
  }

}
