import async from 'async'
import { execution } from '@remix-project/remix-lib'
import Web3 from 'web3'
import { compilationInterface } from './types'

/**
 * @dev Deploy all contracts from compilation result
 * @param compileResult compilation result
 * @param web3 web3 object
 * @param withDoubleGas If true, try deployment with gas double of estimation (used for Out-of-gas error only)
 * @param callback Callback
 */

export function deployAll (compileResult: compilationInterface, web3: Web3, testsAccounts, withDoubleGas: boolean, deployCb, callback) {
  const compiledObject = {}
  const contracts = {}
  const accounts: string[] = testsAccounts

  async.waterfall([
    function getContractData (next) {
      for (const contractFile in compileResult) {
        for (const contractName in compileResult[contractFile]) {
          const contract = compileResult[contractFile][contractName]

          const className = contractName
          const filename = contractFile

          const abi = contract.abi
          const code = contract.evm.bytecode.object

          compiledObject[className] = {}
          compiledObject[className].abi = abi
          compiledObject[className].code = code
          compiledObject[className].filename = filename
          compiledObject[className].className = className
          compiledObject[className].raw = contract

          if (contractFile.endsWith('_test.sol')) {
            compiledObject[className].isTest = true
          }
        }
      }
      next()
    },
    function determineContractsToDeploy (next) {
      const contractsToDeploy: string[] = ['Assert']
      const allContracts = Object.keys(compiledObject)

      for (const contractName of allContracts) {
        if (contractName === 'Assert') {
          continue
        }
        if (compiledObject[contractName].isTest) {
          contractsToDeploy.push(contractName)
        }
      }
      next(null, contractsToDeploy)
    },
    function deployContracts (contractsToDeploy: string[], next) {
      const deployRunner = (deployObject, contractObject, contractName, filename, callback) => {
        deployObject.estimateGas().then((gasValue) => {
          const gasBase = Math.ceil(gasValue * 1.2)
          const gas = withDoubleGas ? gasBase * 2 : gasBase
          deployObject.send({
            from: accounts[0],
            gas: gas
          }).on('receipt', async function (receipt) {
            contractObject.options.address = receipt.contractAddress
            contractObject.options.from = accounts[0]
            contractObject.options.gas = 5000 * 1000
            compiledObject[contractName].deployedAddress = receipt.contractAddress

            contracts[contractName] = contractObject
            contracts[contractName].filename = filename

            if (deployCb) await deployCb(filename, receipt.contractAddress)
            callback(null, { receipt: { contractAddress: receipt.contractAddress } }) // TODO this will only work with JavaScriptV VM
          }).on('error', function (err) {
            console.error(err)
            callback(err)
          })
        }).catch((err) => {
          console.error(err)
          callback(err)
        })
      }

      async.eachOfLimit(contractsToDeploy, 1, function (contractName, index, nextEach) {
        const contract = compiledObject[contractName]
        const encodeDataFinalCallback = (error, contractDeployData) => {
          if (error) return nextEach(error)
          const contractObject = new web3.eth.Contract(contract.abi)
          const deployObject = contractObject.deploy({ arguments: [], data: '0x' + contractDeployData.dataHex })
          deployRunner(deployObject, contractObject, contractName, contract.filename, (error) => { nextEach(error) })
        }

        const encodeDataStepCallback = (msg) => { console.dir(msg) }

        const encodeDataDeployLibraryCallback = (libData, callback) => {
          const abi = compiledObject[libData.data.contractName].abi
          const code = compiledObject[libData.data.contractName].code
          const libraryObject = new web3.eth.Contract(abi)
          const deployObject = libraryObject.deploy({ arguments: [], data: '0x' + code })
          deployRunner(deployObject, libraryObject, libData.data.contractName, contract.filename, callback)
        }

        const funAbi = null // no need to set the abi for encoding the constructor
        const params = '' // we suppose that the test contract does not have any param in the constructor
        execution.txFormat.encodeConstructorCallAndDeployLibraries(contractName, contract.raw, compileResult, params, funAbi, encodeDataFinalCallback, encodeDataStepCallback, encodeDataDeployLibraryCallback)
      }, function (err) {
        if (err) return next(err)
        next(null, contracts)
      })
    }
  ], callback)
}
