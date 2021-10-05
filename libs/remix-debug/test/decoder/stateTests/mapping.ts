import { compilerInput } from '../../helpers/compilerHelper'
import { TraceManager } from '../../../src/trace/traceManager'
import { compile } from 'solc'
import * as stateDecoder from '../../../src/solidity-decoder/stateDecoder'
import * as vmCall from '../../vmCall'
import { StorageResolver } from '../../../src/storage/storageResolver'
import { StorageViewer } from '../../../src/storage/storageViewer'
import {  Address, bufferToHex } from 'ethereumjs-util'

module.exports = async function testMappingStorage (st, cb) {
  var mappingStorage = require('../contracts/mappingStorage')
  var privateKey = Buffer.from('503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb', 'hex')
  var output = compile(compilerInput(mappingStorage.contract))
  output = JSON.parse(output);
  const web3 = await (vmCall as any).getWeb3();
  (vmCall as any).sendTx(web3, {nonce: 0, privateKey: privateKey}, null, 0, output.contracts['test.sol']['SimpleMappingState'].evm.bytecode.object, function (error, hash) {
    if (error) {
      console.log(error)
      st.end(error)
    } else {
      web3.eth.getTransactionReceipt(hash, (error, tx) => {
        if (error) {
          console.log(error)
          st.end(error)
        } else {
          // const storage = await this.vm.stateManager.dumpStorage(data.to)
          // (vmCall as any).web3().eth.getCode(tx.contractAddress).then((code) => console.log('code:', code))
          // (vmCall as any).web3().debug.traceTransaction(hash).then((code) => console.log('trace:', code))
          testMapping(st, privateKey, tx.contractAddress, output, web3, cb)
          // st.end()
        }
      })
    }
  })
}

function testMapping (st, privateKey, contractAddress, output, web3, cb) {
  (vmCall as any).sendTx(web3, {nonce: 1, privateKey: privateKey}, contractAddress, 0, '2fd0a83a00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001074686973206973206120737472696e6700000000000000000000000000000000',
        function (error, hash) {
          if (error) {
            console.log(error)
            st.end(error)
          } else {            
            web3.eth.getTransaction(hash, (error, tx) => {
              if (error) {
                console.log(error)
                st.end(error)
              } else {
                var traceManager = new TraceManager({web3})
                traceManager.resolveTrace(tx).then(() => {
                  var storageViewer = new StorageViewer({
                    stepIndex: 268,
                    tx: tx,
                    address: contractAddress
                  }, new StorageResolver({web3}), traceManager)
                  var stateVars = stateDecoder.extractStateVariables('SimpleMappingState', output.sources)
                  stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
                    st.equal(result['_num'].value, '1')
                    st.equal(result['_num'].type, 'uint256')
                    st.equal(result['_iBreakSolidityState'].type, 'mapping(string => uint256)')
                    st.equal(result['_iBreakSolidityState'].value['74686973206973206120737472696e67'].value, '1')
                    st.equal(result['_iBreakSolidityState'].value['74686973206973206120737472696e67'].type, 'uint256')
                    st.equal(result['_iBreakSolidityStateInt'].type, 'mapping(uint256 => uint256)')
                    st.equal(result['_iBreakSolidityStateInt'].value['0000000000000000000000000000000000000000000000000000000000000001'].value, '1')
                    st.equal(result['_iBreakSolidityStateInt'].value['0000000000000000000000000000000000000000000000000000000000000001'].type, 'uint256')
                    cb()
                  }, (reason) => {
                    console.log('fail')
                    st.end(reason)
                  })
                })
              }
            })
          }
        })
}
