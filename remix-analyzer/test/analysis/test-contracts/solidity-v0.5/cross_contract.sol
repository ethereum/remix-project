pragma solidity >=0.4.9 <0.6.0;

contract a {
    
    uint x;
    
    function foo() public {
        x++;
    }
}

contract b {
    a x;
    function bar() public {
        address payable a;
        a.send(100 wei);
        x.foo();
    }
}
