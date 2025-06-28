import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Spender {
    IERC20 public erc20;
    constructor(IERC20 _erc20) {
        erc20 = _erc20;
    }
    function send (address from, address to, uint _amount) public {
        erc20.transferFrom(from, to, _amount);
    }
}