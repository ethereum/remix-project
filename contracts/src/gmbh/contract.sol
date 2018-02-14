contract gmbh {
    uint[] proposals;
    function register(uint8 _numProposals) {
        proposals.length = _numProposals;
    }
}
