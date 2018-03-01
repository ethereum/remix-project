var spawn = require('child_process').spawn
var stdout = require('stdout')
var autoMine = require('./autoMine')
var Web3 = require('web3')
var net = require('net')

var connectTimeout
module.exports = function (dataDir, mist, geth, mine, rpc, rpcPort) {
  console.log('opening dev env at ' + dataDir)
  // geth --vmdebug --dev --ipcpath /home/yann/Ethereum/testchains/test2/geth.ipc --datadir /home/yann/Ethereum/testchains/test2
  var gethprocess
  if (geth) {
    var ipcPath = dataDir + '/geth.ipc'
    var gethArgs = [
      '--vmdebug',
      '--dev',
      '--ipcpath', ipcPath,
      '--datadir', dataDir
    ]
    if (rpc) {
      gethArgs.push('--rpc')
      gethArgs.push('--rpccorsdomain')
      gethArgs.push(rpc)
      gethArgs.push('--rpcapi')
      gethArgs.push('web3,eth,debug,net')
      if (!rpcPort) {
        rpcPort = 8545
      }
      gethArgs.push('--rpcport')
      gethArgs.push(rpcPort)
    }
    console.log(gethArgs)
    console.log('starting geth ... ')
    gethprocess = run('geth', gethArgs)

    connectTimeout = setInterval(() => {
      connectWeb3(ipcPath, (web3) => {
        clearInterval(connectTimeout)
        if (mine) {
          autoMine(web3)
        }
      })
    }, 1000)
  }

  // mist --rpc /home/yann/Ethereum/testchains/test2/geth.ipc
  var mistprocess
  if (mist) {
    const mistArgs = [
      '--rpc', ipcPath
    ]
    console.log('starting mist ...')
    mistprocess = run('mist', mistArgs)
  }

  function kill () {
    if (connectTimeout) {
      clearInterval(connectTimeout)
    }
    if (mistprocess) {
      console.log('stopping mist')
      mistprocess.kill()
    }
    if (gethprocess) {
      console.log('stopping geth')
      gethprocess.kill()
    }
  }

  return kill
}

function connectWeb3 (ipcpath, cb) {
  try {
    console.log('connect to ' + ipcpath)
    var web3 = new Web3(new Web3.providers.IpcProvider(ipcpath, net))
    web3.eth.getBlockNumber(function (error) {
      if (error) {
        console.log('still trying to connect to node... ' + error)
      } else {
        console.log('web3', web3.version)
        cb(web3)
      }
    })
  } catch (e) {}
}

function run (app, args) {
  var proc
  try {
    proc = spawn(app, args)
    proc.on('error', (err) => {
      console.log('\x1b[31m%s\x1b[0m', '[ERR] can\'t start ' + app + '. seems not installed')
      console.log(err)
    })
    proc.stdout.pipe(stdout())
  } catch (e) {
  }
  return proc
}
