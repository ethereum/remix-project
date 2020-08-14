import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertTest {

    function okPassTest() public {
        Assert.ok(true, "okPassTest fails");
    }

    function okFailTest() public {
        Assert.ok(false, "okFailTest fails");
    }

    function equalUintPassTest() public {
        Assert.equal(uint(1), uint(1), "equalUintPassTest fails");
    }

    function equalUintFailTest() public {
        Assert.equal(uint(1), uint(2), "equalUintFailTest fails");
    }
}