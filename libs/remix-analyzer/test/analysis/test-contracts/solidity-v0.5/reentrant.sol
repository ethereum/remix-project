pragma solidity >=0.4.9 <0.6.0;

contract InfoFeed {
    uint c;
    function info() constant returns (uint ret) {return c;} 
    function call1(uint a) constant returns (bool) {return true;}
}

// THIS CONTRACT CONTAINS A BUG - DO NOT USE
contract Fund {
    /// Mapping of ether shares of the contract.
    //mapping(address => uint) shares;
    /// Withdraw your share.
    
    uint c = 0;
    function withdraw() constant {
        InfoFeed f;
        
       
        //shares[msg.sender] /= 1;
        
        f.info();
       
        //if (msg.sender.send(shares[msg.sender])) throw;
        //    shares[msg.sender] = 0;
            
       
       b(true, false);
        //shares[msg.sender]++;
        //c++;
        
    }
    mapping(address => uint) shares;
    
    function b(bool a, bool b) returns (bool) {
        mapping(address => uint) c = shares;
        c[msg.sender] = 0;
        //f();
        //withdraw();
        //shares[msg.sender]++;
        //c++;
        return true;
    }
    
    function f() {
        c++;
        withdraw();
    }
}
