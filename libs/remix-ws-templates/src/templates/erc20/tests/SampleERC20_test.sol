// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/SampleERC20.sol";

contract SampleERC20Test {

    SampleERC20 s;
    function beforeAll () public {
        s = new SampleERC20("TestToken", "TST");
    }

    function testTokenNameAndSymbol () public {
        Assert.equal(s.name(), "TestToken", "token name did not match");
        Assert.equal(s.symbol(), "TST", "token symbol did not match");
    }
}