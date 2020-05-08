contract gmbh {
    uint[] proposals;
    function register(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
