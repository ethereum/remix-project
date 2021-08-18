import "remix_tests.sol"; // this import is automatically injected by Remix.


import "./hardhat/console.sol";

contract AssertOkTest {

    function okPassTest() public {
        console.log("AssertOkTest", "okPassTest");
        Assert.ok(true, "okPassTest passes");
    }

    function okFailTest() public {
        console.log("AssertOkTest", "okFailTest");
        Assert.ok(false, "okFailTest fails");
    }
}