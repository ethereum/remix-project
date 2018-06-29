'use strict'
var tape = require('tape')
var remixLib = require('remix-lib')
var compilerInput = remixLib.helpers.compiler.compilerInput
var vmCall = require('./vmCall')
var Debugger = require('../src/Ethdebugger')
var compiler = require('solc')

require('./decoder/decodeInfo.js')
require('./decoder/storageLocation.js')
require('./decoder/storageDecoder.js')
require('./decoder/localDecoder.js')

var BreakpointManager = remixLib.code.BreakpointManager

tape('debug contract', function (t) {
  t.plan(12)
  var privateKey = new Buffer('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
  var vm = vmCall.initVM(t, privateKey)
  var output = compiler.compileStandardWrapper(compilerInput(ballot))
  output = JSON.parse(output)
  var web3VM = new remixLib.vm.Web3VMProvider()
  web3VM.setVM(vm)
  vmCall.sendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, output.contracts['test.sol']['Ballot'].evm.bytecode.object, (error, txHash) => {
    if (error) {
      t.end(error)
    } else {
      web3VM.eth.getTransaction(txHash, (error, tx) => {
        if (error) {
          t.end(error)
        } else {
          var debugManager = new Debugger({
            compilationResult: function () {
              return output
            }
          })

          debugManager.addProvider('web3vmprovider', web3VM)
          debugManager.switchProvider('web3vmprovider')

          debugManager.callTree.event.register('callTreeReady', () => {
            testDebugging(t, debugManager)
          })

          debugManager.debug(tx)
        }
      })
    }
  })
})


function testDebugging (t, debugManager) {
  // stack
  debugManager.traceManager.getStackAt(4, (error, callstack) => {
    if (error) return t.end(error)
    t.equal(JSON.stringify(callstack), JSON.stringify([ '0x0000000000000000000000000000000000000000000000000000000000000000' ]))
  })

  debugManager.traceManager.getStackAt(41, (error, callstack) => {
    if (error) return t.end(error)

    /*
    t.equal(JSON.stringify(callstack), JSON.stringify(['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000004b0897b0513fdc7c541b6d9d7e929c4e5364d2db', '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000001', '0x000000000000000000000000000000000000000000000000000000000000002d']))
    */
  })

  // storage
  debugManager.traceManager.getCurrentCalledAddressAt(38, (error, address) => {
    if (error) return t.end(error)
    var storageView = debugManager.storageViewAt(38, address)
    storageView.storageRange((error, storage) => {
      if (error) return t.end(error)
      t.equal(JSON.stringify(storage), JSON.stringify({ '0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563': { key: '0x0000000000000000000000000000000000000000000000000000000000000000', value: '0x0000000000000000000000004b0897b0513fdc7c541b6d9d7e929c4e5364d2db' } }))
    })
  })

  debugManager.extractStateAt(116, (error, state) => {
    if (error) return t.end(error)
    debugManager.decodeStateAt(116, state, (error, decodedState) => {
      if (error) return t.end(error)
      t.equal(decodedState['chairperson'].value, '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB')
      t.equal(decodedState['chairperson'].type, 'address')
      t.equal(decodedState['proposals'].value[0].value.voteCount.value, '0')
      t.equal(decodedState['proposals'].value[0].value.voteCount.type, 'uint256')
      t.equal(decodedState['proposals'].value[0].type, 'struct Ballot.Proposal')
      t.equal(decodedState['proposals'].length, '0x1')
      t.equal(decodedState['proposals'].type, 'struct Ballot.Proposal[]')
    })
  })

  debugManager.traceManager.getCurrentCalledAddressAt(104, (error, address) => {
    if (error) return t.end(error)
    debugManager.sourceLocationFromVMTraceIndex(address, 104, (error, location) => {
      if (error) return t.end(error)
      debugManager.decodeLocalsAt(104, location, (error, decodedlocals) => {
        if (error) return t.end(error)
        t.equal(JSON.stringify(decodedlocals), JSON.stringify({'p': {'value': '45', 'type': 'uint256'}, 'addressLocal': {'value': '0x4B0897B0513FDC7C541B6D9D7E929C4E5364D2DB', 'type': 'address'}, 'proposalsLocals': {'value': [{'value': {'voteCount': {'value': '0', 'type': 'uint256'}}, 'type': 'struct Ballot.Proposal'}], 'length': '0x1', 'type': 'struct Ballot.Proposal[]'}}))
      })
    })
  })

  var sourceMappingDecoder = new remixLib.SourceMappingDecoder()
  var breakPointManager = new BreakpointManager(debugManager, (rawLocation) => {
    return sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, sourceMappingDecoder.getLinebreakPositions(ballot))
  })

  breakPointManager.add({fileName: 'test.sol', row: 23})

  breakPointManager.event.register('breakpointHit', function (sourceLocation, step) {
    console.log('breakpointHit')
    t.equal(JSON.stringify(sourceLocation), JSON.stringify({ start: 591, length: 1, file: 0, jump: '-' }))
    t.equal(step, 75)
  })

  breakPointManager.event.register('noBreakpointHit', function () {
    t.end('noBreakpointHit')
    console.log('noBreakpointHit')
  })
  breakPointManager.jumpNextBreakpoint(0, true)
}

var ballot = `pragma solidity ^0.4.0;
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

    /// Create a new ballot with $(_numProposals) different proposals.
    function Ballot() public {
        uint p = 45;
        chairperson = msg.sender;
        address addressLocal = msg.sender; // copy of state variable
        voters[chairperson].weight = 1;
        proposals.length = 1;
        Proposal[] proposalsLocals = proposals; // copy of state variable
    }

    /// Give $(toVoter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
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

    function winningProposal() public constant returns (uint8 _winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++)
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                _winningProposal = prop;
            }
    }
}`
