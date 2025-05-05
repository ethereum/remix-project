pragma solidity ^0.8.20;
 
contract Delegation {
  fallback() external payable {
  }

  receive() external payable {
  }

  function hello() public pure returns (string memory) {
    return "Hello, I run code!";
  }
}