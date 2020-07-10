contract sd {

  uint x = 0;
  function() external payable {  }
  
  function c () public {
      selfdestruct(address(0xdeadbeef));
  }
  
  function b () public {
      selfdestruct(address(0xdeadbeef));
      x = 1;
  }
}