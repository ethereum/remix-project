pragma solidity ^0.4.7;
contract SimpleString {
  string public storedData;

  function SimpleString() public {
    storedData = "Hello";
  }

  function set(string x) public {
    storedData = x;
  }

  function get() public view returns (string retVal) {
    return storedData;
  }
}
