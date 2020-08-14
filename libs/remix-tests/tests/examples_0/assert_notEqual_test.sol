import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertNotEqualTest {

    function notEqualUintPassTest() public {
        Assert.notEqual(uint(1), uint(2), "notEqualUintPassTest passes");
    }

    function notEqualUintFailTest() public {
        Assert.notEqual(uint(1), uint(1), "notEqualUintFailTest fails");
    }
}