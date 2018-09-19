pragma solidity ^0.4.19;

contract CharityCampaign {
    mapping (address => uint) contributions; 
    int128 feePercentage;
    uint p2;
    address processor;
    address beneficiary;

    function CharityCampaign(address _beneficiary, int128 _feePercentage) public {
        processor = msg.sender;
        beneficiary = _beneficiary;
        feePercentage = _feePercentage;
    }

    function contribute() payable public returns (uint feeCollected) {
        uint fee = msg.value * uint256(feePercentage / 100);
        fee = msg.value * (p2 / 100);
        contributions[msg.sender] = msg.value - fee;
        processor.transfer(fee);
        return fee;
    }

    function endCampaign() public returns (bool) {
        require(msg.sender == processor || msg.sender == beneficiary);
        selfdestruct(beneficiary);
        return true;
    }

    // FALSE POSITIVE FOR SELFDESTRUCT TERMINAL 
    function endAmbiguous() public {
        if(msg.sender == 0x0) {
            selfdestruct(beneficiary);
        } else {
            selfdestruct(processor);
        }
    }
}