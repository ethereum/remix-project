pragma solidity >=0.4.9 <0.6.0;
contract arr {
    uint[] array = [1,2,3];
    function removeAtIndex() public returns (uint[] memory) {
        delete array[1];
        return array;
    }

    // TODO: deleteFromDynamicArray should not generate warnings if array item is shifted and removed
    /* function safeRemoveAtIndex(uint index) returns (uint[] memory) {
        if (index >= array.length) return;

        for (uint i = index; i < array.length-1; i++) {
            array[i] = array[i+1];
        }

        delete array[array.length-1];
        array.length--;

        return array;
    } */
}
