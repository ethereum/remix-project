import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";

contract SenderAndValueTest {

    /// #sender: account-2
    /// #value: 200
    function beforeAll () public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(2), "wrong sender in beforeAll");
        Assert.equal(msg.value, 200, "wrong value in beforeAll");
    }

    /// #sender: account-3
    /// #value: 300
    function beforeEach () public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(3), "wrong sender in beforeEach");
        Assert.equal(msg.value, 300, "wrong value in beforeEach");
    }

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

    /// #sender: account-4
    /// #value: 400
    function afterEach () public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(4), "wrong sender in afterEach");
        Assert.equal(msg.value, 400, "wrong value in afterEach");
    }

    /// #sender: account-5
    /// #value: 500
    function afterAll () public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(5), "wrong sender in afterAll");
        Assert.equal(msg.value, 500, "wrong value in afterAll");
    }
}
