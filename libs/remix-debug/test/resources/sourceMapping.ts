const sourceRuntimeMapping = {}
sourceRuntimeMapping['mapping'] = '0:205:4:-;;;;;;;;;;;;;;;;;;;;;;55:74;;;;;;;;;;;;;;;;;;;;;;;;;;142:61;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;55:74;103:2;99:1;;:6;;;;;120:2;116:1;;:6;;;;;55:74;;;:::o;142:61::-;166:6;174;142:61;;;:::o'
sourceRuntimeMapping['source'] = `contract test { 
    int x; 
    
    int y; 
    
    function set(int _x, int _y) 
    {
        x = _x; 
        y = _y;
    } 
      
    function get() returns (uint x, uint y) 
    {
        
    }
}`

sourceRuntimeMapping['tokenSaleChallengeSourceMap'] = '0:286:0:-:0;;;;5:9:-1;2:2;;;27:1;24;17:12;2:2;0:286:0;;;;;;;;;;;;;;;;;;;;;12:1:-1;9;2:12;34:44:0;;;;;;15:2:-1;10:3;7:11;4:2;;;31:1;28;21:12;4:2;34:44:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;161:123;;;:::i;:::-;;;;;;;;;;;;;;;;;;;34:44;;;;;;;;;;;;;;;;;:::o;161:123::-;192:7;211:10;:19;;:48;119:7;231:9;;:27;211:48;;;;;;;;;;;;;;;;;;;;;;;;8:9:-1;5:2;;;45:16;42:1;39;24:38;77:16;74:1;67:27;5:2;211:48:0;276:1;269:8;;161:123;:::o'
sourceRuntimeMapping['tokenSaleChallengeSource'] = `
contract TokenSaleChallenge {
    mapping(address => uint256) public balanceOf;
    uint256 constant PRICE_PER_TOKEN = 1 ether;
    uint256 numTokens = 30;

    function test() public returns(uint256) {
        msg.sender.transfer(numTokens * PRICE_PER_TOKEN);
        return 2;
    }
}
`

sourceRuntimeMapping['ballotSourceMap'] = '33:1970:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;33:1970:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;712:577;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;712:577:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;1641:360;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;495:164;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;495:164:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;1349:286;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;1349:286:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;712:577;759:20;782:6;:18;789:10;782:18;;;;;;;;;;;;;;;759:41;;835:6;:12;;;;;;;;;;;;831:25;;;849:7;;;831:25;865:115;903:1;872:33;;:6;:10;879:2;872:10;;;;;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;;:70;;;;;932:10;909:33;;:6;:10;916:2;909:10;;;;;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;;872:70;865:115;;;961:6;:10;968:2;961:10;;;;;;;;;;;;;;;:19;;;;;;;;;;;;956:24;;865:115;;;1000:10;994:16;;:2;:16;;;990:29;;;1012:7;;;990:29;1043:4;1028:6;:12;;;:19;;;;;;;;;;;;;;;;;;1075:2;1057:6;:15;;;:20;;;;;;;;;;;;;;;;;;1087:24;1114:6;:10;1121:2;1114:10;;;;;;;;;;;;;;;1087:37;;1138:10;:16;;;;;;;;;;;;1134:148;;;1208:6;:13;;;1168:9;1178:10;:15;;;;;;;;;;;;1168:26;;;;;;;;;;;;;;;;;:36;;;:53;;;;;;;;;;;1134:148;;;1269:6;:13;;;1248:10;:17;;;:34;;;;;;;;;;;1134:148;712:577;;;;:::o;1641:360::-;1689:22;1723:24;1750:1;1723:28;;1766:10;1779:1;1766:14;;1761:234;1789:9;:16;;;;1782:4;:23;;;1761:234;;;1859:16;1831:9;1841:4;1831:15;;;;;;;;;;;;;;;;;:25;;;:44;1827:168;;;1914:9;1924:4;1914:15;;;;;;;;;;;;;;;;;:25;;;1895:44;;1976:4;1957:23;;1827:168;1807:6;;;;;;;1761:234;;;;1641:360;;:::o;495:164::-;572:11;;;;;;;;;;;558:25;;:10;:25;;;;:50;;;;587:6;:15;594:7;587:15;;;;;;;;;;;;;;;:21;;;;;;;;;;;;558:50;554:63;;;610:7;;554:63;651:1;626:6;:15;633:7;626:15;;;;;;;;;;;;;;;:22;;:26;;;;495:164;;:::o;1349:286::-;1398:20;1421:6;:18;1428:10;1421:18;;;;;;;;;;;;;;;1398:41;;1453:6;:12;;;;;;;;;;;;:46;;;;1483:9;:16;;;;1469:10;:30;;;;1453:46;1449:59;;;1501:7;;;1449:59;1532:4;1517:6;:12;;;:19;;;;;;;;;;;;;;;;;;1560:10;1546:6;:11;;;:24;;;;;;;;;;;;;;;;;;1615:6;:13;;;1580:9;1590:10;1580:21;;;;;;;;;;;;;;;;;:31;;;:48;;;;;;;;;;;1349:286;;;:::o'
sourceRuntimeMapping['ballotSource'] = `
pragma solidity >=0.4.22 <0.6.0;
contract Ballot {

    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
    }

    struct Proposal {
        uint voteCount;
    }

    address chairperson;
    mapping(address => Voter) voters;
    Proposal[] proposals;
    
    function () external {
        
    }

   
    /// Give $(toVoter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
    /// @notice something 2
    function giveRightToVote(address toVoter) public {
        if (msg.sender != chairperson || voters[toVoter].voted) return;
        voters[toVoter].weight = 1;
    }

    /// Delegate your vote to the voter $(to).
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender]; // assigns reference
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegateTo = voters[to];
        if (delegateTo.voted)
            proposals[delegateTo.vote].voteCount += sender.weight;
        else
            delegateTo.weight += sender.weight;
    }

    /// Give a single vote to proposal $(toProposal).
    function vote(uint8 toProposal) public {
        Voter storage sender = voters[msg.sender];
        if (sender.voted || toProposal >= proposals.length) return;
        sender.voted = true;
        sender.vote = toProposal;
        proposals[toProposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint8 _winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++)
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                _winningProposal = prop;
            }
    }
}
`
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = sourceRuntimeMapping
}
