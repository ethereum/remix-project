pragma solidity ^0.4.24;
import "./SafeMath.sol";

/*
Using a proxy contract here allows revert-causing functions that contain
require() to return false rather than halt execution
https://truffleframework.com/tutorials/testing-for-throws-in-solidity-tests
*/
contract SafeMathProxy {
    using SafeMath for uint;

    function divProxy(uint256 a, uint256 b) returns (uint256) {
        return a.div(b);
    }

    function mulProxy(uint256 a, uint256 b) returns (uint256) {
        return a.mul(b);
    }

    function subProxy(uint256 a, uint256 b) returns (uint256) {
        return a.sub(b);
    }

    function addProxy(uint256 a, uint256 b) returns (uint256) {
        return a.add(b);
    }

    function modProxy(uint256 a, uint256 b) returns (uint256) {
        return a.mod(b);
    }
}
