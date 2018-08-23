pragma solidity ^0.4.7;
contract SimpleStorage {
  uint public storedData;

  function SimpleStorage() public {
    storedData = 100;
  }

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint retVal) {
    return storedData;
  }

}
