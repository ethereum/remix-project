pragma solidity ^0.4.0;

contract a {
    
    uint x;
    
    function foo() {
        x++;
    }
}

contract b {
    a x;
    function bar() constant {
        address a;
        a.send(100 wei);
        x.foo();
    }
}
