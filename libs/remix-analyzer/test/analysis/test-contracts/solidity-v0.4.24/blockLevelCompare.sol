pragma solidity ^0.4.22;
contract grr {
    bool breaker;
    
    function() public {
        uint a = 1;
        string memory sig = "withdraw()";
        uint b = 3;
        
        bytes4 selector = bytes4(keccak256(sig));
        
        abi.encode(a,b);
        
        abi.encodePacked(a,b);
        
        a = -b;
        
        a == b;

        if(a == b) {
            abi.encodeWithSelector(selector, a, b);
            abi.encodeWithSignature(sig, a, b);        
        }

        if(b < 4) { a == b; }

        if(b > 4) b == a;

        while(true) a == b;

        for(int i = 0; i < 3; i++) b == a;

        while(false) {
            int c = 3;
            uint(c) + a;

            c == 5;

        }

        a + b;
        breaker = false;
    }
    
}