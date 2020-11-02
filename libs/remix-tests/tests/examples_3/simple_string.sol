pragma solidity >= 0.5.0 < 0.8.0;
contract SimpleString {
  string public storedData;

  constructor() public {
    storedData = "Hello world!";
  }

  function get() public view returns (string memory retVal) {
    return storedData;
  }
}
