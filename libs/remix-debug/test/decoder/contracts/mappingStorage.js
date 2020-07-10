module.exports = {
  contract: `
contract SimpleMappingState {
    uint _num;
    mapping(string => uint) _iBreakSolidityState;
    mapping(uint => uint) _iBreakSolidityStateInt;
    function updateNum(uint num, string memory str) public {
        _num = num;
        _iBreakSolidityState[str] = num;
        _iBreakSolidityStateInt[num] = num;
    }
}
  `
}
