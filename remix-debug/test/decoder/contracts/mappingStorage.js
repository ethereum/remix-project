module.exports = {
  contract: `
  pragma solidity ^0.5.0;

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
