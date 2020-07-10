pragma solidity >=0.4.9 <0.6.0;
contract forLoopArr {
    uint[] array;
    constructor(uint[] memory _array) public {
        array = _array;
    }

    function shiftArrItem(uint index) public returns(uint[] memory) {
        for (uint i = index; i < array.length; i++) {
            array[i] = array[i+1];
        }
        return array;
    }

    function shiftArrItem2(uint index) public returns(uint[] memory) {
        for (uint i = index; i < array.length - 1; i++) {
            array[i] = array[i+1];
        }
        return array;
    }
}
