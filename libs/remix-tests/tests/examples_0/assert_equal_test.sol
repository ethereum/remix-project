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

    function equalBoolPassTest() public {
        Assert.equal(true, true, "equalBoolPassTest passes");
    }

    function equalBoolFailTest() public {
        Assert.equal(true, false, "equalBoolFailTest fails");
    }

    function equalAddressPassTest() public {
        Assert.equal(0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, 0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, "equalAddressPassTest passes");
    }

    function equalAddressFailTest() public {
        Assert.equal(0x7994f14563F39875a2F934Ce42cAbF48a93FdDA9, 0x1c6637567229159d1eFD45f95A6675e77727E013, "equalAddressFailTest fails");
    }

    function equalBytes32PassTest() public {
        bytes32 e = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        bytes32 r = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        Assert.equal(r, e, "equalBytes32PassTest passes");
    }

    function equalBytes32FailTest() public {
        bytes32 e = 0x72656d6978000000000000000000000000000000000000000000000000000000;
        bytes32 r = 0x72656d6979000000000000000000000000000000000000000000000000000000;
        Assert.equal(r, e, "equalBytes32FailTest fails");
    }

    function equalStringPassTest() public {
        Assert.equal(string("remix"), string("remix"), "equalStringPassTest passes");
    }

    function equalStringFailTest() public {
        Assert.equal(string("remix"), string("remix-tests"), "equalStringFailTest fails");
    }
}