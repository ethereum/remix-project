module.exports = {
  contract: `
contract MyContract {
    uint public data;

    function foo(uint _data) external {
        bar(_data);
        baz();
    }

    function bar(uint _data) internal {
        data = _data;
    }

    function baz() internal {        
        revert("oops....");
    }
}
  `
}
