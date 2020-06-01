pragma solidity ^0.4.0;

contract test {
    
    function (){
        address x;
        this.b(x);
        x.call('something');
        x.send(1 wei);
        
    }
    
    function b(address a) returns (bool) {

    }
}
