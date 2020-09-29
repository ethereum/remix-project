import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertLesserThanTest {

    function lesserThanUintPassTest() public {
        Assert.lesserThan(uint(2), uint(5), "lesserThanUintPassTest passes");
    }

    function lesserThanUintFailTest() public {
        Assert.lesserThan(uint(4), uint(2), "lesserThanUintFailTest fails");
    }

    function lesserThanIntPassTest() public {
        Assert.lesserThan(int(-1), int(0), "lesserThanIntPassTest passes");
    }

    function lesserThanIntFailTest() public {
        Assert.lesserThan(int(1), int(-1), "lesserThanIntFailTest fails");
    }

    function lesserThanUintIntPassTest() public {
        Assert.lesserThan(uint(1), int(2), "lesserThanUintIntPassTest passes");
    }

    function lesserThanUintIntFailTest() public {
        Assert.lesserThan(uint(-1), int(-1), "lesserThanUintIntFailTest fails");
    }

    function lesserThanIntUintPassTest() public {
        Assert.lesserThan(int(100), uint(-50), "lesserThanIntUintPassTest passes");
    }

    function lesserThanIntUintFailTest() public {
        Assert.lesserThan(int(1), uint(1), "lesserThanIntUintFailTest fails");
    }
}