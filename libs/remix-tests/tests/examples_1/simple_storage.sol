pragma solidity >= 0.5.0 < 0.8.0;
contract SimpleStorage {
  uint public storedData;

  event Stored(uint256 value);

  constructor() public {
    storedData = 100;
  }

  function set(uint x) public {
    storedData = x;
    emit Stored(x);
    emit Stored(x+10); // for testing multiple events only
  }

  function get() public view returns (uint retVal) {
    return storedData;
  }

}
