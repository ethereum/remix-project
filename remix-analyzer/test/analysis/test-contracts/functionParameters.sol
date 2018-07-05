pragma solidity ^0.4.18;

contract B {
    function plus(uint a, uint b) pure internal returns (uint) {
        return a + b;
    }

    function eval(function (uint, uint) pure internal returns (uint) f, uint x, uint y) pure internal returns (uint) {
        return f(x, y);
    }

    function calc(uint x, uint y) pure public returns (uint) {
        return eval(plus, x, y);
        // return plus(x, y);
    }
}