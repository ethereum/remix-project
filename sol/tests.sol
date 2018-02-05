pragma solidity ^0.4.7;

library Assert {

  event AssertionEvent(
    bool indexed passed,
    string message
  );

  function equal(uint a, uint b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

}

