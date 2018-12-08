const rr = require('../dist/index.js')
const assert = require('assert')
const fs = require('fs')
const path = require('path')

describe('testRunner', function () {
  describe('#resolve', function() {
    describe('test example_1 [local imports]]', function () {
      let filename = '../remix-resolve/tests/example_1/greeter.sol'
      let results = {}

      before(function (done) {
        const resolver = new rr.ImportResolver()
        var sources = []
        function handleLocal(pathString, filePath) {
          // if no relative/absolute path given then search in node_modules folder
          if (pathString && pathString.indexOf('.') !== 0 && pathString.indexOf('/') !== 0) {
            return handleNodeModulesImport(pathString, filePath, pathString)
          } else {
            const o = { encoding: 'UTF-8' }
            const p = pathString ? path.resolve(pathString, filePath) : path.resolve(pathString, filePath)
            const content = fs.readFileSync(p, o)
            return content
          }
        }
        const localFSHandler = [
          {
            type: 'local',
            match: (url) => { return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(url) },
            handle: (match) => { return handleLocal(match[2], match[3]) }
          }
        ]
        resolver.resolve(filename, localFSHandler)
          .then(sources => {
            results = sources
            done()
          })
          .catch(e => {
            throw e
          })
      })

      it('should have 3 items', function () {
        assert.equal(Object.keys(results).length, 3)
      })

      it('should returns contract content of given local path', function () {
        const expt = {
          content: 'pragma solidity ^0.5.0;\nimport "./mortal.sol";\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n',
          cleanURL: '../remix-resolve/tests/example_1/greeter.sol',
          type: 'local'
        }
        assert.deepEqual(results, expt)
      })
    })
  })
})
