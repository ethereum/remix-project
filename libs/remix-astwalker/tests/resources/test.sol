contract test {
    int x;

    int y;

    function set(int _x) returns (int _r)
    {
        x = _x;
        y = 10;
        _r = x;
    }

    function get() returns (uint x, uint y)
    {

    }
}
