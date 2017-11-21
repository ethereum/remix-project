contract sd {
 uint120 x;
  function() public payable {  }
  
  function c () public constant {
      //x++;
      selfdestruct(address(0xdeadbeef));
  }
  
  function b () public payable {
      selfdestruct(address(0xdeadbeef));
  }
}