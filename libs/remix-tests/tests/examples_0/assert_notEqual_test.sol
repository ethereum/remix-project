import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertNotEqualTest {

    function notEqualUintPassTest() public {
        Assert.notEqual(uint(1), uint(2), "notEqualUintPassTest passes");
    }

    function notEqualUintFailTest() public {
        Assert.notEqual(uint(1), uint(1), "notEqualUintFailTest fails");
    }

    function notEqualIntPassTest() public {
        Assert.notEqual(1, -1, "notEqualIntPassTest passes");
    }

    function notEqualIntFailTest() public {
        Assert.notEqual(-2, -2, "notEqualIntFailTest fails");
    }

    function notEqualBoolPassTest() public {
        Assert.notEqual(true, false, "notEqualBoolPassTest passes");
    }

    function notEqualBoolFailTest() public {
        Assert.notEqual(true, true, "notEqualBoolFailTest fails");
    }

    function notEqualAddressPassTest() public {
        Assert.notEqual(0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, 0x1c6637567229159d1eFD45f95A6675e77727E013, "notEqualAddressPassTest passes");
    }

    function notEqualAddressFailTest() public {
        Assert.notEqual(0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, "notEqualAddressFailTest fails");
    }

    function notEqualBytes32PassTest() public {
        bytes32 e = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        bytes32 r = 0x72656d6979000000000000000000000000000000000000000000000000000000;
        Assert.notEqual(r, e, "notEqualBytes32PassTest fails");
    }

    function notEqualBytes32FailTest() public {
        bytes32 e = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        bytes32 r = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        Assert.notEqual(r, e, "notEqualBytes32FailTest fails");
    }

    function notEqualStringPassTest() public {
        Assert.notEqual(string("remix"), string("remix-tests"), "notEqualStringPassTest passes");
    }

    function notEqualStringFailTest() public {
        Assert.notEqual(string("remix"), string("remix"), "notEqualStringFailTest fails");
    }
}
