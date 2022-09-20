// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/MyToken.sol";

contract MyTokenTest {

    MyToken s;
    function beforeAll () public {
        s = new MyToken();
    }

    function testSetURI () public {
        string memory uri = "https://testuri.io/token";
        s.setURI(uri);
        Assert.equal(s.uri(1), uri, "uri did not match");
    }
}