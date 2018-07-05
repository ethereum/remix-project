contract sd {

  function() public payable {  }
  
  function c () public constant {
      selfdestruct(address(0xdeadbeef));
  }
  
  function b () public payable {
      selfdestruct(address(0xdeadbeef));
  }
}