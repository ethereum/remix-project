pragma solidity >=0.4.9 <0.6.0;
contract bytesString {
    
    function length(string memory a) public pure returns(uint) {
        bytes memory x = bytes(a);

        return x.length;
    }

}