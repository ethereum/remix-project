pragma solidity ^0.4.22;
contract forLoopArr {
    uint[] array;
    constructor(uint[] _array) {
        array = _array;
    }

    function shiftArrItem(uint index) returns(uint[]) {
        // TODO: for (uint i = index; i < array.length-1; i++) should also generate warning
        for (uint i = index; i < array.length; i++) {
            array[i] = array[i+1];
        }
        return array;
    }
}
