module.exports = {
  contract: `
  pragma solidity ^0.4.19;

contract SimpleMappingState {
    uint _num;
    mapping(string => uint) _iBreakSolidityState;
    function updateNum(uint num, string str) public {
        _num = num;
        _iBreakSolidityState[str] = num;
    }
}
  `
}
