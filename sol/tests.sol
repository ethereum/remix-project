pragma solidity ^0.4.7;

library Assert {

  event AssertionEvent(
    bool indexed passed,
    string message
  );

  function ok(bool a, string message) public returns (bool result) {
    result = a;
    AssertionEvent(result, message);
  }

  function equal(uint a, uint b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

  function equal(int a, int b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

  function equal(bool a, bool b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

  //function equal(fixed a, fixed b, string message) public returns (bool result) {
  //  result = (a == b);
  //  AssertionEvent(result, message);
  //}

  //function equal(ufixed a, ufixed b, string message) public returns (bool result) {
  //  result = (a == b);
  //  AssertionEvent(result, message);
  //}

  function equal(address a, address b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

  function equal(bytes32 a, bytes32 b, string message) public returns (bool result) {
    result = (a == b);
    AssertionEvent(result, message);
  }

  // probably need to convert to bytes first
  //function equal(string a, string b, string message) public returns (bool result) {
  //  result = (a == b);
  //  AssertionEvent(result, message);
  //}

  function notEqual(uint a, uint b, string message) public returns (bool result) {
    result = (a != b);
    AssertionEvent(result, message);
  }

  function notEqual(int a, int b, string message) public returns (bool result) {
    result = (a != b);
    AssertionEvent(result, message);
  }

  function notEqual(bool a, bool b, string message) public returns (bool result) {
    result = (a != b);
    AssertionEvent(result, message);
  }

  //function notEqual(fixed a, fixed b, string message) public returns (bool result) {
  //  result = (a != b);
  //  AssertionEvent(result, message);
  //}

  //function notEqual(ufixed a, ufixed b, string message) public returns (bool result) {
  //  result = (a != b);
  //  AssertionEvent(result, message);
  //}

  function notEqual(address a, address b, string message) public returns (bool result) {
    result = (a != b);
    AssertionEvent(result, message);
  }

  function notEqual(bytes32 a, bytes32 b, string message) public returns (bool result) {
    result = (a != b);
    AssertionEvent(result, message);
  }

  // probably need to convert to bytes first
  //function notEqual(string a, string b, string message) public returns (bool result) {
  //  result = (a != b);
  //  AssertionEvent(result, message);
  //}


}

