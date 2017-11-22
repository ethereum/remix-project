module.exports = function (web3) {
  console.log('auto mine transactions')

  var methods = []
  methods.push({
    name: 'start',
    call: 'miner_start',
    inputFormatter: [null],
    params: 1
  })
  methods.push({
    name: 'stop',
    call: 'miner_stop',
    inputFormatter: [],
    params: 0
  })
  web3.extend({
    property: 'miner',
    methods: methods,
    properties: []
  })

  var timeOutId
  web3.eth.subscribe('pendingTransactions', (error, result) => {
    if (error) {
      console.log(error)
    } else {
      console.log('start or continue mining')
      web3.miner.start()
      if (timeOutId) clearTimeout(timeOutId)
      timeOutId = setTimeout(() => {
        console.log('stop mining')
        web3.miner.stop()
      }, 30000)
    }
  })
}
