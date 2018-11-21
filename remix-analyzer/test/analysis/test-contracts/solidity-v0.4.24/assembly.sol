 pragma solidity ^0.4.9;
 contract test {
     
     address owner;
     
    function at(address _addr) returns (bytes o_code) {
        assert(_addr != 0x0);
        assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(_addr)
            // allocate output byte array - this could also be done without assembly
            // by using o_code = new bytes(size)
            o_code := mload(0x40)
            // new "memory end" including padding
            mstore(0x40, add(o_code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
            // store length in memory
            mstore(o_code, size)
            // actually retrieve the code, this needs assembly
            extcodecopy(_addr, add(o_code, 0x20), 0, size)
        }
    }
     
    function bla() {
        require(tx.origin == owner);
        msg.sender.send(19);
        assembly {
             
        }
    }
 }
