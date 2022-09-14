// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.9;
import "remix_tests.sol";
import "../contracts/SampleERC20.sol";

contract SampleERC20Test {

    SampleERC20 s;
    function beforeAll () public {
        s = new SampleERC20("TestToken", "TST", 18, 1000);
    }

    function testTokenNameAndSymbol () public {
        Assert.equal(s.name(), "TestToken", "token name did not match");
        Assert.equal(s.symbol(), "TST", "token symbol did not match");
    }
}