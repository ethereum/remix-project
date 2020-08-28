var tape = require('tape')
var remixLib = require('@remix-project/remix-lib')
var compilerInput = require('./helpers/compilerHelper').compilerInput
var SourceMappingDecoder = require('../src/source/sourceMappingDecoder')

var vmCall = require('./vmCall')
var Debugger = require('../src/Ethdebugger')
var compiler = require('solc')

var ballot = `pragma solidity >=0.4.22 <0.7.0;

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract Ballot {
   
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        // If you can limit the length to a certain number of bytes, 
        // always use one of bytes1 to bytes32 because they are much cheaper
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    /** 
     * @dev Create a new ballot to choose one of 'proposalNames'.
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames) public {
        uint p = 45;
        chairperson = msg.sender;
        address addressLocal = msg.sender; // copy of state variable
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            // 'Proposal({...})' creates a temporary
            // Proposal object and 'proposals.push(...)'
            // appends it to the end of 'proposals'.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
        Proposal[] storage proposalsLocals = proposals; // copy of state variable        
    }
    
    /** 
     * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
     * @param voter address of voter
     */
    function giveRightToVote(address voter) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /**
     * @dev Give your vote (including votes delegated to you) to proposal 'proposals[proposal].name'.
     * @param proposal index of proposal in the proposals array
     */
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        // If 'proposal' is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    /** 
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /** 
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
`

var BreakpointManager = require('../src/code/breakpointManager')

var privateKey = Buffer.from('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
var vm = vmCall.initVM(privateKey)
var output = compiler.compile(compilerInput(ballot))
output = JSON.parse(output)
var web3VM = new remixLib.vm.Web3VMProvider()
web3VM.setVM(vm)
const param = '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000148656c6c6f20576f726c64210000000000000000000000000000000000000000'
vmCall.sendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, output.contracts['test.sol']['Ballot'].evm.bytecode.object + param, (error, txHash) => {
  console.log(error, txHash)
  if (error) {
    throw error
  } else {
    web3VM.eth.getTransaction(txHash, (error, tx) => {
      if (error) {
        throw error
      } else {
        var debugManager = new Debugger({
          compilationResult: function () {
            return { data: output }
          },
          web3: web3VM
        })

        debugManager.callTree.event.register('callTreeReady', () => {
          testDebugging(debugManager)
        })
        debugManager.callTree.event.register('callTreeNotReady', (error) => {
          console.error(error)
          throw error
        })
        debugManager.callTree.event.register('callTreeBuildFailed', (error) => {
          console.error(error)
          throw error
        })

        debugManager.debug(tx)
      }
    })
  }
})

function testDebugging (debugManager) {
  // stack
  tape('traceManager.getStackAt 4', (t) => {
    t.plan(1)
    try {
      const callstack = debugManager.traceManager.getStackAt(4)
      t.equal(JSON.stringify(callstack), JSON.stringify(['0x0000000000000000000000000000000000000000000000000000000000000000']))
    } catch (error) {
      return t.end(error)
    }
  })

  tape('traceManager.getStackAt 41', (t) => {
    t.plan(1)
    try {
      const callstack = debugManager.traceManager.getStackAt(41)
      t.equal(JSON.stringify(callstack), JSON.stringify([
        '0x0000000000000000000000000000000000000000000000000000000000000080',
        '0x0000000000000000000000000000000000000000000000000000000000000020',
        '0x0000000000000000000000000000000000000000000000000000000000000080',
        '0x00000000000000000000000000000000000000000000000000000000000000e0',
        '0x00000000000000000000000000000000000000000000000000000000000000e0']))
    } catch (error) {
      return t.end(error)
    }
  })

  // storage
  tape('traceManager.getCurrentCalledAddressAt', (t) => {
    t.plan(1)

    try {
      const address = debugManager.traceManager.getCurrentCalledAddressAt(38)
      console.log(address)
      var storageView = debugManager.storageViewAt(196, address)

      storageView.storageRange().then((storage) => {
        t.equal(JSON.stringify(storage), JSON.stringify({ '0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563': { key: '0x0000000000000000000000000000000000000000000000000000000000000000', value: '0x0000000000000000000000004b0897b0513fdc7c541b6d9d7e929c4e5364d2db' } }))
      }).catch((error) => {
        if (error) return t.end(error)
      })
    } catch (error) {
      return t.end(error)
    }
  })

  tape('traceManager.decodeStateAt', async (t) => {
    t.plan(7)
    try {
      const state = await debugManager.extractStateAt(312)
      const decodedState = await debugManager.decodeStateAt(312, state)
      console.log(decodedState)
      t.equal(decodedState['chairperson'].value, '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB')
      t.equal(decodedState['chairperson'].type, 'address')
      t.equal(decodedState['proposals'].value[0].value.voteCount.value, '0')
      t.equal(decodedState['proposals'].value[0].value.voteCount.type, 'uint256')
      t.equal(decodedState['proposals'].value[0].type, 'struct Ballot.Proposal')
      t.equal(decodedState['proposals'].length, '0x1')
      t.equal(decodedState['proposals'].type, 'struct Ballot.Proposal[]')
    } catch (error) {
      if (error) return t.end(error)
    }
  })

  tape('traceManager.decodeLocalsAt', async (t) => {
    t.plan(1)
    const tested = JSON.parse('{"proposalNames":{"value":[{"value":"0x48656C6C6F20576F726C64210000000000000000000000000000000000000000","type":"bytes32"}],"length":"0x1","type":"bytes32[]"},"p":{"value":"45","type":"uint256"},"addressLocal":{"value":"0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB","type":"address"},"i":{"value":"2","type":"uint256"},"proposalsLocals":{"value":[{"value":{"name":{"value":"0x48656C6C6F20576F726C64210000000000000000000000000000000000000000","type":"bytes32"},"voteCount":{"value":"0","type":"uint256"}},"type":"struct Ballot.Proposal"}],"length":"0x1","type":"struct Ballot.Proposal[]"}}')
    try {
      const address = debugManager.traceManager.getCurrentCalledAddressAt(330)
      const location = await debugManager.sourceLocationFromVMTraceIndex(address, 330)
      debugManager.decodeLocalsAt(330, location, (error, decodedlocals) => {
        if (error) return t.end(error)
        t.equal(JSON.stringify(decodedlocals), JSON.stringify(tested))
      })
    } catch (error) {
      return t.end(error)
    }
  })

  tape('breakPointManager', (t) => {
    t.plan(2)
    var sourceMappingDecoder = new SourceMappingDecoder()
    const {traceManager, callTree, solidityProxy} = debugManager
    var breakPointManager = new BreakpointManager({traceManager, callTree, solidityProxy, locationToRowConverter: async (rawLocation) => {
      return sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, sourceMappingDecoder.getLinebreakPositions(ballot))
    }})

    breakPointManager.event.register('managersChanged', () => {
      const {traceManager, callTree, solidityProxy} = debugManager
      breakPointManager.setManagers({traceManager, callTree, solidityProxy})
    })

    breakPointManager.add({fileName: 'test.sol', row: 38})

    breakPointManager.event.register('breakpointHit', function (sourceLocation, step) {
      console.log('breakpointHit')
      t.equal(JSON.stringify(sourceLocation), JSON.stringify({ start: 1153, length: 6, file: 0, jump: '-' }))
      t.equal(step, 212)
    })

    breakPointManager.event.register('noBreakpointHit', function () {
      t.end('noBreakpointHit')
      console.log('noBreakpointHit')
    })
    breakPointManager.jumpNextBreakpoint(0, true)
  })
}
