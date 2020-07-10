pragma solidity ^0.4.17;
contract bytesString {
    
    function length(string a) public pure returns(uint) {
        bytes memory x = bytes(a);

        return x.length;
    }

}