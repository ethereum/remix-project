
/*
test contract creation
*/
var addrResolverByteCode = '0x6060604052341561000f57600080fd5b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061033c8061005f6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806338cc483114610067578063767800de146100bc578063a6f9dae114610111578063d1d80fdf1461014a575b600080fd5b341561007257600080fd5b61007a610183565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100c757600080fd5b6100cf6101ac565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561011c57600080fd5b610148600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506101d1565b005b341561015557600080fd5b610181600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610271565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561022d57600080fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156102cd57600080fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505600a165627a7a723058201b23355f578cb9a23c0a43a440ab2631b62df7be0a8e759812a70f01344224da0029'

const addrResolverTx = {
  gasLimit: '0x2710',
  from: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  data: addrResolverByteCode,
  value: '0x00',
  useCall: false
}

function receiveMessage (event) {
  console.log('receiveMessage', event.data, event.source, event.origin)
  document.getElementById('compilationdata').innerHTML += event.data + '<br>'
}
window.addEventListener('message', receiveMessage, false)

window.onload = function () {
  document.querySelector('input#testmessageadd').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'setConfig',
      value: [document.getElementById('filename').value, document.getElementById('valuetosend').value],
      id: 34
    }), '*')
  })

  document.querySelector('input#testmessageremove').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'removeConfig',
      value: [document.getElementById('filename').value],
      id: 35
    }), '*')
  })

  document.querySelector('input#testmessagerget').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'getConfig',
      value: [document.getElementById('filename').value],
      id: 36
    }), '*')
  })

  document.querySelector('input#testcontractcreation').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'udapp',
      type: 'runTx',
      value: [addrResolverTx],
      id: 37
    }), '*')
  })

  document.querySelector('input#testaccountcreation').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'udapp',
      type: 'createVMAccount',
      value: ['71975fbf7fe448e004ac7ae54cad0a383c3906055a75468714156a07385e96ce', '0x56BC75E2D63100000'],
      id: 38
    }), '*')
  })
  var k = 0
  document.querySelector('input#testchangetitle').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'app',
      type: 'updateTitle',
      value: ['changed title ' + k++],
      id: 39
    }), '*')
  })
}
