// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/MyToken.sol";

contract MyTokenTest is MyToken {

    address acc0 = TestsAccounts.getAccount(0);
    address acc1;
    address acc2;
    address acc3;
    address acc4;

    // acc0 will be set as initial owner
    constructor() MyToken(acc0) {}

    function beforeAll() public {
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3);
        acc4 = TestsAccounts.getAccount(4);
    }

    function testTokenInitialValues() public {
        Assert.equal(name(), "MyToken", "token name did not match");
        Assert.equal(symbol(), "MTK", "token symbol did not match");
        Assert.equal(decimals(), 18, "token decimals did not match");
        Assert.equal(totalSupply(), 0, "token supply should be zero");
    }

    function testTokenMinting() public {
        Assert.equal(balanceOf(acc0), 0, "token balance should be zero initially");
        mint(acc0, 10000);
        Assert.equal(balanceOf(acc0), 10000, "token balance did not match");
    }

    function testTotalSupply() public {
        Assert.equal(totalSupply(), 10000, "total supply did not match");
    }

    /// #sender: account-1
    function failTestTokenMintingWithWrongOwner() public {
        Assert.equal(balanceOf(acc0), 0, "token balance should be zero initially");
        mint(acc0, 10000);
        Assert.equal(balanceOf(acc0), 10000, "token balance did not match");
    }

    function failTestTokenMintingForZeroAddress() public {
        mint(address(0), 10000);
    }

    function testTokenTransfer() public {
        Assert.equal(balanceOf(acc1), 0, "token balance should be zero initially");
        transfer(acc1, 500);
        Assert.equal(balanceOf(acc0), 9500, "token balance did not match");
        Assert.equal(balanceOf(acc1), 500, "token balance did not match");
    }

    /// #sender: account-1
    function testTokenTransferToOtherAddress() public {
        Assert.equal(balanceOf(acc1), 500, "acc1 token balance did not match");
        transfer(acc2, 100);
        Assert.equal(balanceOf(acc1), 400, "acc1 token balance did not match");
        Assert.equal(balanceOf(acc2), 100, "acc2 token balance did not match");
    }

    function failTestTokenTransferToZeroAddress() public {
        transfer(address(0), 100);
    }

    /// #sender: account-2
    function failTestTokenTransferMoreThanBalance() public {
        transfer(acc3, 110);
    }

    function testTokenApprove() public {
        Assert.equal(allowance(acc0, acc3), 0, "token allowance should be zero initially");
        approve(acc3, 500);
        Assert.equal(allowance(acc0, acc3), 500, "token allowance did not match");
    }

    function failTestTokenApproveForZeroSpenderAddress() public {
        approve(address(0), 500);
    }

    /// #sender: account-3
    function testTokenTransferfrom() public {
        Assert.equal(allowance(acc0, acc3), 500, "token allowance did not match");
        transferFrom(acc0, acc4, 400);
        Assert.equal(balanceOf(acc4), 400, "acc4 token balance did not match");
        Assert.equal(allowance(acc0, acc3), 100, "token allowance did not match");
    }

    /// #sender: account-3
    function failTestTokenTransferfromForMoreThanAllowance() public {
        transferFrom(acc0, acc4, 110);
    }

    /// #sender: account-3
    function failTestTokenTransferfromForZeroToAddress() public {
        transferFrom(acc0, address(0), 100);
    }
}

