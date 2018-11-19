contract c {
    uint x;
    function f(address r) {
        r.transfer(1);
        x = 2;
    }
}