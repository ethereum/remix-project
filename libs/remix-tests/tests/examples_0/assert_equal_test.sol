import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertEqualTest {

    function equalUintPassTest() public {
        Assert.equal(uint(1), uint(1), "equalUintPassTest passes");
    }

    function equalUintFailTest() public {
        Assert.equal(uint(1), uint(2), "equalUintFailTest fails");
    }

    function equalIntPassTest() public {
        Assert.equal(-1, -1, "equalIntPassTest passes");
    }

    function equalIntFailTest() public {
        Assert.equal(-1, 2, "equalIntFailTest fails");
    }
}