import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";

contract SenderAndValueTest {
    function beforeAll () public {}

    /// #sender: account-1
    function checkSenderIs1 () public {
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "wrong sender in checkSenderIs1");
    }

    /// #sender: account-9
    /// #value: 10
    function checkSenderIs9AndValueis10 () public payable{
        Assert.equal(msg.sender, TestsAccounts.getAccount(9), "wrong sender in checkSenderIs9AndValueis10");
        Assert.equal(msg.value, 10, "wrong value in checkSenderIs9AndValueis10");
    }

    /// #value: 100
    function checkValueIs100 () public payable{
        Assert.equal(msg.value, 100, "wrong value in checkValueIs100");
    }

    function checkSenderIsnt2 () public {
        Assert.notEqual(msg.sender, TestsAccounts.getAccount(2), "wrong sender in checkSenderIsnt2");
    }

    function checkValueIsnt10 () public payable{
        Assert.notEqual(msg.value, 10, "wrong value in checkValueIsnt10");
    }
}
