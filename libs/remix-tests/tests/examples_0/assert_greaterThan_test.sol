import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertGreaterThanTest {

    function greaterThanUintPassTest() public {
        Assert.greaterThan(uint(5), uint(2), "greaterThanUintPassTest passes");
    }

    function greaterThanUintFailTest() public {
        Assert.greaterThan(uint(1), uint(4), "greaterThanUintFailTest fails");
    }

    function greaterThanIntPassTest() public {
        Assert.greaterThan(int(-1), int(-2), "greaterThanIntPassTest passes");
    }

    function greaterThanIntFailTest() public {
        Assert.greaterThan(int(-1), int(1), "greaterThanIntFailTest fails");
    }

    function greaterThanUintIntPassTest() public {
        Assert.greaterThan(uint(1), int(-2), "greaterThanUintIntPassTest passes");
    }

    function greaterThanUintIntFailTest() public {
        Assert.greaterThan(uint(1), int(2), "greaterThanUintIntFailTest fails");
    }

    function greaterThanIntUintPassTest() public {
        Assert.greaterThan(int(10), uint(2), "greaterThanIntUintPassTest passes");
    }

    function greaterThanIntUintFailTest() public {
        Assert.greaterThan(int(100), uint(-100), "greaterThanIntUintFailTest fails");
    }
}