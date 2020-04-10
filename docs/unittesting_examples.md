Testing by Example
============

Here are some examples which can give you better understanding to plan your tests.

**Note:** Examples in this section are intended to give you a push for development. We don't recommend to rely on them without verifying at your end.

### 1. Simple example
In this example, we test setting & getting variables.

Contract/Program to be tested: `Simple_storage.sol`

```
pragma solidity >=0.4.22 <0.7.0;

contract SimpleStorage {
    uint public storedData;

    constructor() public {
        storedData = 100;
    }

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint retVal) {
        return storedData;
    }
}
```
Test contract/program: `simple_storage_test.sol`

```
pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol";
import "./Simple_storage.sol";

contract MyTest {
    SimpleStorage foo;

    // beforeEach works before running each test
    function beforeEach() public {
        foo = new SimpleStorage();
    }

    /// Test if initial value is set correctly
    function initialValueShouldBe100() public returns (bool) {
        return Assert.equal(foo.get(), 100, "initial value is not correct");
    }

    /// Test if value is set as expected
    function valueIsSet200() public returns (bool) {
        foo.set(200);
        return Assert.equal(foo.get(), 200, "value is not 200");
    }
}
```

### 2. Testing a method involving `msg.sender`
In Solidity, `msg.sender` plays a great role in access management of a smart contract methods interaction. Different `msg.sender` can help to test a contract involving multiple accounts with different roles. Here is an example for testing such case:

Contract/Program to be tested: `Sender.sol`

```
pragma solidity >=0.4.22 <0.7.0;
contract Sender {
    address private owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    function updateOwner(address newOwner) public {
        require(msg.sender == owner, "only current owner can update owner");
        owner = newOwner;
    }
    
    function getOwner() public view returns (address) {
        return owner;
    }
}
```

Test contract/program: `Sender_test.sol`

```
pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol"; // this import is automatically injected by Remix
import "remix_accounts.sol";
import "./Sender.sol";
// Inherit 'Sender' contract
contract SenderTest is Sender {
    address account0;
    address account1;
    address account2;
    
    /// Initiate accounts variable
    function beforeAll() public {
        account0 = TestsAccounts.getAccount(0);
        account1 = TestsAccounts.getAccount(1);
        account2 = TestsAccounts.getAccount(2);
    }
    
    /// Test if initial owner is set correctly
    function testInitialOwner() public {
        // account-0 is default account, so current owner should be account0
        Assert.equal(getOwner(), account0, 'owner should be account-0');
    }
    
    /// Update owner. This method will be called by account0 as there is not custom sender appointed
    function updateOwnerOnce() public {
        // check method call is as expected
        Assert.ok(msg.sender == account0, 'caller should default account i.e. account0');
        // update owner address to account1
        updateOwner(account1);
        // check if owner is set to expected account
        Assert.equal(getOwner(), account1, 'owner should be updated to account1');
    }
    
    /// Update owner again by defining custom sender
    /// #sender: account-1
    function updateOwnerOnceAgain() public {
        // check if caller is custom and is as expected
        Assert.ok(msg.sender == account1, 'caller should be custom account i.e. account1');
        // update owner address to account2. This will be successful because account1 is current owner & caller both
        updateOwner(account2);
        // check if owner is set to expected account i.e. account2
        Assert.equal(getOwner(), account2, 'owner should be updated to account2');
    }
}
```

### 3. Testing method execution

With Solidity, one can verify the changes made by a method in storage by accessing those variables out of a contract. But while testing whether method execution was successful and if execution failed, what was the reason behind it, can also be an importnat case.
Solidity introduced `try-catch` statement in version 0.6.0 which helps a lot to solve this purpose. Previously, this could be achieved using low-level call to some extent. Here is the example to test such a scenario:

Contract/Program to be tested: `AttendanceRegister.sol`

```
pragma solidity >=0.4.22 <0.7.0;
contract AttendanceRegister {
struct Student{
        string name;
        uint class;
    }
event Added(string name, uint class, uint time);
mapping(uint => Student) public register; // roll number => student details
    function add(uint rollNumber, string memory name, uint class) public returns (uint256){
        require(class > 0 && class <= 12, "Invalid class");
        require(register[rollNumber].class == 0, "Roll number not available");
        Student memory s = Student(name, class);
        register[rollNumber] = s;
        emit Added(name, class, now);
        return rollNumber;
    }
    
    function getStudentName(uint rollNumber) public view returns (string memory) {
        return register[rollNumber].name;
    }
}
```

Test contract/program: `AttendanceRegister_test.sol`

```
pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "./AttendanceRegister.sol";
contract AttendanceRegisterTest {
   
    AttendanceRegister ar;
    
    /// 'beforeAll' runs before all other tests
    function beforeAll () public {
        // Create an instance of contract to be tested
        ar = new AttendanceRegister();
    }
    
    /// For solidity version greater or equal to 0.6.0, 
    /// See: https://solidity.readthedocs.io/en/v0.6.0/control-structures.html#try-catch
    /// Test 'add' using try-catch
    function testAddSuccessUsingTryCatch() public {
        // This will pass
        try ar.add(101, 'secondStudent', 11) returns (uint256 r) {
            Assert.equal(r, 101, 'wrong rollNumber');
        } catch Error(string memory /*reason*/) {
            // This is executed in case
            // revert was called inside getData
            // and a reason string was provided.
            Assert.ok(false, 'failed with reason');
        } catch (bytes memory /*lowLevelData*/) {
            // This is executed in case revert() was used
            // or there was a failing assertion, division
            // by zero, etc. inside getData.
            Assert.ok(false, 'failed unexpected');
        }
    }
    
    /// Test failure case of 'add' using try-catch
    function testAddFailureUsingTryCatch1() public {
        // This will revert on 'require(class > 0 && class <= 12, "Invalid class");' for class '13'
        try ar.add(101, 'secondStudent', 13) returns (uint256 r) {
            Assert.ok(false, 'method execution should fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Invalid class', 'failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'failed unexpected');
        }
    }
    
    /// Test another failure case of 'add' using try-catch
    function testAddFailureUsingTryCatch2() public {
        // This will revert on 'require(register[rollNumber].class == 0, "Roll number not available");' for rollNumber '101'
        try ar.add(101, 'secondStudent', 11) returns (uint256 r) {
            Assert.ok(false, 'method execution should fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Roll number not available', 'failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'failed unexpected');
        }
    }
    
    /// For solidity version less than 0.6.0, low level call can be used
    /// See: https://solidity.readthedocs.io/en/v0.6.0/units-and-global-variables.html#members-of-address-types
    /// Test success case of 'add' using low level call
    function testAddSuccessUsingCall() public {
        bytes memory methodSign = abi.encodeWithSignature('add(uint256,string,uint256)', 102, 'firstStudent', 10);
        (bool success, bytes memory data) = address(ar).call(methodSign);
        // 'success' stores the result in bool, this can be used to check whether method call was successful
        Assert.equal(success, true, 'execution should be successful');
        // 'data' stores the returned data which can be decoded to get the actual result
        uint rollNumber = abi.decode(data, (uint256));
        // check if result is as expected
        Assert.equal(rollNumber, 102, 'wrong rollNumber');
    }
    
    /// Test failure case of 'add' using low level call
    function testAddFailureUsingCall() public {
        bytes memory methodSign = abi.encodeWithSignature('add(uint256,string,uint256)', 102, 'duplicate', 10);
        (bool success, bytes memory data) = address(ar).call(methodSign);
        // 'success' will be false if method execution is not successful
        Assert.equal(success, false, 'execution should be successful');
    }
}
```


### 4. Testing a method involving `msg.value`
In Solidity, ether can be passed along with a method call which is accessed inside contract as `msg.value`. Sometimes, multiple calculations in a method are performed based on `msg.value` which can be tested with various values using Remix's Custom transaction context. See the example:

Contract/Program to be tested: `Value.sol`

```
pragma solidity >=0.4.22 <0.7.0;
contract Value {
    uint256 public tokenBalance;
    
    constructor() public {
        tokenBalance = 0;
    }
    
    function addValue() payable public {
        tokenBalance = tokenBalance + (msg.value/10);
    } 
    
    function getTokenBalance() view public returns (uint256) {
        return tokenBalance;
    }
}
```
Test contract/program: `Value_test.sol`

```
pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol"; 
import "./Value.sol";
contract ValueTest{
    Value v;
    
    function beforeAll() public {
        // create a new instance of Value contract
        v = new Value();
    }
    
    /// Test initial balance
    function testInitialBalance() public {
        // initially token balance should be 0
        Assert.equal(v.getTokenBalance(), 0, 'token balance should be 0 initially');
    }
    
    /// For Solidity version greater than 0.6.1
    /// Test 'addValue' execution by passing custom ether amount 
    /// #value: 200
    function addValueOnce() public payable {
        // check if value is same as provided through devdoc
        Assert.equal(msg.value, 200, 'value should be 200');
        // execute 'addValue'
        v.addValue{gas: 40000, value: 200}(); // introduced in Solidity version 0.6.2
        // As per the calculation, check the total balance
        Assert.equal(v.getTokenBalance(), 20, 'token balance should be 20');
    }
    
    /// For Solidity version less than 0.6.2
    /// Test 'addValue' execution by passing custom ether amount again using low level call
    /// #value: 100
    function addValueAgain() public payable {
        Assert.equal(msg.value, 100, 'value should be 100');
        bytes memory methodSign = abi.encodeWithSignature('addValue()');
        (bool success, bytes memory data) = address(v).call.gas(40000).value(100)(methodSign);
        Assert.equal(success, true, 'execution should be successful');
        Assert.equal(v.getTokenBalance(), 30, 'token balance should be 30');
    }
}
```