contract c {
    uint x;
    function f(address payable r) public payable {
        r.transfer(1);
        x = 2;
    }
}