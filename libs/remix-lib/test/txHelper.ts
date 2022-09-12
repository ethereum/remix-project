'use strict'
import tape from 'tape'
import * as txHelper from '../src/execution/txHelper'

tape('getFunction', function (st) {
  st.plan(6)
  let fn = txHelper.getFunction(JSON.parse(abi), 'o((address,uint256))')
  st.equal(fn.name, 'o')

  fn = txHelper.getFunction(JSON.parse(abi), 'i(bytes32)')
  st.equal(fn.name, 'i')

  fn = txHelper.getFunction(JSON.parse(abi), 'o1(string,(address,uint256),int256,int256[][3],(address,uint256)[3][])')
  st.equal(fn.name, 'o1')

  fn = txHelper.getConstructorInterface(JSON.parse(abi))
  st.equal(fn.type, 'constructor')

  fn = txHelper.getFallbackInterface(JSON.parse(abi))
  st.equal(fn.type, 'fallback')

  fn = txHelper.getReceiveInterface(JSON.parse(abi))
  st.equal(fn.type, 'receive')

  fn = txHelper.getFunction(testTupleAbi, 'setUser(tuple)') // some compiler version might resolve to tuple.
  st.equal(fn.name, 'setUser')
  st.equal(fn.inputs[0].type, 'tuple')
  st.equal(fn.inputs[0].name, 'user')

  fn = txHelper.getFunctionLiner(testTupleAbi[0], true)
  st.equal(fn, 'setUser((string,uint256))')
  
  fn = txHelper.getFunctionLiner(testTupleAbi[0], false)
  st.equal(fn, 'setUser(tuple)')
})

const abi = `[
	{
		"constant": false,
		"inputs": [
			{
				"name": "_param",
				"type": "bytes32"
			}
		],
		"name": "i",
		"outputs": [
			{
				"name": "_t",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_g",
				"type": "string"
			},
			{
				"components": [
					{
						"name": "addr",
						"type": "address"
					},
					{
						"name": "age",
						"type": "uint256"
					}
				],
				"name": "_p",
				"type": "tuple"
			},
			{
				"name": "_pg",
				"type": "int256"
			},
			{
				"name": "",
				"type": "int256[][3]"
			},
			{
				"components": [
					{
						"name": "addr",
						"type": "address"
					},
					{
						"name": "age",
						"type": "uint256"
					}
				],
				"name": "",
				"type": "tuple[3][]"
			}
		],
		"name": "o1",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"components": [
					{
						"name": "addr",
						"type": "address"
					},
					{
						"name": "age",
						"type": "uint256"
					}
				],
				"name": "_p",
				"type": "tuple"
			}
		],
		"name": "o",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_g",
				"type": "bytes32"
			},
			{
				"components": [
					{
						"name": "addr",
						"type": "address"
					},
					{
						"name": "age",
						"type": "uint256"
					}
				],
				"name": "u",
				"type": "tuple"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "fallback"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "receive"
	}
]`

const testTupleAbi = [{"inputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"age","type":"uint256"}],"internalType":"struct Example.User","name":"user","type":"tuple"}],"name":"setUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userByAddress","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"age","type":"uint256"}],"stateMutability":"view","type":"function"}]