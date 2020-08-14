import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertGreaterThanTest {

    function greaterThanUintPassTest() public {
        Assert.greaterThan(uint(5), uint(2), "greaterThanUintPassTest passes");
    }

    function greaterThanUintFailTest() public {
        Assert.greaterThan(uint(1), uint(4), "greaterThanUintFailTest fails");
    }
}