import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertOkTest {

    function okPassTest() public {
        Assert.ok(true, "okPassTest passes");
    }

    function okFailTest() public {
        Assert.ok(false, "okFailTest fails");
    }
}