pragma solidity >=0.4.9 <0.6.0;

contract test {
    
    function () external {
        address payable x;
        this.b(x);
        x.call('something');
        x.send(1 wei);
        
    }
    
    function b(address a) public returns (bool) {

    }
}
