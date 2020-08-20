module.exports = `
pragma solidity >=0.4.22 <0.7.0;

library Assert {

  event AssertionEvent(
    bool passed,
    string message
  );

  event AssertionEventUint(
    bool passed,
    string message,
    uint256 returned,
    uint256 expected
  );

  event AssertionEventInt(
    bool passed,
    string message,
    int256 returned,
    int256 expected
  );

  event AssertionEventBool(
    bool passed,
    string message,
    bool returned,
    bool expected
  );

  event AssertionEventAddress(
    bool passed,
    string message,
    address returned,
    address expected
  );

  event AssertionEventBytes32(
    bool passed,
    string message,
    bytes32 returned,
    bytes32 expected
  );

  event AssertionEventString(
    bool passed,
    string message,
    string returned,
    string expected
  );

  event AssertionEventUintInt(
    bool passed,
    string message,
    uint returned,
    int expected
  );

  function ok(bool a, string memory message) public returns (bool result) {
    result = a;
    emit AssertionEvent(result, message);
  }

  function equal(uint256 a, uint256 b, string memory message) public returns (bool result) {
    result = (a == b);
    emit AssertionEventUint(result, message, a, b);
  }

  function equal(int256 a, int256 b, string memory message) public returns (bool result) {
    result = (a == b);
    emit AssertionEventInt(result, message, a, b);
  }

  function equal(bool a, bool b, string memory message) public returns (bool result) {
    result = (a == b);
    emit AssertionEventBool(result, message, a, b);
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

  function equal(address a, address b, string memory message) public returns (bool result) {
    result = (a == b);
    emit AssertionEventAddress(result, message, a, b);
  }

  function equal(bytes32 a, bytes32 b, string memory message) public returns (bool result) {
    result = (a == b);
    emit AssertionEventBytes32(result, message, a, b);
  }

  function equal(string memory a, string memory b, string memory message) public returns (bool result) {
     result = (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b)));
     emit AssertionEventString(result, message, a, b);
  }

  function notEqual(uint256 a, uint256 b, string memory message) public returns (bool result) {
    result = (a != b);
    emit AssertionEventUint(result, message, a, b);
  }

  function notEqual(int256 a, int256 b, string memory message) public returns (bool result) {
    result = (a != b);
    emit AssertionEventInt(result, message, a, b);
  }

  function notEqual(bool a, bool b, string memory message) public returns (bool result) {
    result = (a != b);
    emit AssertionEventBool(result, message, a, b);
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

  function notEqual(address a, address b, string memory message) public returns (bool result) {
    result = (a != b);
    emit AssertionEventAddress(result, message, a, b);
  }

  function notEqual(bytes32 a, bytes32 b, string memory message) public returns (bool result) {
    result = (a != b);
    emit AssertionEventBytes32(result, message, a, b);
  }

  function notEqual(string memory a, string memory b, string memory message) public returns (bool result) {
    result = (keccak256(abi.encodePacked(a)) != keccak256(abi.encodePacked(b)));
    emit AssertionEventString(result, message, a, b);
  }

  /*----------------- Greater than --------------------*/
  function greaterThan(uint256 a, uint256 b, string memory message) public returns (bool result) {
    result = (a > b);
    emit AssertionEventUint(result, message, a, b);
  }

  function greaterThan(int256 a, int256 b, string memory message) public returns (bool result) {
    result = (a > b);
    emit AssertionEventInt(result, message, a, b);
  }
  // TODO: safely compare between uint and int
  function greaterThan(uint256 a, int256 b, string memory message) public returns (bool result) {
    if(b < int(0)) {
      // int is negative uint "a" always greater
      result = true;
    } else {
      result = (a > uint(b));
    }
    emit AssertionEventUintInt(result, message, a, b);
  }
  function greaterThan(int a, uint b, string memory message) public returns (bool result) {
    if(a < int(0)) {
      // int is negative uint "b" always greater
      result = false;
    } else {
      result = (uint(a) > b);
    }
    emit AssertionEvent(result, message);
  }
  /*----------------- Lesser than --------------------*/
  function lesserThan(uint256 a, uint256 b, string memory message) public returns (bool result) {
    result = (a < b);
    emit AssertionEventUint(result, message, a, b);
  }

  function lesserThan(int256 a, int256 b, string memory message) public returns (bool result) {
    result = (a < b);
    emit AssertionEventInt(result, message, a, b);
  }
  // TODO: safely compare between uint and int
  function lesserThan(uint256 a, int256 b, string memory message) public returns (bool result) {
    if(b < int(0)) {
      // int is negative int "b" always lesser
      result = false;
    } else {
      result = (a < uint(b));
    }
    emit AssertionEventUintInt(result, message, a, b);
  }

  function lesserThan(int a, uint b, string memory message) public returns (bool result) {
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
