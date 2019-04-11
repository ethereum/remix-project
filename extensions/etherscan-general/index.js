/* global XMLHttpRequest */
var remix = new window.RemixExtension()
var container
var updateBtn
var network
var currentNetWork = ''
var networks = {
  'Main': '',
  'Ropsten': 'ropsten',
  'Kovan': 'kovan',
  'Rinkeby': 'rinkeby'
}

function load () {
  container = document.getElementById('container')
  updateBtn = document.getElementById('updateBtn')
  network = document.getElementById('network')

  var log = function (call, msg) {
    container.innerHTML += '<div>' + call + ': ' + msg + '</div>'
  }

  updateBtn.addEventListener('click', function () {
    container.innerHTML = ''
    if (networks[currentNetWork] !== undefined) {
      getBlockNumber(log)
      getLatestBlockInfo(log)
      getGasPrice(log)
    } else {
      container.innerHTML = 'current network not available through etherscan API'
    }
  })

  getToken(function (error, result) {
    if (error) console.log(error)
    if (!result) {
      remix.call('config', 'setConfig', ['config.json', '{ apikey: "" }'], function (error, result) {
        if (error) return console.log(error)
      })
    }
  })
  setInterval(function () {
    remix.call('network', 'detectNetWork', [], function (error, result) {
      if (error) console.log(error)
      if (network.innerHTML !== result[0].name + ' - ' + result[0].id) {
        currentNetWork = result[0].name
        container.innerHTML = ''
        network.innerHTML = result[0].name + ' - ' + result[0].id
      }
    })
  }, 1000)
}

function getToken (callback) {
  remix.call('config', 'getConfig', ['config.json'], function (error, result) {
    if (error) return callback(error)
    if (result[0]) {
      try {
        result = JSON.parse(result[0])
      } catch (e) {
        return callback(e.message)
      }
      callback(null, result.apikey)
    } else {
      container.innerHTML = 'no api key found'
      callback('no api key found')
    }
  })
}

function httpGetAsync (url, callback) {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.responseText)
    }
  }
  xmlHttp.open('GET', url, true)
  xmlHttp.send(null)
}

function getBlockNumber (callback) {
  getToken(function (error, apikey) {
    if (error) console.log(error)
    httpGetAsync('https://api-' + networks[currentNetWork] + '.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=' + apikey, function (result) {
      callback('latest block number', result)
    })
  })
}

function getLatestBlockInfo (callback) {
  getToken(function (error, apikey) {
    if (error) console.log(error)
    httpGetAsync('https://api-' + networks[currentNetWork] + '.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=true&apikey=' + apikey, function (result) {
      callback('latest block', result)
    })
  })
}

function getGasPrice (callback) {
  getToken(function (error, apikey) {
    if (error) console.log(error)
    httpGetAsync('https://api-' + networks[currentNetWork] + '.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=' + apikey, function (result) {
      callback('current gas price', result)
    })
  })
}

setTimeout(load, 1000)
