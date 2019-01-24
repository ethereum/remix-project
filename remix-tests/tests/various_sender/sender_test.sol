import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";

contract SenderTest {

    function beforeAll () public {}

    /// sender: account-1
    function checkSenderIs1 () public {
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "wrong sender in checkSenderIs1");
    }

    /// sender: account-0
    function checkSenderIs0 () public {
        Assert.equal(msg.sender, TestsAccounts.getAccount(0), "wrong sender in checkSenderIs0");
    }

    /// sender: account-1
    function checkSenderIsNt0 () public {
        Assert.notEqual(msg.sender, TestsAccounts.getAccount(0), "wrong sender in checkSenderIsNot0");
    }

    /// sender: account-2
    function checkSenderIsnt2 () public {
        Assert.notEqual(msg.sender, TestsAccounts.getAccount(1), "wrong sender in checkSenderIsnt2");
    }
}
