// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/SampleERC721.sol";

contract SampleERC721Test {

    SampleERC721 s;
    function beforeAll () public {
        s = new SampleERC721("TestNFT", "TNFT");
    }

    function testTokenNameAndSymbol () public {
        Assert.equal(s.name(), "TestNFT", "token name did not match");
        Assert.equal(s.symbol(), "TNFT", "token symbol did not match");
    }
}