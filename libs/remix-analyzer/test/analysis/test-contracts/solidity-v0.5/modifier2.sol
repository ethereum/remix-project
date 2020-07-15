pragma solidity >=0.4.9 <0.6.0;

contract owned {

    uint r=0;

    modifier ntimes(uint n) {
       for(uint i=0;i<n-1;i++){
           _;
       }
       _;
    }
    
    modifier plus100 {
        uint bla=1;
        r+=100;
        _;
    }
    
    function a() ntimes(10) plus100 public payable returns (uint) { 
        {
            uint bla=5;
            r += bla;
        }
        return r;
    }
}

