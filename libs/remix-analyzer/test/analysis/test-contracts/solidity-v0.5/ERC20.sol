
pragma solidity >=0.4.9 <0.6.0;
contract EIP20 {

    uint public decimals = 12;
    
    // optional
    function name() public pure returns (string memory) {
        return "MYTOKEN";
    }
    
    // optional
    function symbol() public pure returns (string memory) {
       return "MT";
    }
    
    // optional
    //function decimals() internal pure returns (uint8) {
    //   return 12;
    //}
    
    function totalSupply() public pure returns (uint256) {
        return 12000;
    }
    
    function balanceOf(address _owner) public pure returns (uint256) {
        return 0;
    }

    function transfer(address _to, uint256 _value) public pure returns (bool success) {
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public pure returns (bool) {
        return true;
    }
    
    function approve(address _spender, uint256 _value) public pure returns (bool) {
        return true;
    }
    
    function allowance(address _owner, address _spender) public pure returns (uint256) {
        return 0;
    }

}