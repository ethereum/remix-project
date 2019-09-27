pragma solidity >=0.4.9 <0.6.0;

contract loops {
    uint[] array;
    constructor(uint[] memory _array) public {
        array = _array;
    }

    function fnWithForLoop(uint index) public  {
        for (uint i = index; i < 10; i++) {
            array.push(i);
        }
    }

    function fnWithWhileLoop(uint index) public  {
        uint i = index;
        while (i < 10) {
            array.push(i);
            i++;
        }
    }

    function fnWithDoWhileLoop(uint index) public  {
        uint i = index;
        do{
            array.push(i);
            i++;
        }while (i < 10);
    }
}