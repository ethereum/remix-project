import "./contract.sol";
contract Assets {
    uint[] proposals;
    function add(uint8 _numProposals) {
        proposals.length = _numProposals;
    }
}
