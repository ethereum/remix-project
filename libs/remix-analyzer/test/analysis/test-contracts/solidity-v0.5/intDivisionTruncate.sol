pragma solidity >=0.4.9 <0.6.0;

contract CharityCampaign {
    mapping (address => uint) contributions; 
    int128 feePercentage;
    uint p2;
    address payable processor;
    address payable beneficiary;

    constructor(address payable _beneficiary, int128 _feePercentage) public {
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
        if(msg.sender == address(0x0)) {
            selfdestruct(beneficiary);
        } else {
            selfdestruct(processor);
        }
    }
}