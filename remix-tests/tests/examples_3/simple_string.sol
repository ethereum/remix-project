pragma solidity ^0.4.7;
contract SimpleString {
  string public storedData;

  constructor() public {
    storedData = "Hello world!";
  }

  function get() public view returns (string retVal) {
    return storedData;
  }
}
