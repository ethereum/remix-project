pragma solidity ^0.8.20;
 
contract Example7702 {
  event Log(string message);
 
  function initialize() public payable {
    emit Log('Hello, world!');
  }
 
  function ping() public {
    emit Log("Pong!");
  }

  fallback() external payable {
  }

  receive() external payable {
  }
}