var which = require('which')

var geth = null
var eth = null

try {
  geth = which.sync('geth')
} catch (e) {
}

try {
  eth = which.sync('eth')
} catch (e) {
}
if (process.argv.length > 2) {
  if (geth && process.argv[2] === 'geth') {
    runGeth()
  } else if (eth && process.argv[2] === 'eth') {
    runEth()
  }
} else if (geth && eth) {
  console.log('both eth and geth has been found in your system')
  console.log('restart the command with the desired client:')
  console.log('npm run start_eth')
  console.log('or')
  console.log('npm run start_geth')
} else if (geth) {
  runGeth()
} else if (eth) {
  runEth()
} else {
  console.log('neither eth or geth has been found in your system')
}

function runEth () {
  console.log('starting eth...')
  process.exit(20)
}

function runGeth () {
  console.log('starting geth...')
  process.exit(21)
}
