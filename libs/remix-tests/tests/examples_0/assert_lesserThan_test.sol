
import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertLesserThanTest {

    function lesserThanUintPassTest() public {
        Assert.lesserThan(uint(2), uint(5), "lesserThanUintPassTest passes");
    }

    function lesserThanUintFailTest() public {
        Assert.lesserThan(uint(4), uint(2), "lesserThanUintFailTest fails");
    }
}