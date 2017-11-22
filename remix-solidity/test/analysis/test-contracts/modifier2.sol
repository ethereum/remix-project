pragma solidity ^0.4.0;

contract owned {

    uint r=0;

    modifier ntimes(uint n) {
       for(uint i=0;i<n-1;i++){
           _;
       }
       _;
    }
    
    modifier plus100 {
        var bla=1;
        r+=100;
        _;
    }
    
    function a() ntimes(10) plus100 payable returns (uint) { 
        {
            uint bla=5;
        }
        r += bla;
        return r;
    }
}

