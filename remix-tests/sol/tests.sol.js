module.exports = `
pragma solidity ^0.4.7;

library Assert {

  event AssertionEvent(
    bool passed,
    string message
  );

  function ok(bool a, string message) public returns (bool result) {
    result = a;
    emit AssertionEvent(result, message);
  }

  function equal(uint a, uint b, string message) public returns (bool result) {
    result = (a == b);
    emit AssertionEvent(result, message);
  }

  function equal(int a, int b, string message) public returns (bool result) {
    result = (a == b);
    emit AssertionEvent(result, message);
  }

  function equal(bool a, bool b, string message) public returns (bool result) {
    result = (a == b);
    emit AssertionEvent(result, message);
  }

  // TODO: only for certain versions of solc
  //function equal(fixed a, fixed b, string message) public returns (bool result) {
  //  result = (a == b);
  //  emit AssertionEvent(result, message);
  //}

  // TODO: only for certain versions of solc
  //function equal(ufixed a, ufixed b, string message) public returns (bool result) {
  //  result = (a == b);
  //  emit AssertionEvent(result, message);
  //}

  function equal(address a, address b, string message) public returns (bool result) {
    result = (a == b);
    emit AssertionEvent(result, message);
  }

  function equal(bytes32 a, bytes32 b, string message) public returns (bool result) {
    result = (a == b);
    emit AssertionEvent(result, message);
  }

  function equal(string a, string b, string message) public returns (bool result) {
     result = (keccak256(a) == keccak256(b));
     AssertionEvent(result, message);
  }

  function notEqual(uint a, uint b, string message) public returns (bool result) {
    result = (a != b);
    emit AssertionEvent(result, message);
  }

  function notEqual(int a, int b, string message) public returns (bool result) {
    result = (a != b);
    emit AssertionEvent(result, message);
  }

  function notEqual(bool a, bool b, string message) public returns (bool result) {
    result = (a != b);
    emit AssertionEvent(result, message);
  }

  // TODO: only for certain versions of solc
  //function notEqual(fixed a, fixed b, string message) public returns (bool result) {
  //  result = (a != b);
  //  emit AssertionEvent(result, message);
  //}

  // TODO: only for certain versions of solc
  //function notEqual(ufixed a, ufixed b, string message) public returns (bool result) {
  //  result = (a != b);
  //  emit AssertionEvent(result, message);
  //}

  function notEqual(address a, address b, string message) public returns (bool result) {
    result = (a != b);
    emit AssertionEvent(result, message);
  }

  function notEqual(bytes32 a, bytes32 b, string message) public returns (bool result) {
    result = (a != b);
    emit AssertionEvent(result, message);
  }

  function notEqual(string a, string b, string message) public returns (bool result) {
    result = (keccak256(a) != keccak256(b));
    AssertionEvent(result, message);
  }

  /*----------------- Greater than --------------------*/
  function greaterThan(uint a, uint b, string message) public constant returns (bool result) {
    result = (a > b);
    emit AssertionEvent(result, message);
  }

  function greaterThan(int a, int b, string message) public constant returns (bool result) {
    result = (a > b);
    emit AssertionEvent(result, message);
  }
  // TODO: safely compare between uint and int
  function greaterThan(uint a, int b, string message) public constant returns (bool result) {
    if(b < int(0)) {
      // int is negative uint "a" always greater
      result = true;
    } else {
      result = (a > uint(b));
    }
    emit AssertionEvent(result, message);
  }
  function greaterThan(int a, uint b, string message) public constant returns (bool result) {
    if(a < int(0)) {
      // int is negative uint "b" always greater
      result = false;
    } else {
      result = (uint(a) > b);
    }
    emit AssertionEvent(result, message);
  }
  /*----------------- Lesser than --------------------*/
  function lesserThan(uint a, uint b, string message) public constant returns (bool result) {
    result = (a < b);
    emit AssertionEvent(result, message);
  }

  function lesserThan(int a, int b, string message) public constant returns (bool result) {
    result = (a < b);
    emit AssertionEvent(result, message);
  }
  // TODO: safely compare between uint and int
  function lesserThan(uint a, int b, string message) public constant returns (bool result) {
    if(b < int(0)) {
      // int is negative int "b" always lesser
      result = false;
    } else {
      result = (a < uint(b));
    }
    emit AssertionEvent(result, message);
  }

  function lesserThan(int a, uint b, string message) public constant returns (bool result) {
    if(a < int(0)) {
      // int is negative int "a" always lesser
      result = true;
    } else {
      result = (uint(a) < b);
    }
    emit AssertionEvent(result, message);
  }
}
`
